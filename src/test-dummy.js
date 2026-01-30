/**
 * 더미 데이터 테스트
 *
 * 쿠팡 API 응답 구조로 글쓰기 함수 테스트
 */

require('dotenv').config();

const dummyDataLoader = require('./services/dummyDataLoader');
const PremiumContentGenerator = require('./services/premiumContentGenerator');
const WordPressPublisher = require('./services/wordpressPublisher');
const linkGenerator = require('./utils/linkGenerator');

async function testDummyData() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║             🧪 더미 데이터 테스트 시작                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. 더미 데이터 로드 테스트
    console.log('━━━━━━━━━━ 1. 더미 데이터 로드 테스트 ━━━━━━━━━━');
    const categories = dummyDataLoader.getCategories();
    console.log(`사용 가능한 카테고리: ${categories.join(', ')}`);

    // 2. API 응답 형식 테스트
    console.log('\n━━━━━━━━━━ 2. API 응답 형식 테스트 ━━━━━━━━━━');
    const searchResult = await dummyDataLoader.searchProducts('무선이어폰', 3);
    console.log(`rCode: ${searchResult.rCode}`);
    console.log(`totalCount: ${searchResult.data.totalCount}`);
    console.log(`keyword: ${searchResult.data.keyword}`);
    console.log('상품 목록:');
    searchResult.data.productData.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.productName.slice(0, 40)}...`);
      console.log(`     - 가격: ${p.productPrice.toLocaleString()}원`);
      console.log(`     - 평점: ${p.rating} (리뷰 ${p.reviewCount.toLocaleString()}개)`);
      console.log(`     - shortenUrl: ${p.shortenUrl}`);
    });

    // 3. 링크 생성 테스트
    console.log('\n━━━━━━━━━━ 3. 링크 생성 테스트 ━━━━━━━━━━');
    const testProduct = searchResult.data.productData[0];
    linkGenerator.debugProduct(testProduct);

    // 4. 콘텐츠 생성 테스트
    console.log('\n━━━━━━━━━━ 4. 콘텐츠 생성 테스트 ━━━━━━━━━━');
    const generator = new PremiumContentGenerator();
    const post = generator.generateFullPost(searchResult.data.productData, '무선이어폰');

    console.log(`생성된 제목: ${post.title}`);
    console.log(`생성된 발췌문: ${post.excerpt}`);
    console.log(`콘텐츠 길이: ${post.content.length}자`);

    // HTML 구조 검증
    const hasResponsiveStyles = post.content.includes('@media');
    const hasFtcDisclaimer = post.content.includes('파트너스');
    const hasProductCards = post.content.includes('product-card');
    const hasGoPhpLinks = post.content.includes('go.php?url=');

    console.log('\n콘텐츠 검증:');
    console.log(`  ✅ 반응형 스타일: ${hasResponsiveStyles ? 'O' : 'X'}`);
    console.log(`  ✅ 공정위 문구: ${hasFtcDisclaimer ? 'O' : 'X'}`);
    console.log(`  ✅ 상품 카드: ${hasProductCards ? 'O' : 'X'}`);
    console.log(`  ✅ go.php 링크: ${hasGoPhpLinks ? 'O' : 'X'}`);

    // 5. 워드프레스 발행 테스트 (실제 발행)
    console.log('\n━━━━━━━━━━ 5. 워드프레스 발행 테스트 ━━━━━━━━━━');

    const publisher = new WordPressPublisher();
    const result = await publisher.publishProducts(searchResult.data.productData, {
      keyword: '무선이어폰',
      status: 'publish',
      premium: true
    });

    if (result && result.link) {
      console.log('\n========== 테스트 완료 ==========');
      console.log(`✅ 포스트 URL: ${result.link}`);
      console.log('================================\n');
    }

    return result;

  } catch (error) {
    console.error('테스트 실패:', error.message);
    throw error;
  }
}

// 단독 실행시
if (require.main === module) {
  testDummyData()
    .then(() => {
      console.log('\n🎉 모든 테스트 완료!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 테스트 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { testDummyData };
