/**
 * 중복 포스팅 방지 기능 데모
 * posted_products.json을 활용한 중복 필터링 테스트
 */

const DuplicateChecker = require('./services/duplicateChecker');
const ProductCollector = require('./services/productCollector');

// Mock API 클라이언트 (테스트용)
class MockCoupangClient {
  constructor() {
    this.callCount = 0;
  }

  async searchProducts(keyword, limit) {
    this.callCount++;

    // 시뮬레이션: 매번 같은 상품 + 일부 새 상품 반환
    const baseProducts = [
      { productId: 'P001', productName: '삼성 갤럭시 버즈2 프로', productPrice: 159000 },
      { productId: 'P002', productName: '애플 에어팟 프로 2세대', productPrice: 289000 },
      { productId: 'P003', productName: 'QCY T13 무선 이어폰', productPrice: 19900 },
    ];

    // 호출할 때마다 새 상품 추가
    const newProduct = {
      productId: `P00${3 + this.callCount}`,
      productName: `신규 상품 #${this.callCount}`,
      productPrice: 50000 + (this.callCount * 10000)
    };

    return {
      success: true,
      data: {
        data: [...baseProducts, newProduct]
      }
    };
  }
}

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           중복 포스팅 방지 기능 데모                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const duplicateChecker = new DuplicateChecker();
  const mockClient = new MockCoupangClient();
  const collector = new ProductCollector(mockClient);

  // ==========================================
  // 테스트 1: 첫 번째 수집 (모두 신규)
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 첫 번째 수집 (모든 상품이 신규)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result1 = await collector.collectByKeyword('무선 이어폰', 10);

  console.log(`\n결과: ${result1.products.length}개 신규 상품 수집됨`);

  // ==========================================
  // 테스트 2: 두 번째 수집 (대부분 중복)
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 두 번째 수집 (중복 필터링 작동)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result2 = await collector.collectByKeyword('무선 이어폰', 10);

  console.log(`\n결과: ${result2.products.length}개 신규, ${result2.duplicates.length}개 중복 필터링됨`);

  // ==========================================
  // 테스트 3: 세 번째 수집
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 세 번째 수집 (또 새 상품 1개만 추가)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result3 = await collector.collectByKeyword('무선 이어폰', 10);

  console.log(`\n결과: ${result3.products.length}개 신규, ${result3.duplicates.length}개 중복 필터링됨`);

  // ==========================================
  // 테스트 4: 중복 체크 없이 수집
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 4: 중복 체크 비활성화 (Raw 모드)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const result4 = await collector.collectByKeywordRaw('무선 이어폰', 10);

  console.log(`\n결과: ${result4.products.length}개 상품 (중복 체크 없이 전체 반환)`);

  // ==========================================
  // 포스팅 기록 통계
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('포스팅 기록 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await collector.printPostedStats();

  // ==========================================
  // posted_products.json 내용 확인
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('posted_products.json 파일 내용 미리보기');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const fs = require('fs').promises;
  const path = require('path');

  try {
    const content = await fs.readFile(
      path.join(__dirname, '../data/posted_products.json'),
      'utf-8'
    );
    const data = JSON.parse(content);

    console.log(`\n파일 위치: data/posted_products.json`);
    console.log(`마지막 업데이트: ${data.lastUpdated}`);
    console.log(`등록된 상품 수: ${data.totalCount}개\n`);

    console.log('등록된 상품 ID 목록:');
    for (const [id, info] of Object.entries(data.products)) {
      console.log(`  - ${id}: ${info.productName} (${info.status})`);
    }
  } catch (error) {
    console.log('파일 읽기 실패:', error.message);
  }

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        기능 요약                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ 1. 자동 중복 필터링  : 수집 시 기존 상품 ID 자동 제외        ║');
  console.log('║ 2. 자동 기록 추가    : 신규 상품은 자동으로 기록에 등록      ║');
  console.log('║ 3. 키워드별 추적     : 어떤 키워드로 수집했는지 기록         ║');
  console.log('║ 4. 상태 관리         : drafted → published 상태 추적        ║');
  console.log('║ 5. 통계 조회         : 전체/키워드별 수집 현황 확인          ║');
  console.log('║ 6. Raw 모드          : 필요시 중복 체크 비활성화 가능        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
}

runDemo().catch(console.error);
