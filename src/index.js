/**
 * 쿠팡 파트너스 상품 관리 도구
 * 메인 실행 파일
 */

require('dotenv').config();

const CoupangPartnersClient = require('./api/coupangClient');
const ProductCollector = require('./services/productCollector');
const ReviewDraftGenerator = require('./services/reviewDraftGenerator');
const DraftManager = require('./services/draftManager');
const DuplicateChecker = require('./services/duplicateChecker');
const PersonalReviewGenerator = require('./services/personalReviewGenerator');
const ImageDownloader = require('./services/imageDownloader');
const ProductFilter = require('./services/productFilter');
const TelegramNotifier = require('./services/telegramNotifier');
const BlogPostGenerator = require('./services/blogPostGenerator');
const WordPressPublisher = require('./services/wordpressPublisher');
const RevenueReporter = require('./services/revenueReporter');
const ManualProductManager = require('./services/manualProductManager');

function printUsage() {
  console.log(`
========================================
  쿠팡 파트너스 상품 관리 도구
========================================

사용법:
  npm run search <키워드> [개수]     키워드로 상품 검색 (중복 자동 필터링)
  npm run draft <키워드> [개수]      검색 + 리뷰 초안 생성
  npm run review <키워드> [개수]     검색 + 개인 체험형 리뷰 생성 (3가지 템플릿)
  npm run images <키워드> [개수]     검색 + 상품 이미지 다운로드
  npm run hotdeal <키워드> [개수]    검색 + 핫딜 필터 (할인30%↑ OR 평점4.5↑)
  npm run notify <키워드> [개수]     검색 + 텔레그램 알림 전송
  npm run notify:test                텔레그램 연결 테스트
  npm run blog <키워드> [개수]       검색 + 블로그용 마크다운 생성
  npm run publish <키워드> [개수]    검색 + 워드프레스 자동 포스팅
  npm run wp:test                    워드프레스 연결 테스트
  npm run wp:categories              워드프레스 카테고리 목록
  npm run stats                      초안 통계 확인
  npm run posted                     포스팅 기록 통계 (중복 체크 현황)
  npm run images:stats               다운로드된 이미지 통계
  npm run report                     수익 리포트 (어제 수익 + 베스트셀러)
  npm run report:sample              샘플 CSV 생성 (테스트용)

수동 모드 (API 키 불필요):
  npm run manual:list                수동 등록 상품 목록
  npm run manual:sample              샘플 상품 생성
  npm run manual:publish [카테고리]  수동 상품 워드프레스 포스팅
  npm run manual:notify [카테고리]   수동 상품 텔레그램 알림

예시:
  npm run search "무선 이어폰" 10
  npm run draft "블루투스 스피커" 5
  npm run review "맨투맨" 3
  npm run images "에어팟" 5
  npm run stats
  npm run posted
`);
}

function checkCredentials() {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  if (!accessKey || !secretKey || accessKey === 'your_access_key_here') {
    console.error('========================================');
    console.error('  쿠팡 파트너스 API 자격 증명이 필요합니다!');
    console.error('========================================');
    console.error('');
    console.error('1. .env.example 파일을 .env로 복사하세요:');
    console.error('   cp .env.example .env');
    console.error('');
    console.error('2. .env 파일을 열어 API 키를 입력하세요:');
    console.error('   COUPANG_ACCESS_KEY=발급받은_액세스키');
    console.error('   COUPANG_SECRET_KEY=발급받은_시크릿키');
    console.error('');
    console.error('3. API 키는 https://partners.coupang.com 에서 발급받을 수 있습니다.');
    console.error('');
    return null;
  }

  return { accessKey, secretKey };
}

/**
 * 상품 검색만 수행
 */
