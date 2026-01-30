/**
 * 개인 체험형 리뷰 생성기 데모
 * 3가지 템플릿을 모두 보여줍니다.
 */

const PersonalReviewGenerator = require('./services/personalReviewGenerator');

// 테스트용 샘플 상품
const sampleProducts = [
  {
    productId: '12345',
    productName: '삼성 갤럭시 버즈3 프로 무선 이어폰',
    productPrice: 289000,
    productImage: 'https://example.com/image1.jpg',
    productUrl: 'https://www.coupang.com/product/12345',
    categoryName: '전자제품',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 1523
  },
  {
    productId: '12346',
    productName: '오버핏 코튼 맨투맨 티셔츠',
    productPrice: 19900,
    productImage: 'https://example.com/image2.jpg',
    productUrl: 'https://www.coupang.com/product/12346',
    categoryName: '패션',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.3,
    reviewCount: 856
  },
  {
    productId: '12347',
    productName: '유기농 아보카도 오일 500ml',
    productPrice: 15900,
    productImage: 'https://example.com/image3.jpg',
    productUrl: 'https://www.coupang.com/product/12347',
    categoryName: '식품',
    isRocket: false,
    isFreeShipping: true,
    rating: 4.1,
    reviewCount: 45
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          개인 체험형 리뷰 생성기 데모                          ║');
  console.log('║          (3가지 템플릿 미리보기)                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const generator = new PersonalReviewGenerator();

  // 템플릿 1 미리보기
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('템플릿 1: 일상 대화체');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const review1 = generator.generateReview(sampleProducts[0], { templateNumber: 1 });
  console.log(review1.content.slice(0, 800) + '\n...(생략)...\n');

  // 템플릿 2 미리보기
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('템플릿 2: 꼼꼼 리뷰체');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const review2 = generator.generateReview(sampleProducts[1], { templateNumber: 2 });
  console.log(review2.content.slice(0, 800) + '\n...(생략)...\n');

  // 템플릿 3 미리보기
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('템플릿 3: 친구에게 추천하는 톤');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const review3 = generator.generateReview(sampleProducts[2], { templateNumber: 3 });
  console.log(review3.content.slice(0, 800) + '\n...(생략)...\n');

  // 분석 결과 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('상품 분석 예시 (삼성 갤럭시 버즈3 프로)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n[장점 키워드]');
  review1.analysis.pros.forEach((pro, i) => {
    console.log(`  ${i + 1}. ${pro}`);
  });

  console.log('\n[단점/주의점 키워드]');
  review1.analysis.cons.forEach((con, i) => {
    console.log(`  ${i + 1}. ${con}`);
  });

  console.log('\n[분석 결과]');
  console.log(`  - 가격대: ${review1.analysis.priceLevel}`);
  console.log(`  - 평점 수준: ${review1.analysis.ratingLevel}`);
  console.log(`  - 리뷰 수준: ${review1.analysis.reviewLevel}`);

  // 요약
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        사용 방법                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ npm run review "검색키워드" [개수]                             ║');
  console.log('║                                                              ║');
  console.log('║ 예시:                                                         ║');
  console.log('║   npm run review "무선 이어폰" 5                              ║');
  console.log('║   npm run review "맨투맨" 3                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
}

runDemo().catch(console.error);
