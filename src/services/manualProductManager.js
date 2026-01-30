/**
 * 수동 상품 관리 서비스
 *
 * 쿠팡 API 없이 수동으로 상품 정보를 입력하여 포스팅
 */

const fs = require('fs').promises;
const path = require('path');

class ManualProductManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'manual');
    this.productsFile = path.join(this.dataDir, 'products.json');
  }

  /**
   * 데이터 디렉토리 초기화
   */
  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // 이미 존재하면 무시
    }
  }

  /**
   * 저장된 상품 목록 로드
   */
  async loadProducts() {
    try {
      const content = await fs.readFile(this.productsFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return { products: [], categories: [] };
    }
  }

  /**
   * 상품 목록 저장
   */
  async saveProducts(data) {
    await this.ensureDataDir();
    await fs.writeFile(this.productsFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 상품 추가
   */
  async addProduct(product) {
    const data = await this.loadProducts();

    // 기본값 설정
    const newProduct = {
      productId: product.productId || `MANUAL_${Date.now()}`,
      productName: product.productName || '상품명 없음',
      productPrice: product.productPrice || 0,
      productImage: product.productImage || '',
      productUrl: product.productUrl || '',
      categoryName: product.categoryName || '기타',
      isRocket: product.isRocket || false,
      isFreeShipping: product.isFreeShipping || false,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      description: product.description || '',
      pros: product.pros || [],
      cons: product.cons || [],
      addedAt: new Date().toISOString()
    };

    data.products.push(newProduct);
    await this.saveProducts(data);

    console.log(`[수동] 상품 추가됨: ${newProduct.productName}`);
    return newProduct;
  }

  /**
   * 카테고리별 상품 조회
   */
  async getProductsByCategory(category) {
    const data = await this.loadProducts();
    if (!category) return data.products;
    return data.products.filter(p => p.categoryName === category);
  }

  /**
   * 상품 목록 출력
   */
  async printProducts() {
    const data = await this.loadProducts();

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📦 수동 등록 상품 목록                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    if (data.products.length === 0) {
      console.log('  등록된 상품이 없습니다.\n');
      console.log('  상품 추가: npm run manual:add');
      console.log('  샘플 생성: npm run manual:sample\n');
      return;
    }

    // 카테고리별 그룹화
    const byCategory = {};
    data.products.forEach(p => {
      const cat = p.categoryName || '기타';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });

    Object.entries(byCategory).forEach(([category, products]) => {
      console.log(`━━━━━━━━━━ ${category} (${products.length}개) ━━━━━━━━━━`);
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.productName.slice(0, 40)}`);
        console.log(`     💰 ${p.productPrice.toLocaleString()}원 | ⭐ ${p.rating || '-'}`);
      });
      console.log('');
    });

    console.log(`총 ${data.products.length}개 상품\n`);
  }

  /**
   * 전체 샘플 상품 세트 (여러 카테고리)
   */
  getAllSampleProducts() {
    return {
      '무선이어폰': [
        {
          productId: 'EARPHONE001',
          productName: '애플 에어팟 프로 2세대 USB-C',
          productPrice: 299000,
          productUrl: 'https://www.coupang.com/vp/products/earphone001',
          isRocket: true, isFreeShipping: true, rating: 4.8, reviewCount: 15234,
          pros: ['노이즈캔슬링 우수', '애플 기기 연동'], cons: ['높은 가격']
        },
        {
          productId: 'EARPHONE002',
          productName: '삼성 갤럭시 버즈3 프로',
          productPrice: 259000,
          productUrl: 'https://www.coupang.com/vp/products/earphone002',
          isRocket: true, isFreeShipping: true, rating: 4.7, reviewCount: 8921,
          pros: ['갤럭시 기기 최적화', '편안한 착용감'], cons: ['아이폰 기능 제한']
        },
        {
          productId: 'EARPHONE003',
          productName: 'QCY T13 ANC 무선 이어폰',
          productPrice: 29900,
          productUrl: 'https://www.coupang.com/vp/products/earphone003',
          isRocket: true, isFreeShipping: true, rating: 4.3, reviewCount: 32156,
          pros: ['저렴한 가격', '노이즈캔슬링'], cons: ['음질 평범']
        },
        {
          productId: 'EARPHONE004',
          productName: '소니 WF-1000XM5',
          productPrice: 379000,
          productUrl: 'https://www.coupang.com/vp/products/earphone004',
          isRocket: true, isFreeShipping: true, rating: 4.9, reviewCount: 3421,
          pros: ['최고 수준 음질', 'LDAC 지원'], cons: ['높은 가격']
        }
      ],
      '보조배터리': [
        {
          productId: 'BATTERY001',
          productName: '앤커 파워코어 20000mAh 고속충전',
          productPrice: 45900,
          productUrl: 'https://www.coupang.com/vp/products/battery001',
          isRocket: true, isFreeShipping: true, rating: 4.7, reviewCount: 28934,
          pros: ['대용량', '고속충전 지원'], cons: ['무게감 있음']
        },
        {
          productId: 'BATTERY002',
          productName: '샤오미 보조배터리 10000mAh',
          productPrice: 19900,
          productUrl: 'https://www.coupang.com/vp/products/battery002',
          isRocket: true, isFreeShipping: true, rating: 4.5, reviewCount: 45123,
          pros: ['가성비 좋음', '슬림한 디자인'], cons: ['용량 보통']
        },
        {
          productId: 'BATTERY003',
          productName: '삼성 무선 배터리팩 10000mAh',
          productPrice: 59000,
          productUrl: 'https://www.coupang.com/vp/products/battery003',
          isRocket: true, isFreeShipping: true, rating: 4.6, reviewCount: 12456,
          pros: ['무선충전 지원', '삼성 정품'], cons: ['가격대 있음']
        },
        {
          productId: 'BATTERY004',
          productName: '벨킨 마그네틱 보조배터리 5000mAh',
          productPrice: 49900,
          productUrl: 'https://www.coupang.com/vp/products/battery004',
          isRocket: true, isFreeShipping: true, rating: 4.4, reviewCount: 8765,
          pros: ['맥세이프 호환', '컴팩트'], cons: ['용량 적음']
        }
      ],
      '블루투스스피커': [
        {
          productId: 'SPEAKER001',
          productName: 'JBL 플립 6 블루투스 스피커',
          productPrice: 139000,
          productUrl: 'https://www.coupang.com/vp/products/speaker001',
          isRocket: true, isFreeShipping: true, rating: 4.8, reviewCount: 19234,
          pros: ['강력한 베이스', '방수 IP67'], cons: ['가격대 있음']
        },
        {
          productId: 'SPEAKER002',
          productName: '소니 SRS-XB13 휴대용 스피커',
          productPrice: 59000,
          productUrl: 'https://www.coupang.com/vp/products/speaker002',
          isRocket: true, isFreeShipping: true, rating: 4.6, reviewCount: 15678,
          pros: ['컴팩트', '방수 지원'], cons: ['베이스 약함']
        },
        {
          productId: 'SPEAKER003',
          productName: '보스 사운드링크 플렉스',
          productPrice: 179000,
          productUrl: 'https://www.coupang.com/vp/products/speaker003',
          isRocket: true, isFreeShipping: true, rating: 4.7, reviewCount: 8432,
          pros: ['프리미엄 음질', '내구성'], cons: ['고가']
        },
        {
          productId: 'SPEAKER004',
          productName: '앤커 사운드코어 모션+',
          productPrice: 89000,
          productUrl: 'https://www.coupang.com/vp/products/speaker004',
          isRocket: true, isFreeShipping: true, rating: 4.5, reviewCount: 23456,
          pros: ['가성비 좋음', '30W 출력'], cons: ['디자인 평범']
        }
      ],
      '충전케이블': [
        {
          productId: 'CABLE001',
          productName: '앤커 나일론 C타입 고속충전 케이블 2M',
          productPrice: 12900,
          productUrl: 'https://www.coupang.com/vp/products/cable001',
          isRocket: true, isFreeShipping: true, rating: 4.7, reviewCount: 67890,
          pros: ['내구성 좋음', '고속충전'], cons: ['가격 있음']
        },
        {
          productId: 'CABLE002',
          productName: '삼성 정품 C타입 케이블 1.5M',
          productPrice: 15900,
          productUrl: 'https://www.coupang.com/vp/products/cable002',
          isRocket: true, isFreeShipping: true, rating: 4.6, reviewCount: 34567,
          pros: ['정품 안정성', '45W 지원'], cons: ['길이 선택 제한']
        },
        {
          productId: 'CABLE003',
          productName: '베이스어스 100W C타입 케이블',
          productPrice: 9900,
          productUrl: 'https://www.coupang.com/vp/products/cable003',
          isRocket: true, isFreeShipping: true, rating: 4.4, reviewCount: 45678,
          pros: ['100W 고속충전', '저렴함'], cons: ['내구성 보통']
        },
        {
          productId: 'CABLE004',
          productName: '맥세이프 충전 케이블 1M',
          productPrice: 29900,
          productUrl: 'https://www.coupang.com/vp/products/cable004',
          isRocket: true, isFreeShipping: true, rating: 4.5, reviewCount: 12345,
          pros: ['아이폰 최적화', '자석 부착'], cons: ['아이폰 전용']
        }
      ],
      '스마트워치': [
        {
          productId: 'WATCH001',
          productName: '애플 워치 시리즈 9 45mm GPS',
          productPrice: 599000,
          productUrl: 'https://www.coupang.com/vp/products/watch001',
          isRocket: true, isFreeShipping: true, rating: 4.9, reviewCount: 8765,
          pros: ['아이폰 연동 최고', '건강 기능'], cons: ['높은 가격']
        },
        {
          productId: 'WATCH002',
          productName: '삼성 갤럭시 워치6 44mm',
          productPrice: 349000,
          productUrl: 'https://www.coupang.com/vp/products/watch002',
          isRocket: true, isFreeShipping: true, rating: 4.7, reviewCount: 12345,
          pros: ['안드로이드 최적화', '세련된 디자인'], cons: ['배터리 아쉬움']
        },
        {
          productId: 'WATCH003',
          productName: '샤오미 미밴드 8',
          productPrice: 39900,
          productUrl: 'https://www.coupang.com/vp/products/watch003',
          isRocket: true, isFreeShipping: true, rating: 4.5, reviewCount: 56789,
          pros: ['가성비 최고', '긴 배터리'], cons: ['기능 제한적']
        },
        {
          productId: 'WATCH004',
          productName: '가민 비보액티브 5',
          productPrice: 399000,
          productUrl: 'https://www.coupang.com/vp/products/watch004',
          isRocket: true, isFreeShipping: true, rating: 4.6, reviewCount: 4567,
          pros: ['운동 기능 최고', 'GPS 정확'], cons: ['스마트 기능 부족']
        }
      ]
    };
  }

  /**
   * 오늘의 카테고리 선택 (요일별 로테이션)
   */
  getTodayCategory() {
    const categories = Object.keys(this.getAllSampleProducts());
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return categories[dayOfYear % categories.length];
  }

  /**
   * 오늘의 상품 가져오기
   */
  async getTodayProducts() {
    const allProducts = this.getAllSampleProducts();
    const category = this.getTodayCategory();

    console.log(`[수동] 오늘의 카테고리: ${category}`);

    return {
      category,
      products: allProducts[category].map(p => ({
        ...p,
        productImage: '',
        categoryName: category
      }))
    };
  }

  /**
   * 샘플 상품 생성
   */
  async createSampleProducts() {
    await this.ensureDataDir();

    const sampleProducts = [
      {
        productId: 'SAMPLE001',
        productName: '애플 에어팟 프로 2세대 USB-C',
        productPrice: 299000,
        productImage: '',
        productUrl: 'https://www.coupang.com/vp/products/12345',
        categoryName: '무선이어폰',
        isRocket: true,
        isFreeShipping: true,
        rating: 4.8,
        reviewCount: 15234,
        description: '애플의 프리미엄 노이즈캔슬링 이어폰',
        pros: ['노이즈캔슬링 우수', '애플 기기 연동', '컴팩트한 크기'],
        cons: ['높은 가격', '안드로이드 기능 제한']
      },
      {
        productId: 'SAMPLE002',
        productName: '삼성 갤럭시 버즈3 프로',
        productPrice: 259000,
        productImage: '1428A0/ffffff?text=Galaxy+Buds3',
        productUrl: 'https://www.coupang.com/vp/products/12346',
        categoryName: '무선이어폰',
        isRocket: true,
        isFreeShipping: true,
        rating: 4.7,
        reviewCount: 8921,
        description: '삼성의 프리미엄 무선 이어폰',
        pros: ['갤럭시 기기 최적화', '편안한 착용감', '좋은 음질'],
        cons: ['아이폰 사용시 기능 제한']
      },
      {
        productId: 'SAMPLE003',
        productName: 'QCY T13 ANC 무선 이어폰',
        productPrice: 29900,
        productImage: 'FF6B6B/ffffff?text=QCY+T13',
        productUrl: 'https://www.coupang.com/vp/products/12347',
        categoryName: '무선이어폰',
        isRocket: true,
        isFreeShipping: true,
        rating: 4.3,
        reviewCount: 32156,
        description: '가성비 좋은 노이즈캔슬링 이어폰',
        pros: ['저렴한 가격', '노이즈캔슬링 지원', '긴 배터리'],
        cons: ['음질 평범', '통화품질 아쉬움']
      },
      {
        productId: 'SAMPLE004',
        productName: '앤커 사운드코어 스페이스 A40',
        productPrice: 79000,
        productImage: '4ECDC4/ffffff?text=Anker+A40',
        productUrl: 'https://www.coupang.com/vp/products/12348',
        categoryName: '무선이어폰',
        isRocket: true,
        isFreeShipping: true,
        rating: 4.5,
        reviewCount: 5678,
        description: '중급 가격대 노이즈캔슬링 이어폰',
        pros: ['가성비 우수', '앱 지원', '좋은 노캔 성능'],
        cons: ['디자인 호불호']
      },
      {
        productId: 'SAMPLE005',
        productName: '소니 WF-1000XM5',
        productPrice: 379000,
        productImage: 'FFD93D/000000?text=Sony+XM5',
        productUrl: 'https://www.coupang.com/vp/products/12349',
        categoryName: '무선이어폰',
        isRocket: true,
        isFreeShipping: true,
        rating: 4.9,
        reviewCount: 3421,
        description: '소니의 플래그십 무선 이어폰',
        pros: ['최고 수준 음질', '뛰어난 노캔', 'LDAC 지원'],
        cons: ['최고가', '크기가 다소 큼']
      }
    ];

    const data = { products: sampleProducts, categories: ['무선이어폰'] };
    await this.saveProducts(data);

    console.log(`[수동] 샘플 상품 ${sampleProducts.length}개 생성 완료`);
    console.log(`  파일 위치: ${this.productsFile}\n`);

    return sampleProducts;
  }

  /**
   * 인터랙티브 상품 추가 (CLI용 데이터)
   */
  getProductTemplate() {
    return {
      productName: '',
      productPrice: 0,
      productImage: '',
      productUrl: '',
      categoryName: '',
      isRocket: false,
      isFreeShipping: false,
      rating: 0,
      reviewCount: 0,
      description: '',
      pros: [],
      cons: []
    };
  }

  /**
   * URL에서 상품 정보 파싱 (간단 버전)
   */
  parseProductUrl(url) {
    // 쿠팡 URL에서 상품 ID 추출
    const match = url.match(/products\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * 상품 삭제
   */
  async deleteProduct(productId) {
    const data = await this.loadProducts();
    const index = data.products.findIndex(p => p.productId === productId);

    if (index === -1) {
      console.log(`[수동] 상품을 찾을 수 없음: ${productId}`);
      return false;
    }

    const removed = data.products.splice(index, 1)[0];
    await this.saveProducts(data);

    console.log(`[수동] 상품 삭제됨: ${removed.productName}`);
    return true;
  }

  /**
   * 모든 상품 삭제
   */
  async clearAllProducts() {
    await this.saveProducts({ products: [], categories: [] });
    console.log('[수동] 모든 상품 삭제됨');
  }
}

module.exports = ManualProductManager;
