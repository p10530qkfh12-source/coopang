/**
 * 워드프레스 자동 포스팅 데모
 *
 * 실행 전 .env 파일에 설정 필요:
 * WP_SITE_URL=https://your-blog.com
 * WP_USERNAME=your_username
 * WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
 */

require('dotenv').config();

const WordPressPublisher = require('./services/wordpressPublisher');

// 테스트용 샘플 상품
const sampleProducts = [
  {
    productId: 'WP001',
    productName: '삼성 갤럭시 버즈3 프로 무선 이어폰',
    productPrice: 199000,
    productImage: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Galaxy+Buds3',
    productUrl: 'https://www.coupang.com/product/12345',
    categoryName: '전자제품',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 1523
  },
  {
    productId: 'WP002',
    productName: 'QCY T13 ANC 노이즈캔슬링 무선 이어폰',
    productPrice: 29900,
    productImage: 'https://via.placeholder.com/400x300/4ECDC4/ffffff?text=QCY+T13',
    productUrl: 'https://www.coupang.com/product/12346',
    categoryName: '전자제품',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.3,
    reviewCount: 8921
  },
  {
    productId: 'WP003',
    productName: '소니 WF-1000XM5 프리미엄 이어폰',
    productPrice: 379000,
    productImage: 'https://via.placeholder.com/400x300/45B7D1/ffffff?text=Sony+XM5',
    productUrl: 'https://www.coupang.com/product/12347',
    categoryName: '전자제품',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.9,
    reviewCount: 2156
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           워드프레스 자동 포스팅 데모                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const wordpress = new WordPressPublisher();

  // 설정 확인
  if (!wordpress.isConfigured()) {
    wordpress.printConfigError();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('생성될 HTML 미리보기 (실제 전송되지 않음)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // HTML 미리보기
    const html = wordpress.generatePostHtml(sampleProducts, { keyword: '무선 이어폰' });
    console.log('\n--- 생성될 HTML (일부) ---\n');
    console.log(html.slice(0, 2000));
    console.log('\n... (생략) ...\n');

    return;
  }

  // ==========================================
  // 테스트 1: 연결 테스트
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 연결 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const connected = await wordpress.testConnection();
  if (!connected.success) {
    console.log('연결 테스트 실패. 설정을 확인해주세요.');
    return;
  }

  // ==========================================
  // 테스트 2: 카테고리 조회
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 카테고리 목록');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await wordpress.printCategories();

  // ==========================================
  // 테스트 3: 포스트 생성 (초안)
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 포스트 생성 (초안으로 저장)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result = await wordpress.publishProducts(sampleProducts, {
    keyword: '무선 이어폰 테스트',
    status: 'draft', // 초안으로 저장
    tags: ['테스트', '무선이어폰', '쿠팡']
  });

  if (result.success) {
    console.log('포스트가 초안으로 저장되었습니다.');
    console.log('워드프레스 관리자에서 확인 후 발행하세요.');
  }

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     사용 가능한 기능                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ testConnection()       연결 테스트                            ║');
  console.log('║ getCategories()        카테고리 목록 조회                     ║');
  console.log('║ createPost()           포스트 생성                            ║');
  console.log('║ publishProducts()      상품 목록 → 자동 포스팅                ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ status 옵션:                                                  ║');
  console.log('║   "draft"   - 초안으로 저장 (기본값)                          ║');
  console.log('║   "publish" - 즉시 발행                                       ║');
  console.log('║   "pending" - 검토 대기                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('CLI 사용법:');
  console.log('  npm run wp:test          연결 테스트');
  console.log('  npm run wp:categories    카테고리 목록');
  console.log('  npm run publish "키워드" 10');
  console.log('');
}

runDemo().catch(console.error);