async function searchCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);

  console.log(`\n[검색] "${keyword}" (최대 ${limit}개)\n`);

  const result = await collector.collectByKeyword(keyword, limit);

  if (result.success && result.products.length > 0) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const safeKeyword = keyword.replace(/[^가-힣a-zA-Z0-9]/g, '_');
    await collector.saveProducts(result.products, `${safeKeyword}_${timestamp}`);
  }

  console.log('\n========== 검색 완료 ==========\n');
}

/**
 * 검색 + 리뷰 초안 생성
 */
async function draftCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const reviewGenerator = new ReviewDraftGenerator();
  const draftManager = new DraftManager();

  console.log(`\n[검색 + 초안 생성] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeyword(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 리뷰 초안 생성
  const drafts = reviewGenerator.generateBulkDrafts(result.products);

  // 3. 초안 파일 저장
  const savedFiles = await draftManager.saveBulkDrafts(drafts);

  // 4. 결과 요약
  console.log('========== 생성된 초안 ==========\n');
  savedFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file.productName.slice(0, 40)}...`);
    console.log(`   단어 수: ${file.wordCount}, 파일: ${file.filepath.split('/').pop()}`);
  });

  console.log('\n========== 완료 ==========\n');
  console.log('생성된 초안은 data/drafts 폴더에서 확인할 수 있습니다.');
  console.log('발행 전 반드시 직접 검토하고 개인 경험을 추가해주세요.\n');
}

/**
 * 검색 + 개인 체험형 리뷰 생성 (3가지 템플릿 무작위)
 */
