/**
 * 상품 필터링 데모
 * 다양한 필터 조건 테스트
 */

const ProductFilter = require('./services/productFilter');

// 테스트용 샘플 상품
const sampleProducts = [
  {
    productId: 'P001',
    productName: '삼성 갤럭시 버즈3 프로 무선 이어폰',
    productPrice: 199000,
    originalPrice: 289000,  // 31% 할인
    rating: 4.7,
    reviewCount: 1523,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P002',
    productName: '애플 에어팟 프로 2세대',
    productPrice: 289000,
    originalPrice: 329000,  // 12% 할인
    rating: 4.8,
    reviewCount: 3842,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P003',
    productName: 'QCY T13 가성비 무선 이어폰',
    productPrice: 15900,
    originalPrice: 29900,   // 47% 할인
    rating: 4.2,
    reviewCount: 8921,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P004',
    productName: '노브랜드 블루투스 이어폰',
    productPrice: 9900,
    originalPrice: 15000,   // 34% 할인
    rating: 3.8,
    reviewCount: 156,
    isRocket: false,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P005',
    productName: '소니 WH-1000XM5 헤드폰',
    productPrice: 379000,
    originalPrice: 429000,  // 12% 할인
    rating: 4.9,
    reviewCount: 2156,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P006',
    productName: '저렴한 유선 이어폰',
    productPrice: 3900,
    originalPrice: 5000,    // 22% 할인
    rating: 3.5,
    reviewCount: 45,
    isRocket: false,
    isFreeShipping: false,
    categoryName: '전자제품'
  },
  {
    productId: 'P007',
    productName: '보스 QuietComfort 이어버드',
    productPrice: 199000,
    originalPrice: 359000,  // 45% 할인
    rating: 4.6,
    reviewCount: 892,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  },
  {
    productId: 'P008',
    productName: '신규 출시 이어폰 (리뷰 없음)',
    productPrice: 49900,
    originalPrice: 49900,   // 0% 할인
    rating: 0,
    reviewCount: 0,
    isRocket: true,
    isFreeShipping: true,
    categoryName: '전자제품'
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              상품 필터링 데모                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const filter = new ProductFilter();

  // 샘플 데이터 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('샘플 데이터 (8개 상품)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  sampleProducts.forEach((p, i) => {
    const discount = filter.calculateDiscountRate(p.originalPrice, p.productPrice);
    console.log(`${i + 1}. ${p.productName.slice(0, 30)}...`);
    console.log(`   ${p.productPrice.toLocaleString()}원 (${discount}% 할인) | 평점: ${p.rating || '-'} | 리뷰: ${p.reviewCount}`);
  });

  // ==========================================
  // 테스트 1: 핫딜 필터 (할인 30% 이상 OR 평점 4.5 이상)
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 핫딜 필터 (할인 30%↑ OR 평점 4.5↑)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const hotDeals = filter.filterHotDeals(sampleProducts);
  filter.printFilteredProducts(hotDeals);

  // ==========================================
  // 테스트 2: 할인율만 필터
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 할인율 40% 이상만');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const bigDiscounts = filter.filterByDiscountRate(sampleProducts, 40);
  filter.printFilterResult(sampleProducts.length, bigDiscounts.length, '할인율 40%↑');

  bigDiscounts.forEach((p, i) => {
    const discount = filter.calculateDiscountRate(p.originalPrice, p.productPrice);
    console.log(`  ${i + 1}. ${p.productName.slice(0, 35)}... (${discount}% 할인)`);
  });

  // ==========================================
  // 테스트 3: 가성비 필터
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 가성비 상품 (3만원 이하 + 평점 4.0 이상)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const bestValue = filter.filterBestValue(sampleProducts, 30000, 4.0);

  bestValue.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.productName.slice(0, 35)}... (${p.productPrice.toLocaleString()}원, ⭐${p.rating})`);
  });

  // ==========================================
  // 테스트 4: 복합 조건 (AND)
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 4: 복합 조건 (로켓배송 + 평점 4.5↑ + 리뷰 100개↑)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const premium = filter.filterByMultipleConditions(sampleProducts, {
    rocketOnly: true,
    minRating: 4.5,
    minReviewCount: 100
  });

  premium.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.productName.slice(0, 35)}...`);
    console.log(`     ${p.productPrice.toLocaleString()}원 | ⭐${p.rating} | 리뷰 ${p.reviewCount}개`);
  });

  // ==========================================
  // 테스트 5: 정렬
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 5: 할인율 높은 순 정렬');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sortedByDiscount = filter.sortByDiscountRate(sampleProducts);

  sortedByDiscount.slice(0, 5).forEach((p, i) => {
    const discount = filter.calculateDiscountRate(p.originalPrice, p.productPrice);
    console.log(`  ${i + 1}. [${discount}% 할인] ${p.productName.slice(0, 35)}...`);
  });

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     사용 가능한 필터                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ filterHotDeals()          할인율 OR 평점 (핫딜)               ║');
  console.log('║ filterByDiscountRate()    할인율 기준                         ║');
  console.log('║ filterByRating()          평점 기준                           ║');
  console.log('║ filterByPriceRange()      가격 범위                           ║');
  console.log('║ filterByRocket()          로켓배송만                          ║');
  console.log('║ filterBestValue()         가성비 (저가+고평점)                ║');
  console.log('║ filterByMultipleConditions() 복합 조건 (AND)                 ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ sortByDiscountRate()      할인율 순 정렬                      ║');
  console.log('║ sortByRating()            평점 순 정렬                        ║');
  console.log('║ sortByPrice()             가격 순 정렬                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('CLI 사용법: npm run hotdeal "무선 이어폰" 20');
  console.log('');
}

runDemo().catch(console.error);
