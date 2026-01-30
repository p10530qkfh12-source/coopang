/**
 * 더미 데이터 로더
 *
 * 쿠팡 API 키 승인 전까지 테스트용 데이터 제공
 * 실제 API 응답 구조와 100% 동일
 */

const fs = require('fs').promises;
const path = require('path');

class DummyDataLoader {
  constructor() {
    this.dummyDir = path.join(process.cwd(), 'data', 'dummy');
    this.categories = this.initCategories();
  }

  /**
   * 카테고리별 더미 데이터 초기화
   */
  initCategories() {
    return {
      '무선이어폰': {
        categoryId: 486898,
        products: [
          {
            productId: 7628594821,
            productName: '삼성전자 갤럭시 버즈3 프로 SM-R630 노이즈캔슬링 무선 블루투스 이어폰',
            productPrice: 289000,
            productImage: 'https://via.placeholder.com/300x300/1428A0/ffffff?text=Galaxy+Buds3+Pro',
            productUrl: 'https://www.coupang.com/vp/products/7628594821',
            shortenUrl: 'https://link.coupang.com/a/bXyZ123',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 329000,
            salePrice: 289000,
            discountRate: 12,
            rating: 4.8,
            reviewCount: 15847,
            categoryName: '무선이어폰'
          },
          {
            productId: 7891234567,
            productName: '애플 에어팟 프로 2세대 USB-C MagSafe 충전 케이스',
            productPrice: 309000,
            productImage: 'https://via.placeholder.com/300x300/333333/ffffff?text=AirPods+Pro+2',
            productUrl: 'https://www.coupang.com/vp/products/7891234567',
            shortenUrl: 'https://link.coupang.com/a/cAbC456',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 359000,
            salePrice: 309000,
            discountRate: 14,
            rating: 4.9,
            reviewCount: 28934,
            categoryName: '무선이어폰'
          },
          {
            productId: 6543219876,
            productName: '소니 WF-1000XM5 노이즈캔슬링 무선 이어폰',
            productPrice: 379000,
            productImage: 'https://via.placeholder.com/300x300/000000/ffffff?text=Sony+WF-1000XM5',
            productUrl: 'https://www.coupang.com/vp/products/6543219876',
            shortenUrl: 'https://link.coupang.com/a/dEfG789',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 429000,
            salePrice: 379000,
            discountRate: 12,
            rating: 4.9,
            reviewCount: 5621,
            categoryName: '무선이어폰'
          },
          {
            productId: 9876543210,
            productName: 'QCY T13 ANC 2세대 노이즈캔슬링 무선 이어폰',
            productPrice: 32900,
            productImage: 'https://via.placeholder.com/300x300/FF6B6B/ffffff?text=QCY+T13+ANC',
            productUrl: 'https://www.coupang.com/vp/products/9876543210',
            shortenUrl: 'https://link.coupang.com/a/hIjK012',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 49900,
            salePrice: 32900,
            discountRate: 34,
            rating: 4.4,
            reviewCount: 67823,
            categoryName: '무선이어폰'
          },
          {
            productId: 1234567890,
            productName: 'JBL TUNE 230NC TWS 노이즈캔슬링 무선 이어폰',
            productPrice: 89000,
            productImage: 'https://via.placeholder.com/300x300/FF8C00/ffffff?text=JBL+TUNE+230NC',
            productUrl: 'https://www.coupang.com/vp/products/1234567890',
            shortenUrl: 'https://link.coupang.com/a/lMnO345',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 129000,
            salePrice: 89000,
            discountRate: 31,
            rating: 4.5,
            reviewCount: 12456,
            categoryName: '무선이어폰'
          }
        ]
      },
      '노트북': {
        categoryId: 318887,
        products: [
          {
            productId: 2345678901,
            productName: '삼성전자 갤럭시북4 프로 NT940XGQ-A51A 14인치 인텔 코어 울트라5',
            productPrice: 1599000,
            productImage: 'https://via.placeholder.com/300x300/1428A0/ffffff?text=Galaxy+Book4+Pro',
            productUrl: 'https://www.coupang.com/vp/products/2345678901',
            shortenUrl: 'https://link.coupang.com/a/notebook001',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1899000,
            salePrice: 1599000,
            discountRate: 16,
            rating: 4.7,
            reviewCount: 3421,
            categoryName: '노트북'
          },
          {
            productId: 3456789012,
            productName: 'Apple 맥북 에어 15 M3 칩 8코어 CPU 256GB',
            productPrice: 1690000,
            productImage: 'https://via.placeholder.com/300x300/C0C0C0/333333?text=MacBook+Air+15',
            productUrl: 'https://www.coupang.com/vp/products/3456789012',
            shortenUrl: 'https://link.coupang.com/a/notebook002',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1890000,
            salePrice: 1690000,
            discountRate: 11,
            rating: 4.9,
            reviewCount: 8765,
            categoryName: '노트북'
          },
          {
            productId: 4567890123,
            productName: 'LG전자 그램 14Z90S-GA5CK 14인치 인텔 코어 울트라5',
            productPrice: 1449000,
            productImage: 'https://via.placeholder.com/300x300/A50034/ffffff?text=LG+gram+14',
            productUrl: 'https://www.coupang.com/vp/products/4567890123',
            shortenUrl: 'https://link.coupang.com/a/notebook003',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1649000,
            salePrice: 1449000,
            discountRate: 12,
            rating: 4.8,
            reviewCount: 5678,
            categoryName: '노트북'
          },
          {
            productId: 5678901234,
            productName: '레노버 아이디어패드 슬림5 82XF007FKR 라이젠7 7735U',
            productPrice: 799000,
            productImage: 'https://via.placeholder.com/300x300/E2231A/ffffff?text=Lenovo+IdeaPad',
            productUrl: 'https://www.coupang.com/vp/products/5678901234',
            shortenUrl: 'https://link.coupang.com/a/notebook004',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 999000,
            salePrice: 799000,
            discountRate: 20,
            rating: 4.5,
            reviewCount: 12345,
            categoryName: '노트북'
          }
        ]
      },
      '공기청정기': {
        categoryId: 184555,
        products: [
          {
            productId: 6789012345,
            productName: '삼성전자 비스포크 큐브 에어 AX053CB810SGD 53㎡',
            productPrice: 489000,
            productImage: 'https://via.placeholder.com/300x300/1428A0/ffffff?text=BESPOKE+Cube',
            productUrl: 'https://www.coupang.com/vp/products/6789012345',
            shortenUrl: 'https://link.coupang.com/a/air001',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 599000,
            salePrice: 489000,
            discountRate: 18,
            rating: 4.8,
            reviewCount: 9876,
            categoryName: '공기청정기'
          },
          {
            productId: 7890123456,
            productName: 'LG전자 퓨리케어 360 AS354NNFA 35평형 청정',
            productPrice: 579000,
            productImage: 'https://via.placeholder.com/300x300/A50034/ffffff?text=LG+PuriCare',
            productUrl: 'https://www.coupang.com/vp/products/7890123456',
            shortenUrl: 'https://link.coupang.com/a/air002',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 699000,
            salePrice: 579000,
            discountRate: 17,
            rating: 4.7,
            reviewCount: 6543,
            categoryName: '공기청정기'
          },
          {
            productId: 8901234567,
            productName: '샤오미 스마트 공기청정기 4 Pro 60㎡ 글로벌버전',
            productPrice: 189000,
            productImage: 'https://via.placeholder.com/300x300/FF6900/ffffff?text=Xiaomi+4+Pro',
            productUrl: 'https://www.coupang.com/vp/products/8901234567',
            shortenUrl: 'https://link.coupang.com/a/air003',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 259000,
            salePrice: 189000,
            discountRate: 27,
            rating: 4.6,
            reviewCount: 23456,
            categoryName: '공기청정기'
          },
          {
            productId: 9012345678,
            productName: '위닉스 타워XQ ATXH763-JWK 공기청정기 76㎡',
            productPrice: 419000,
            productImage: 'https://via.placeholder.com/300x300/00A5E3/ffffff?text=Winix+Tower',
            productUrl: 'https://www.coupang.com/vp/products/9012345678',
            shortenUrl: 'https://link.coupang.com/a/air004',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 519000,
            salePrice: 419000,
            discountRate: 19,
            rating: 4.7,
            reviewCount: 7654,
            categoryName: '공기청정기'
          }
        ]
      },
      '로봇청소기': {
        categoryId: 497135,
        products: [
          {
            productId: 1111111111,
            productName: '로보락 S8 MaxV Ultra 로봇청소기 물걸레 올인원 스테이션',
            productPrice: 1890000,
            productImage: 'https://via.placeholder.com/300x300/333333/ffffff?text=Roborock+S8',
            productUrl: 'https://www.coupang.com/vp/products/1111111111',
            shortenUrl: 'https://link.coupang.com/a/robot001',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 2190000,
            salePrice: 1890000,
            discountRate: 14,
            rating: 4.9,
            reviewCount: 4567,
            categoryName: '로봇청소기'
          },
          {
            productId: 2222222222,
            productName: '삼성전자 비스포크 제트 봇 콤보 AI VR7MD97716G',
            productPrice: 1690000,
            productImage: 'https://via.placeholder.com/300x300/1428A0/ffffff?text=BESPOKE+Jet+Bot',
            productUrl: 'https://www.coupang.com/vp/products/2222222222',
            shortenUrl: 'https://link.coupang.com/a/robot002',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1990000,
            salePrice: 1690000,
            discountRate: 15,
            rating: 4.8,
            reviewCount: 3456,
            categoryName: '로봇청소기'
          },
          {
            productId: 3333333333,
            productName: 'LG전자 코드제로 R5T 로봇청소기 R585MKA',
            productPrice: 899000,
            productImage: 'https://via.placeholder.com/300x300/A50034/ffffff?text=LG+CordZero',
            productUrl: 'https://www.coupang.com/vp/products/3333333333',
            shortenUrl: 'https://link.coupang.com/a/robot003',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1099000,
            salePrice: 899000,
            discountRate: 18,
            rating: 4.6,
            reviewCount: 8765,
            categoryName: '로봇청소기'
          },
          {
            productId: 4444444444,
            productName: '에코백스 디봇 T20 옴니 로봇청소기 물걸레 자동세척',
            productPrice: 1290000,
            productImage: 'https://via.placeholder.com/300x300/00B140/ffffff?text=ECOVACS+T20',
            productUrl: 'https://www.coupang.com/vp/products/4444444444',
            shortenUrl: 'https://link.coupang.com/a/robot004',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 1590000,
            salePrice: 1290000,
            discountRate: 19,
            rating: 4.7,
            reviewCount: 5678,
            categoryName: '로봇청소기'
          }
        ]
      },
      '키보드': {
        categoryId: 312765,
        products: [
          {
            productId: 5555555555,
            productName: '로지텍 MX Keys S 무선 키보드 블랙',
            productPrice: 149000,
            productImage: 'https://via.placeholder.com/300x300/00B7EB/ffffff?text=Logitech+MX+Keys',
            productUrl: 'https://www.coupang.com/vp/products/5555555555',
            shortenUrl: 'https://link.coupang.com/a/keyboard001',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 179000,
            salePrice: 149000,
            discountRate: 17,
            rating: 4.8,
            reviewCount: 12345,
            categoryName: '키보드'
          },
          {
            productId: 6666666666,
            productName: '앱코 HACKER K660 ARC 프리미엄 기계식 키보드 청축',
            productPrice: 59000,
            productImage: 'https://via.placeholder.com/300x300/FF0000/ffffff?text=ABKO+K660',
            productUrl: 'https://www.coupang.com/vp/products/6666666666',
            shortenUrl: 'https://link.coupang.com/a/keyboard002',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 79000,
            salePrice: 59000,
            discountRate: 25,
            rating: 4.5,
            reviewCount: 34567,
            categoryName: '키보드'
          },
          {
            productId: 7777777777,
            productName: '한성컴퓨터 GK898B OfficeMaster 무선 기계식 키보드',
            productPrice: 89000,
            productImage: 'https://via.placeholder.com/300x300/1E90FF/ffffff?text=Hansung+GK898B',
            productUrl: 'https://www.coupang.com/vp/products/7777777777',
            shortenUrl: 'https://link.coupang.com/a/keyboard003',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 109000,
            salePrice: 89000,
            discountRate: 18,
            rating: 4.6,
            reviewCount: 8901,
            categoryName: '키보드'
          },
          {
            productId: 8888888888,
            productName: 'Apple 매직 키보드 Touch ID 탑재 한글 MK293KH/A',
            productPrice: 179000,
            productImage: 'https://via.placeholder.com/300x300/C0C0C0/333333?text=Magic+Keyboard',
            productUrl: 'https://www.coupang.com/vp/products/8888888888',
            shortenUrl: 'https://link.coupang.com/a/keyboard004',
            isRocket: true,
            isFreeShipping: true,
            basePrice: 199000,
            salePrice: 179000,
            discountRate: 10,
            rating: 4.7,
            reviewCount: 6789,
            categoryName: '키보드'
          }
        ]
      }
    };
  }

