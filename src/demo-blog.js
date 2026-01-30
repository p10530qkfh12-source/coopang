/**
 * 블로그 포스트 생성기 데모
 * 3가지 스타일의 마크다운 출력 예시
 */

const BlogPostGenerator = require('./services/blogPostGenerator');

// 테스트용 샘플 상품
const sampleProducts = [
  {
    productId: 'P001',
    productName: '삼성 갤럭시 버즈3 프로 무선 이어폰 화이트',
    productPrice: 199000,
    productImage: 'https://example.com/buds3.jpg',
    productUrl: 'https://www.coupang.com/product/12345',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 1523
  },
  {
    productId: 'P002',
    productName: 'QCY T13 ANC 노이즈캔슬링 무선 이어폰',
    productPrice: 29900,
    productImage: 'https://example.com/qcy.jpg',
    productUrl: 'https://www.coupang.com/product/12346',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.3,
    reviewCount: 8921
  },
  {
    productId: 'P003',
    productName: '소니 WF-1000XM5 노이즈캔슬링 이어폰',
    productPrice: 379000,
    productImage: 'https://example.com/sony.jpg',
    productUrl: 'https://www.coupang.com/product/12347',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.9,
    reviewCount: 2156
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           블로그 포스트 생성기 데모                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // ==========================================
  // 스타일 1: Modern (기본)
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('스타일 1: Modern (기본) - 테이블 형식');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const modernGenerator = new BlogPostGenerator({ templateStyle: 'modern' });
  const modernPost = modernGenerator.generatePost(sampleProducts, '무선 이어폰', {
    includeComparison: true
  });

  console.log(modernPost.content);

  // ==========================================
  // 스타일 2: Minimal
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('스타일 2: Minimal - 간결한 리스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const minimalGenerator = new BlogPostGenerator({ templateStyle: 'minimal' });
  const minimalPost = minimalGenerator.generatePost(sampleProducts.slice(0, 2), '무선 이어폰', {
    includeComparison: false
  });

  console.log(minimalPost.content);

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     생성 옵션                                 ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ templateStyle: "modern"    테이블 형식 (기본)                 ║');
  console.log('║ templateStyle: "minimal"   간결한 리스트                      ║');
  console.log('║ templateStyle: "visual"    비주얼 카드 (HTML 포함)            ║');
  console.log('║ includeComparison: true    상품 비교표 포함                   ║');
  console.log('║ includeTableOfContents     목차 포함                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('CLI 사용법: npm run blog "무선 이어폰" 10');
  console.log('저장 위치: data/posts/');
  console.log('');
}

runDemo().catch(console.error);
