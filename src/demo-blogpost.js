/**
 * 블로그 포스트 생성기 데모
 */

const BlogPostGenerator = require('./services/blogPostGenerator');

// 샘플 상품 데이터
const sampleProducts = [
  {
    productId: 'P001',
    productName: '삼성 갤럭시 버즈2 프로 노이즈캔슬링 무선 이어폰',
    productPrice: 159000,
    productImage: 'https://thumbnail.coupang.com/example1.jpg',
    productUrl: 'https://link.coupang.com/example1',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.7,
    reviewCount: 2341
  },
  {
    productId: 'P002',
    productName: '애플 에어팟 프로 2세대 MagSafe 충전 케이스 포함',
    productPrice: 289000,
    productImage: 'https://thumbnail.coupang.com/example2.jpg',
    productUrl: 'https://link.coupang.com/example2',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.8,
    reviewCount: 5672
  },
  {
    productId: 'P003',
    productName: 'QCY T13 ANC 노이즈캔슬링 블루투스 이어폰',
    productPrice: 24900,
    productImage: 'https://thumbnail.coupang.com/example3.jpg',
    productUrl: 'https://link.coupang.com/example3',
    categoryName: '전자제품 > 이어폰',
    isRocket: false,
    isFreeShipping: true,
    rating: 4.3,
    reviewCount: 892
  },
  {
    productId: 'P004',
    productName: '소니 WF-1000XM5 플래그십 노이즈캔슬링 이어폰',
    productPrice: 359000,
    productImage: 'https://thumbnail.coupang.com/example4.jpg',
    productUrl: 'https://link.coupang.com/example4',
    categoryName: '전자제품 > 이어폰',
    isRocket: true,
    isFreeShipping: true,
    rating: 4.9,
    reviewCount: 1523
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║             블로그 포스트 생성기 데모                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const generator = new BlogPostGenerator();

  // ==========================================
  // 모던 스타일 (기본)
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('스타일 1: Modern (기본)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const modernPost = generator.generatePost(sampleProducts, '무선 이어폰', {
    style: 'modern',
    includeComparison: true
  });

  console.log('\n' + modernPost.content);

  // 파일 저장
  await generator.savePost(modernPost, '무선이어폰_모던');

  // ==========================================
  // 미니멀 스타일
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('스타일 2: Minimal (간결)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const minimalPost = generator.generatePost(sampleProducts.slice(0, 2), '무선 이어폰', {
    style: 'minimal',
    includeComparison: false
  });

  console.log('\n' + minimalPost.content);

  // ==========================================
  // 비주얼 스타일
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('스타일 3: Visual (이미지 강조)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const visualPost = generator.generatePost(sampleProducts.slice(0, 2), '무선 이어폰', {
    style: 'visual',
    includeComparison: false
  });

  console.log('\n' + visualPost.content);

  // ==========================================
  // 요약
  // ==========================================
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        사용 가능한 스타일                      ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ modern  : 테이블 + 태그 + 상세 정보 (기본)                    ║');
  console.log('║ minimal : 간결한 리스트 형태                                  ║');
  console.log('║ visual  : 이미지 중심, HTML 태그 활용                         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ 옵션:                                                         ║');
  console.log('║ - includeComparison: 비교표 포함 여부                         ║');
  console.log('║ - includeTableOfContents: 목차 포함 여부                      ║');
  console.log('║ - title: 커스텀 제목                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('저장 위치: data/posts/');
  console.log('');
}

runDemo().catch(console.error);
