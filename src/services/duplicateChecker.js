/**
 * 중복 포스팅 방지 모듈
 * 이미 처리한 상품 ID를 추적하여 중복 수집을 방지
 */

const fs = require('fs').promises;
const path = require('path');

class DuplicateChecker {
  constructor(options = {}) {
    this.dataDir = path.join(__dirname, '../../data');
    this.filePath = path.join(this.dataDir, 'posted_products.json');

    // 메모리 캐시 (파일 I/O 최소화)
    this.cache = null;
    this.cacheLoaded = false;
  }

  /**
   * 데이터 디렉토리 확인/생성
   */
  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // 이미 존재하면 무시
    }
  }

  /**
   * 포스팅 기록 파일 로드
   */
  async loadPostedProducts() {
    if (this.cacheLoaded) {
      return this.cache;
    }

    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(content);
      this.cacheLoaded = true;
      console.log(`[중복체크] ${Object.keys(this.cache.products).length}개의 기존 상품 ID 로드됨`);
      return this.cache;
    } catch (error) {
      // 파일이 없으면 초기화
      this.cache = {
        lastUpdated: new Date().toISOString(),
        totalCount: 0,
        products: {}  // { productId: { addedAt, keyword, status } }
      };
      this.cacheLoaded = true;
      console.log('[중복체크] 새 포스팅 기록 파일 생성');
      return this.cache;
    }
  }

  /**
   * 포스팅 기록 저장
   */
  async savePostedProducts() {
    await this.ensureDataDir();

    this.cache.lastUpdated = new Date().toISOString();
    this.cache.totalCount = Object.keys(this.cache.products).length;

    await fs.writeFile(
      this.filePath,
      JSON.stringify(this.cache, null, 2),
      'utf-8'
    );
  }

  /**
   * 상품 ID가 이미 처리되었는지 확인
   */
  async isPosted(productId) {
    const data = await this.loadPostedProducts();
    return productId in data.products;
  }

  /**
   * 상품을 포스팅 완료로 표시
   */
  async markAsPosted(productId, metadata = {}) {
    await this.loadPostedProducts();

    this.cache.products[productId] = {
      addedAt: new Date().toISOString(),
      keyword: metadata.keyword || '',
      productName: metadata.productName || '',
      status: metadata.status || 'drafted'  // drafted, published
    };

    await this.savePostedProducts();
  }

  /**
   * 여러 상품을 한번에 포스팅 완료로 표시
   */
  async markMultipleAsPosted(products, keyword = '') {
    await this.loadPostedProducts();

    for (const product of products) {
      this.cache.products[product.productId] = {
        addedAt: new Date().toISOString(),
        keyword: keyword,
        productName: product.productName?.slice(0, 50) || '',
        status: 'drafted'
      };
    }

    await this.savePostedProducts();
    console.log(`[중복체크] ${products.length}개 상품 ID 등록됨`);
  }

  /**
   * 상품 목록에서 중복 필터링
   * @returns {{ newProducts: Array, duplicates: Array, stats: Object }}
   */
  async filterDuplicates(products, keyword = '') {
    await this.loadPostedProducts();

    const newProducts = [];
    const duplicates = [];

    for (const product of products) {
      if (product.productId in this.cache.products) {
        duplicates.push({
          ...product,
          existingRecord: this.cache.products[product.productId]
        });
      } else {
        newProducts.push(product);
      }
    }

    const stats = {
      total: products.length,
      new: newProducts.length,
      duplicates: duplicates.length,
      filterRate: products.length > 0
        ? ((duplicates.length / products.length) * 100).toFixed(1) + '%'
        : '0%'
    };

    // 결과 로깅
    console.log('\n[중복 필터링 결과]');
    console.log(`  전체: ${stats.total}개`);
    console.log(`  신규: ${stats.new}개`);
    console.log(`  중복: ${stats.duplicates}개 (${stats.filterRate})`);

    if (duplicates.length > 0 && duplicates.length <= 5) {
      console.log('  중복 상품:');
      duplicates.forEach(d => {
        console.log(`    - ${d.productName?.slice(0, 30)}... (${d.existingRecord.addedAt.slice(0, 10)} 등록)`);
      });
    }

    return { newProducts, duplicates, stats };
  }

  /**
   * 상품 상태 업데이트 (drafted → published)
   */
  async updateStatus(productId, status) {
    await this.loadPostedProducts();

    if (this.cache.products[productId]) {
      this.cache.products[productId].status = status;
      this.cache.products[productId].updatedAt = new Date().toISOString();
      await this.savePostedProducts();
      return true;
    }

    return false;
  }

  /**
   * 통계 조회
   */
  async getStats() {
    await this.loadPostedProducts();

    const products = Object.values(this.cache.products);
    const drafted = products.filter(p => p.status === 'drafted').length;
    const published = products.filter(p => p.status === 'published').length;

    // 키워드별 통계
    const keywordStats = {};
    for (const product of products) {
      const kw = product.keyword || '(없음)';
      keywordStats[kw] = (keywordStats[kw] || 0) + 1;
    }

    return {
      totalProducts: products.length,
      drafted,
      published,
      lastUpdated: this.cache.lastUpdated,
      keywordStats
    };
  }

  /**
   * 통계 출력
   */
  async printStats() {
    const stats = await this.getStats();

    console.log('\n========== 포스팅 기록 통계 ==========');
    console.log(`총 등록 상품: ${stats.totalProducts}개`);
    console.log(`  - 초안 작성: ${stats.drafted}개`);
    console.log(`  - 발행 완료: ${stats.published}개`);
    console.log(`마지막 업데이트: ${stats.lastUpdated}`);

    if (Object.keys(stats.keywordStats).length > 0) {
      console.log('\n키워드별 상품 수:');
      const sorted = Object.entries(stats.keywordStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      for (const [keyword, count] of sorted) {
        console.log(`  "${keyword}": ${count}개`);
      }
    }
    console.log('======================================\n');
  }

  /**
   * 특정 상품 ID 삭제 (재수집 허용)
   */
  async removeProduct(productId) {
    await this.loadPostedProducts();

    if (this.cache.products[productId]) {
      delete this.cache.products[productId];
      await this.savePostedProducts();
      console.log(`[중복체크] 상품 ID ${productId} 삭제됨`);
      return true;
    }

    return false;
  }

  /**
   * 오래된 기록 정리 (N일 이전)
   */
  async cleanupOldRecords(daysOld = 90) {
    await this.loadPostedProducts();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let removedCount = 0;
    const productIds = Object.keys(this.cache.products);

    for (const productId of productIds) {
      const record = this.cache.products[productId];
      const recordDate = new Date(record.addedAt);

      if (recordDate < cutoffDate) {
        delete this.cache.products[productId];
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await this.savePostedProducts();
      console.log(`[중복체크] ${daysOld}일 이전 기록 ${removedCount}개 삭제됨`);
    }

    return removedCount;
  }
}

module.exports = DuplicateChecker;
