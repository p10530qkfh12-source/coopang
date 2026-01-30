/**
 * 데모 스크립트
 * API 키 없이 리뷰 초안 생성 기능을 테스트합니다.
 */

const ReviewDraftGenerator = require('./services/reviewDraftGenerator');
const DraftManager = require('./services/draftManager');

// 샘플 상품 데이터
const sampleProducts = [
  {
    productId: '12345678',
    productName: '삼성 갤럭시 버즈2 프로 무선 이어폰 노이즈캔슬링',
    productPrice: 159000,
    productImage: 'https://example.com/image1.jpg',
    productUrl: 'https://coupang.com/product/12345678',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 2341
  },
  {
    productId: '23456789',
    productName: '애플 에어팟 프로 2세대 MagSafe 충전 케이스',
    productPrice: 289000,
    productImage: 'https://example.com/image2.jpg',
    productUrl: 'https://coupang.com/product/23456789',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 5672
  },
  {
    productId: '34567890',
    productName: 'QCY T13 무선 블루투스 이어폰 가성비 추천',
    productPrice: 19900,
    productImage: 'https://example.com/image3.jpg',
    productUrl: 'https://coupang.com/product/34567890',
    categoryName: '전자제품 > 이어폰',
    isRocket: false,
    isFreeShipping: true,
    rating: 4.3,
    reviewCount: 892
  }
];

async function runDemo() {
  console.log('');
  console.log('========================================');
  console.log('  리뷰 초안 생성 데모');
  console.log('========================================');
  console.log('');
  console.log('API 키 없이 샘플 데이터로 테스트합니다.\n');

  const reviewGenerator = new ReviewDraftGenerator();
  const draftManager = new DraftManager();

  // 리뷰 초안 생성
  const drafts = reviewGenerator.generateBulkDrafts(sampleProducts);

  // 초안 저장
  const savedFiles = await draftManager.saveBulkDrafts(drafts);

  // 첫 번째 초안 내용 미리보기
  console.log('========== 초안 미리보기 (첫 번째 상품) ==========\n');
  console.log(drafts[0].draft.content);
  console.log('========================================\n');

  // 결과 요약
  console.log('생성된 파일 목록:');
  savedFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file.filepath.split('/').pop()}`);
  });
  console.log('');
  console.log('data/drafts 폴더에서 모든 초안을 확인할 수 있습니다.\n');
}

runDemo().catch(console.error);