  /**
   * 쿠팡 API 응답 형식으로 변환
   */
  toApiResponse(products, keyword) {
    return {
      rCode: '0',
      rMessage: '',
      data: {
        productData: products,
        totalCount: products.length,
        keyword: keyword,
        searchedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 키워드로 상품 검색 (API 시뮬레이션)
   */
  async searchProducts(keyword, limit = 5) {
    console.log(`[더미] 상품 검색: "${keyword}" (최대 ${limit}개)`);

    // 카테고리 매칭
    const matchedCategory = Object.keys(this.categories).find(cat =>
      keyword.includes(cat) || cat.includes(keyword)
    );

    let products = [];

    if (matchedCategory) {
      products = this.categories[matchedCategory].products.slice(0, limit);
    } else {
      // 매칭 안되면 랜덤 카테고리에서 가져오기
      const allProducts = Object.values(this.categories)
        .flatMap(cat => cat.products);
      products = allProducts.slice(0, limit);
    }

    // API 응답 시뮬레이션 (약간의 지연)
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[더미] ${products.length}개 상품 반환`);

    return this.toApiResponse(products, keyword);
  }

  /**
   * 카테고리별 상품 조회
   */
  async getProductsByCategory(categoryName, limit = 5) {
    console.log(`[더미] 카테고리 조회: "${categoryName}"`);

    const category = this.categories[categoryName];
    if (!category) {
      console.warn(`[더미] 카테고리 없음: ${categoryName}`);
      return this.toApiResponse([], categoryName);
    }

    const products = category.products.slice(0, limit);
    return this.toApiResponse(products, categoryName);
  }

  /**
   * 오늘의 추천 상품 (랜덤 카테고리)
   */
  async getTodayRecommendations(limit = 5) {
    const categoryNames = Object.keys(this.categories);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const todayCategory = categoryNames[dayOfYear % categoryNames.length];

    console.log(`[더미] 오늘의 추천 카테고리: ${todayCategory}`);

    return this.getProductsByCategory(todayCategory, limit);
  }

  /**
   * 모든 카테고리 목록
   */
  getCategories() {
    return Object.keys(this.categories);
  }

  /**
   * 단일 상품 조회 (ID로)
   */
  getProductById(productId) {
    for (const category of Object.values(this.categories)) {
      const product = category.products.find(p => p.productId === productId);
      if (product) return product;
    }
    return null;
  }
}

module.exports = new DummyDataLoader();
