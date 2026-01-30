/**
 * 상품 수집 서비스
 * API에서 받은 상품 데이터를 정제하고 저장하는 역할
 * 중복 필터링 기능 포함
 */

const fs = require('fs').promises;
const path = require('path');
const DuplicateChecker = require('./duplicateChecker');

class ProductCollector {
  constructor(coupangClient, options = {}) {
    this.client = coupangClient;
    this.dataDir = path.join(__dirname, '../../data');

    // 중복 체크 옵션
    this.skipDuplicates = options.skipDuplicates !== false; // 기본값: true
    this.autoMarkPosted = options.autoMarkPosted !== false; // 기본값: true

    // 중복 체커 초기화
    this.duplicateChecker = new DuplicateChecker();
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
   * 상품 데이터 정제
   * API 응답에서 필요한 정보만 추출
   */
  normalizeProduct(rawProduct) {
    return {
      productId: rawProduct.productId,
      productName: rawProduct.productName,
      productPrice: rawProduct.productPrice,
      productImage: rawProduct.productImage,
      productUrl: rawProduct.productUrl,
      categoryName: rawProduct.categoryName || '미분류',
      isRocket: rawProduct.isRocket || false,
      isFreeShipping: rawProduct.isFreeShipping || false,
      rating: rawProduct.rating || 0,
      reviewCount: rawProduct.reviewCount || 0,
      collectedAt: new Date().toISOString(),
      // 리뷰 작성을 위한 추가 필드
      reviewStatus: 'pending', // pending, drafted, published
      customNotes: ''
    };
  }

  /**
   * 키워드로 상품 수집 (중복 필터링 포함)
   * @param {string} keyword - 검색 키워드
   * @param {number} limit - 수집 개수
   * @param {Object} options - 추가 옵션
   * @param {boolean} options.skipDuplicates - 중복 건너뛰기 (기본: true)
   * @param {boolean} options.autoMarkPosted - 자동으로 포스팅 기록에 추가 (기본: true)
   */
  async collectByKeyword(keyword, limit = 20, options = {}) {
    const skipDuplicates = options.skipDuplicates ?? this.skipDuplicates;
    const autoMarkPosted = options.autoMarkPosted ?? this.autoMarkPosted;

    console.log(`\n========== 상품 수집 시작: "${keyword}" ==========\n`);

    const result = await this.client.searchProducts(keyword, limit);

    if (!result.success) {
      console.error('상품 수집 실패:', result.error);
      return { success: false, products: [], error: result.error };
    }

    let products = (result.data?.data || []).map(p => this.normalizeProduct(p));

    console.log(`[API 응답] ${products.length}개 상품 수신됨`);

    // 중복 필터링
    let duplicates = [];
    let filterStats = null;

    if (skipDuplicates) {
      const filterResult = await this.duplicateChecker.filterDuplicates(products, keyword);
      products = filterResult.newProducts;
      duplicates = filterResult.duplicates;
      filterStats = filterResult.stats;
    }

    // 결과 요약 출력
    if (products.length > 0) {
      console.log(`\n[신규 상품 목록] ${products.length}개`);
      products.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.productName.slice(0, 40)}... - ${p.productPrice.toLocaleString()}원`);
      });

      if (products.length > 5) {
        console.log(`  ... 외 ${products.length - 5}개 상품`);
      }

      // 자동으로 포스팅 기록에 추가
      if (autoMarkPosted) {
        await this.duplicateChecker.markMultipleAsPosted(products, keyword);
      }
    } else {
      console.log('\n[결과] 신규 상품이 없습니다. (모두 중복)');
    }

    return {
      success: true,
      products,
      keyword,
      duplicates,
      filterStats
    };
  }

  /**
   * 중복 체크 없이 상품 수집 (원본 그대로)
   */
  async collectByKeywordRaw(keyword, limit = 20) {
    return this.collectByKeyword(keyword, limit, {
      skipDuplicates: false,
      autoMarkPosted: false
    });
  }

  /**
   * 수집한 상품을 JSON 파일로 저장
   */
  async saveProducts(products, filename) {
    await this.ensureDataDir();

    const filepath = path.join(this.dataDir, `${filename}.json`);
    const data = {
      savedAt: new Date().toISOString(),
      count: products.length,
      products: products
    };

    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[저장 완료] ${filepath}`);

    return filepath;
  }

  /**
   * 저장된 상품 데이터 불러오기
   */
  async loadProducts(filename) {
    const filepath = path.join(this.dataDir, `${filename}.json`);

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`파일 로드 실패: ${filepath}`);
      return null;
    }
  }

  /**
   * 여러 키워드로 순차 수집 (중복 필터링 포함)
   */
  async collectMultipleKeywords(keywords, limitPerKeyword = 10, options = {}) {
    const allProducts = [];
    const allDuplicates = [];
    const keywordResults = [];

    for (const keyword of keywords) {
      const result = await this.collectByKeyword(keyword, limitPerKeyword, options);

      if (result.success) {
        // 키워드 태그 추가
        const taggedProducts = result.products.map(p => ({
          ...p,
          searchKeyword: keyword
        }));
        allProducts.push(...taggedProducts);
        allDuplicates.push(...(result.duplicates || []));

        keywordResults.push({
          keyword,
          new: result.products.length,
          duplicates: result.duplicates?.length || 0
        });
      }

      // 키워드 간 추가 지연 (서버 부담 최소화)
      if (keywords.indexOf(keyword) < keywords.length - 1) {
        console.log('\n[대기] 다음 키워드 검색 전 2초 대기...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 전체 결과 요약
    console.log('\n========== 전체 수집 결과 ==========');
    console.log(`키워드 ${keywords.length}개 검색 완료`);
    keywordResults.forEach(r => {
      console.log(`  "${r.keyword}": 신규 ${r.new}개, 중복 ${r.duplicates}개`);
    });
    console.log(`총 신규 상품: ${allProducts.length}개`);
    console.log(`총 중복 상품: ${allDuplicates.length}개`);
    console.log('=====================================\n');

    return {
      products: allProducts,
      duplicates: allDuplicates,
      keywordResults
    };
  }

  /**
   * 포스팅 기록 통계 조회
   */
  async getPostedStats() {
    return this.duplicateChecker.getStats();
  }

  /**
   * 포스팅 기록 통계 출력
   */
  async printPostedStats() {
    await this.duplicateChecker.printStats();
  }

  /**
   * 특정 상품을 재수집 가능하도록 기록에서 삭제
   */
  async allowRecollect(productId) {
    return this.duplicateChecker.removeProduct(productId);
  }

  /**
   * 오래된 기록 정리
   */
  async cleanupOldRecords(daysOld = 90) {
    return this.duplicateChecker.cleanupOldRecords(daysOld);
  }
}

module.exports = ProductCollector;