async function reviewCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const reviewGenerator = new PersonalReviewGenerator();

  console.log(`\n[검색 + 개인 리뷰 생성] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeyword(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 개인 체험형 리뷰 생성 (템플릿 순환)
  const reviews = reviewGenerator.generateBulkReviews(result.products, {
    rotateTemplates: true // 1, 2, 3 순환
  });

  // 3. 파일 저장
  const savedFiles = await reviewGenerator.saveBulkReviews(reviews);

  // 4. 결과 요약
  console.log('========== 생성된 리뷰 ==========\n');
  savedFiles.forEach((file, i) => {
    console.log(`${i + 1}. [템플릿${file.templateUsed}] ${file.productName.slice(0, 35)}...`);
    console.log(`   단어 수: ${file.wordCount}, 파일: ${file.filepath.split('/').pop()}`);
  });

  console.log('\n========== 완료 ==========\n');
  console.log('생성된 리뷰는 data/reviews 폴더에서 확인할 수 있습니다.');
  console.log('발행 전 반드시 직접 검토하고 개인 경험을 추가해주세요.\n');
}

/**
 * 검색 + 이미지 다운로드
 */
async function imagesCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const imageDownloader = new ImageDownloader();

  console.log(`\n[검색 + 이미지 다운로드] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeyword(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 이미지 다운로드
  const downloadResult = await imageDownloader.downloadBulkImages(result.products, {
    keyword: keyword
  });

  console.log(`이미지가 ${downloadResult.outputDir} 폴더에 저장되었습니다.`);
}

/**
 * 이미지 통계 조회
 */
async function imageStatsCommand() {
  const imageDownloader = new ImageDownloader();
  await imageDownloader.printImageStats();
}

/**
 * 핫딜 필터링 (할인율 30% 이상 OR 평점 4.5점 이상)
 */
async function hotdealCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const filter = new ProductFilter();

  console.log(`\n[검색 + 핫딜 필터] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색 (중복 체크 OFF - 필터링 목적)
  const result = await collector.collectByKeywordRaw(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 핫딜 필터링 (할인 30% 이상 OR 평점 4.5 이상)
  const hotDeals = filter.filterHotDeals(result.products, {
    minDiscountRate: 30,
    minRating: 4.5
  });

  if (hotDeals.length === 0) {
    console.log('조건에 맞는 핫딜 상품이 없습니다.');
    return;
  }

  // 3. 결과 출력
  filter.printFilteredProducts(hotDeals, 10);

  // 4. 통계
  const stats = filter.getFilterStats(result.products, hotDeals);
  console.log('[필터 통계]');
  console.log(`  필터 전: ${stats.original.count}개 (평균 ${stats.original.avgPrice.toLocaleString()}원, 평점 ${stats.original.avgRating})`);
  console.log(`  필터 후: ${stats.filtered.count}개 (평균 ${stats.filtered.avgPrice.toLocaleString()}원, 평점 ${stats.filtered.avgRating})`);
  console.log(`  통과율: ${stats.passRate}\n`);

  return hotDeals;
}

/**
 * 텔레그램 알림 전송
 */
async function notifyCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const filter = new ProductFilter();
  const telegram = new TelegramNotifier();

  // 텔레그램 설정 확인
  if (!telegram.isConfigured()) {
    telegram.printConfigError();
    return;
  }

  console.log(`\n[검색 + 텔레그램 알림] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeywordRaw(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    await telegram.notify('검색 결과 없음', `"${keyword}" 검색 결과가 없습니다.`);
    return;
  }

  // 2. 핫딜 필터링 (선택)
  const hotDeals = filter.filterHotDeals(result.products, {
    minDiscountRate: 30,
    minRating: 4.5
  });

  // 3. 텔레그램 전송
  if (hotDeals.length > 0) {
    // 핫딜 상품 알림
    await telegram.notifyHotDeals(hotDeals, keyword);
  } else {
    // 핫딜 없으면 요약만 전송
    await telegram.notifySummary(result.products, keyword);
  }

  console.log('텔레그램 알림 전송 완료!\n');
}

/**
 * 텔레그램 연결 테스트
 */
async function notifyTestCommand() {
  const telegram = new TelegramNotifier();

  if (!telegram.isConfigured()) {
    telegram.printConfigError();
    return;
  }

  await telegram.testConnection();
}

/**
 * 블로그용 마크다운 포스트 생성
 */
async function blogCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const filter = new ProductFilter();
  const blogGenerator = new BlogPostGenerator({ templateStyle: 'modern' });

  console.log(`\n[검색 + 블로그 포스트 생성] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeyword(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 핫딜 필터링 (선택적)
  const hotDeals = filter.filterHotDeals(result.products, {
    minDiscountRate: 20,
    minRating: 4.0
  });

  const productsToUse = hotDeals.length > 0 ? hotDeals : result.products;

  // 3. 블로그 포스트 생성
  const post = blogGenerator.generatePost(productsToUse, keyword, {
    includeComparison: true,
    includeTableOfContents: productsToUse.length > 5
  });

  // 4. 파일 저장
  const filepath = await blogGenerator.savePost(post, keyword);

  // 5. 미리보기 출력
  console.log('\n========== 생성된 포스트 미리보기 ==========\n');
  console.log(post.content.slice(0, 1500));
  console.log('\n... (생략) ...\n');
  console.log('=============================================\n');

  console.log(`[완료] 블로그 포스트 생성됨`);
  console.log(`  - 제목: ${post.title}`);
  console.log(`  - 상품 수: ${post.productCount}개`);
  console.log(`  - 단어 수: ${post.wordCount}`);
  console.log(`  - 저장 위치: ${filepath}\n`);
}

/**
 * 워드프레스 자동 포스팅
 */
async function publishCommand(keyword, limit) {
  const credentials = checkCredentials();
  if (!credentials) return;

  const client = new CoupangPartnersClient(credentials.accessKey, credentials.secretKey);
  const collector = new ProductCollector(client);
  const filter = new ProductFilter();
  const wordpress = new WordPressPublisher();

  // 워드프레스 설정 확인
  if (!wordpress.isConfigured()) {
    wordpress.printConfigError();
    return;
  }

  console.log(`\n[검색 + 워드프레스 포스팅] "${keyword}" (최대 ${limit}개)\n`);

  // 1. 상품 검색
  const result = await collector.collectByKeyword(keyword, limit);

  if (!result.success || result.products.length === 0) {
    console.log('검색 결과가 없습니다.');
    return;
  }

  // 2. 핫딜 필터링 (선택적)
  const hotDeals = filter.filterHotDeals(result.products, {
    minDiscountRate: 20,
    minRating: 4.0
  });

  const productsToPublish = hotDeals.length > 0 ? hotDeals : result.products;

  // 3. 워드프레스에 포스팅 (초안으로)
  const publishResult = await wordpress.publishProducts(productsToPublish, {
    keyword: keyword,
    status: 'draft', // 'publish'로 변경하면 바로 발행
    categories: ['쿠팡 추천'], // 원하는 카테고리
    tags: [keyword, '쿠팡', '추천', '쇼핑']
  });

  if (publishResult.success) {
    console.log('========== 포스팅 완료 ==========');
    console.log(`포스트 URL: ${publishResult.post.link}`);
    console.log('워드프레스 관리자에서 확인 후 발행하세요.');
    console.log('=================================\n');
  }
}

/**
 * 워드프레스 연결 테스트
 */
async function wpTestCommand() {
  const wordpress = new WordPressPublisher();

  if (!wordpress.isConfigured()) {
    wordpress.printConfigError();
    return;
  }

  await wordpress.testConnection();
}

/**
 * 워드프레스 카테고리 목록
 */
async function wpCategoriesCommand() {
  const wordpress = new WordPressPublisher();

  if (!wordpress.isConfigured()) {
    wordpress.printConfigError();
    return;
  }

  await wordpress.printCategories();
}

/**
 * 초안 통계 조회
 */
async function statsCommand() {
  const draftManager = new DraftManager();
  await draftManager.printStats();

  const drafts = await draftManager.listDrafts();
  if (drafts.length > 0) {
    console.log('최근 초안 5개:');
    drafts.slice(-5).forEach((d, i) => {
      console.log(`  ${i + 1}. [${d.status}] ${d.productName.slice(0, 40)}...`);
    });
    console.log('');
  }
}

/**
 * 포스팅 기록 통계 조회
 */
async function postedCommand() {
  const duplicateChecker = new DuplicateChecker();
  await duplicateChecker.printStats();
}

/**
 * 오래된 포스팅 기록 정리
 */
async function cleanupCommand(days) {
  const duplicateChecker = new DuplicateChecker();
  const removed = await duplicateChecker.cleanupOldRecords(days);
  console.log(`${days}일 이전 기록 ${removed}개 삭제 완료`);
}

/**
 * 수익 리포트 출력
 */
async function reportCommand() {
  const reporter = new RevenueReporter();

  const loaded = await reporter.loadData();
  if (!loaded) {
    console.log('');
    console.log('CSV 파일을 먼저 준비해주세요:');
    console.log('  1. 쿠팡 파트너스 대시보드 → 리포트 → CSV 다운로드');
    console.log('  2. data/revenue/ 폴더에 CSV 파일 저장');
    console.log('  3. npm run report 다시 실행');
    console.log('');
    console.log('테스트용 샘플 데이터 생성: npm run report:sample');
    console.log('');
    return;
  }

  await reporter.printFullReport();
}

/**
 * 샘플 CSV 생성
 */
async function reportSampleCommand() {
  const reporter = new RevenueReporter();
  await reporter.createSampleCSV();
  console.log('');
  console.log('이제 npm run report 로 리포트를 확인하세요.');
  console.log('');
}

// ============================================
// 수동 모드 (API 키 불필요)
// ============================================

/**
 * 수동 등록 상품 목록
 */
async function manualListCommand() {
  const manager = new ManualProductManager();
  await manager.printProducts();
}

/**
 * 샘플 상품 생성
 */
async function manualSampleCommand() {
  const manager = new ManualProductManager();
  await manager.createSampleProducts();
  await manager.printProducts();
}

/**
 * 수동 상품 워드프레스 포스팅
 */
async function manualPublishCommand(category) {
  const manager = new ManualProductManager();
  const wordpress = new WordPressPublisher();

  // 워드프레스 설정 확인
  if (!wordpress.isConfigured()) {
    wordpress.printConfigError();
    return;
  }

  // 상품 로드
  const products = await manager.getProductsByCategory(category);

  if (products.length === 0) {
    console.log('\n등록된 상품이 없습니다.');
    console.log('먼저 샘플을 생성하세요: npm run manual:sample\n');
    return;
  }

  console.log(`\n[수동 포스팅] ${products.length}개 상품\n`);

  // 키워드 설정
  const keyword = category || '추천 상품';

  // 워드프레스에 포스팅
  const result = await wordpress.publishProducts(products, {
    keyword: keyword,
    status: 'draft',
    tags: [keyword, '쿠팡', '추천']
  });

  if (result.success) {
    console.log('========== 포스팅 완료 ==========');
    console.log(`포스트 URL: ${result.post.link}`);
    console.log('워드프레스 관리자에서 확인 후 발행하세요.');
    console.log('=================================\n');
  }
}

/**
 * 수동 상품 텔레그램 알림
 */
async function manualNotifyCommand(category) {
  const manager = new ManualProductManager();
  const telegram = new TelegramNotifier();

  // 텔레그램 설정 확인
  if (!telegram.isConfigured()) {
    telegram.printConfigError();
    return;
  }

  // 상품 로드
  const products = await manager.getProductsByCategory(category);

  if (products.length === 0) {
    console.log('\n등록된 상품이 없습니다.');
    console.log('먼저 샘플을 생성하세요: npm run manual:sample\n');
    return;
  }

  console.log(`\n[수동 알림] ${products.length}개 상품\n`);

  // 텔레그램 전송
  const keyword = category || '수동 등록 상품';
  await telegram.notifyProducts(products.slice(0, 5), keyword);

  console.log('텔레그램 알림 전송 완료!\n');
}

/**
 * 메인 함수
 */
async function main() {
  const command = process.argv[2];

  // 명령어 없으면 도움말
  if (!command || command === 'help' || command === '--help') {
    printUsage();
    return;
  }

  try {
    switch (command) {
      case 'search':
        await searchCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 10);
        break;

      case 'draft':
        await draftCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 5);
        break;

      case 'review':
        await reviewCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 5);
        break;

      case 'images':
        await imagesCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 5);
        break;

      case 'images:stats':
        await imageStatsCommand();
        break;

      case 'hotdeal':
        await hotdealCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 20);
        break;

      case 'notify':
        await notifyCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 10);
        break;

      case 'notify:test':
        await notifyTestCommand();
        break;

      case 'blog':
        await blogCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 10);
        break;

      case 'publish':
        await publishCommand(process.argv[3] || '무선 이어폰', parseInt(process.argv[4]) || 10);
        break;

      case 'wp:test':
        await wpTestCommand();
        break;

      case 'wp:categories':
        await wpCategoriesCommand();
        break;

      case 'stats':
        await statsCommand();
        break;

      case 'posted':
        await postedCommand();
        break;

      case 'cleanup':
        await cleanupCommand(parseInt(process.argv[3]) || 90);
        break;

      case 'report':
        await reportCommand();
        break;

      case 'report:sample':
        await reportSampleCommand();
        break;

      // 수동 모드
      case 'manual:list':
        await manualListCommand();
        break;

      case 'manual:sample':
        await manualSampleCommand();
        break;

      case 'manual:publish':
        await manualPublishCommand(process.argv[3] || null);
        break;

      case 'manual:notify':
        await manualNotifyCommand(process.argv[3] || null);
        break;

      default:
        // 키워드로 간주하고 검색 실행
        await searchCommand(command, parseInt(process.argv[3]) || 10);
    }
  } catch (error) {
    console.error('실행 중 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
} else {
  module.exports = {
    CoupangPartnersClient,
    ProductCollector,
    ReviewDraftGenerator,
    DraftManager
  };
}
