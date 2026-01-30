/**
 * 상품 필터링 서비스
 *
 * 수집된 상품 데이터에서 특정 조건에 맞는 상품만 선별
 * - 할인율 기준
 * - 평점 기준
 * - 가격 범위
 * - 배송 옵션
 * - 복합 조건
 */

class ProductFilter {
  constructor() {
    // 기본 필터 설정
    this.defaultFilters = {
      minDiscountRate: 30,    // 최소 할인율 (%)
      minRating: 4.5,         // 최소 평점
      minReviewCount: 10,     // 최소 리뷰 수
      minPrice: 0,            // 최소 가격
      maxPrice: Infinity,     // 최대 가격
      rocketOnly: false,      // 로켓배송만
      freeShippingOnly: false // 무료배송만
    };
  }

  // ============================================
  // 할인율 계산
  // ============================================

  /**
   * 할인율 계산
   * @param {number} originalPrice - 원가
   * @param {number} salePrice - 판매가
   * @returns {number} 할인율 (%)
   */
  calculateDiscountRate(originalPrice, salePrice) {
    if (!originalPrice || originalPrice <= salePrice) {
      return 0;
    }
    return Math.round((1 - salePrice / originalPrice) * 100);
  }

  /**
   * 상품에 할인율 정보 추가
   */
  enrichWithDiscount(product) {
    const discountRate = this.calculateDiscountRate(
      product.originalPrice || product.basePrice,
      product.productPrice
    );

    return {
      ...product,
      discountRate,
      hasDiscount: discountRate > 0
    };
  }

  // ============================================
  // 개별 필터 함수
  // ============================================

  /**
   * 할인율 필터
   */
  filterByDiscountRate(products, minRate = 30) {
    return products.filter(p => {
      const rate = p.discountRate || this.calculateDiscountRate(
        p.originalPrice || p.basePrice,
        p.productPrice
      );
      return rate >= minRate;
    });
  }

  /**
   * 평점 필터
   */
  filterByRating(products, minRating = 4.5) {
    return products.filter(p => p.rating && p.rating >= minRating);
  }

  /**
   * 리뷰 수 필터
   */
  filterByReviewCount(products, minCount = 10) {
    return products.filter(p => p.reviewCount && p.reviewCount >= minCount);
  }

  /**
   * 가격 범위 필터
   */
  filterByPriceRange(products, minPrice = 0, maxPrice = Infinity) {
    return products.filter(p =>
      p.productPrice >= minPrice && p.productPrice <= maxPrice
    );
  }

  /**
   * 로켓배송 필터
   */
  filterByRocket(products) {
    return products.filter(p => p.isRocket === true);
  }

  /**
   * 무료배송 필터
   */
  filterByFreeShipping(products) {
    return products.filter(p => p.isFreeShipping === true);
  }

  /**
   * 카테고리 필터
   */
  filterByCategory(products, categoryKeyword) {
    const keyword = categoryKeyword.toLowerCase();
    return products.filter(p =>
      p.categoryName && p.categoryName.toLowerCase().includes(keyword)
    );
  }

  // ============================================
  // 복합 필터 (OR 조건)
  // ============================================

  /**
   * 할인율 30% 이상 OR 평점 4.5점 이상
   * (사용자 요청 조건)
   */
  filterHotDeals(products, options = {}) {
    const minDiscountRate = options.minDiscountRate ?? 30;
    const minRating = options.minRating ?? 4.5;

    console.log(`\n[필터링] 할인율 ${minDiscountRate}% 이상 OR 평점 ${minRating}점 이상\n`);

    const results = products.filter(p => {
      const discountRate = p.discountRate || this.calculateDiscountRate(
        p.originalPrice || p.basePrice,
        p.productPrice
      );
      const rating = p.rating || 0;

      const passDiscount = discountRate >= minDiscountRate;
      const passRating = rating >= minRating;

      return passDiscount || passRating;
    });

    // 결과에 필터 통과 사유 추가
    const enrichedResults = results.map(p => {
      const discountRate = p.discountRate || this.calculateDiscountRate(
        p.originalPrice || p.basePrice,
        p.productPrice
      );
      const rating = p.rating || 0;

      const reasons = [];
      if (discountRate >= minDiscountRate) {
        reasons.push(`할인 ${discountRate}%`);
      }
      if (rating >= minRating) {
        reasons.push(`평점 ${rating}점`);
      }

      return {
        ...p,
        discountRate,
        filterReasons: reasons,
        filterPassed: true
      };
    });

    this.printFilterResult(products.length, enrichedResults.length, '핫딜');

    return enrichedResults;
  }

  // ============================================
  // 복합 필터 (AND 조건)
  // ============================================

  /**
   * 여러 조건을 모두 만족하는 상품 필터링
   */
  filterByMultipleConditions(products, conditions = {}) {
    const {
      minDiscountRate,
      minRating,
      minReviewCount,
      minPrice,
      maxPrice,
      rocketOnly,
      freeShippingOnly,
      category
    } = { ...this.defaultFilters, ...conditions };

    console.log('\n[복합 필터링 조건]');
    if (minDiscountRate > 0) console.log(`  - 할인율: ${minDiscountRate}% 이상`);
    if (minRating > 0) console.log(`  - 평점: ${minRating}점 이상`);
    if (minReviewCount > 0) console.log(`  - 리뷰: ${minReviewCount}개 이상`);
    if (minPrice > 0) console.log(`  - 최소가격: ${minPrice.toLocaleString()}원`);
    if (maxPrice < Infinity) console.log(`  - 최대가격: ${maxPrice.toLocaleString()}원`);
    if (rocketOnly) console.log(`  - 로켓배송만`);
    if (freeShippingOnly) console.log(`  - 무료배송만`);
    if (category) console.log(`  - 카테고리: ${category}`);
    console.log('');

    let filtered = [...products];

    if (minDiscountRate > 0) {
      filtered = this.filterByDiscountRate(filtered, minDiscountRate);
    }
    if (minRating > 0) {
      filtered = this.filterByRating(filtered, minRating);
    }
    if (minReviewCount > 0) {
      filtered = this.filterByReviewCount(filtered, minReviewCount);
    }
    if (minPrice > 0 || maxPrice < Infinity) {
      filtered = this.filterByPriceRange(filtered, minPrice, maxPrice);
    }
    if (rocketOnly) {
      filtered = this.filterByRocket(filtered);
    }
    if (freeShippingOnly) {
      filtered = this.filterByFreeShipping(filtered);
    }
    if (category) {
      filtered = this.filterByCategory(filtered, category);
    }

    this.printFilterResult(products.length, filtered.length, '복합조건');

    return filtered;
  }

  // ============================================
  // 프리셋 필터
  // ============================================

  /**
   * 가성비 상품 (저가 + 고평점)
   */
  filterBestValue(products, maxPrice = 30000, minRating = 4.0) {
    console.log(`\n[필터링] 가성비 상품 (${maxPrice.toLocaleString()}원 이하 + ${minRating}점 이상)\n`);

    const filtered = products.filter(p =>
      p.productPrice <= maxPrice &&
      p.rating && p.rating >= minRating
    );

    this.printFilterResult(products.length, filtered.length, '가성비');
    return filtered;
  }

  /**
   * 프리미엄 상품 (고가 + 고평점 + 리뷰 다수)
   */
  filterPremium(products, minPrice = 100000, minRating = 4.5, minReviews = 50) {
    console.log(`\n[필터링] 프리미엄 상품\n`);

    const filtered = products.filter(p =>
      p.productPrice >= minPrice &&
      p.rating && p.rating >= minRating &&
      p.reviewCount && p.reviewCount >= minReviews
    );

    this.printFilterResult(products.length, filtered.length, '프리미엄');
    return filtered;
  }

  /**
   * 빠른 배송 상품 (로켓배송 + 재고 있음)
   */
  filterFastDelivery(products) {
    console.log(`\n[필터링] 빠른 배송 상품 (로켓배송)\n`);

    const filtered = this.filterByRocket(products);

    this.printFilterResult(products.length, filtered.length, '빠른배송');
    return filtered;
  }

  // ============================================
  // 정렬
  // ============================================

  /**
   * 할인율 높은 순 정렬
   */
  sortByDiscountRate(products, descending = true) {
    return [...products].sort((a, b) => {
      const rateA = a.discountRate || this.calculateDiscountRate(a.originalPrice, a.productPrice);
      const rateB = b.discountRate || this.calculateDiscountRate(b.originalPrice, b.productPrice);
      return descending ? rateB - rateA : rateA - rateB;
    });
  }

  /**
   * 평점 높은 순 정렬
   */
  sortByRating(products, descending = true) {
    return [...products].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return descending ? ratingB - ratingA : ratingA - ratingB;
    });
  }

  /**
   * 가격 순 정렬
   */
  sortByPrice(products, descending = false) {
    return [...products].sort((a, b) => {
      return descending
        ? b.productPrice - a.productPrice
        : a.productPrice - b.productPrice;
    });
  }

  /**
   * 리뷰 수 순 정렬
   */
  sortByReviewCount(products, descending = true) {
    return [...products].sort((a, b) => {
      const countA = a.reviewCount || 0;
      const countB = b.reviewCount || 0;
      return descending ? countB - countA : countA - countB;
    });
  }

  // ============================================
  // 유틸리티
  // ============================================

  /**
   * 필터 결과 출력
   */
  printFilterResult(before, after, filterName) {
    const passRate = before > 0
      ? ((after / before) * 100).toFixed(1)
      : 0;

    console.log(`[${filterName} 필터 결과]`);
    console.log(`  전체: ${before}개 → 통과: ${after}개 (${passRate}%)\n`);
  }

  /**
   * 필터링된 상품 상세 출력
   */
  printFilteredProducts(products, limit = 10) {
    console.log(`\n========== 필터링된 상품 (상위 ${Math.min(limit, products.length)}개) ==========\n`);

    products.slice(0, limit).forEach((p, i) => {
      const reasons = p.filterReasons ? ` [${p.filterReasons.join(', ')}]` : '';
      const discount = p.discountRate ? ` (${p.discountRate}% 할인)` : '';
      const rating = p.rating ? ` ⭐${p.rating}` : '';

      console.log(`${i + 1}. ${p.productName.slice(0, 40)}...`);
      console.log(`   ${p.productPrice.toLocaleString()}원${discount}${rating}${reasons}`);
    });

    if (products.length > limit) {
      console.log(`\n   ... 외 ${products.length - limit}개 상품`);
    }

    console.log('\n' + '='.repeat(55) + '\n');
  }

  /**
   * 필터 통계 생성
   */
  getFilterStats(original, filtered) {
    const avgPriceBefore = original.length > 0
      ? Math.round(original.reduce((sum, p) => sum + p.productPrice, 0) / original.length)
      : 0;

    const avgPriceAfter = filtered.length > 0
      ? Math.round(filtered.reduce((sum, p) => sum + p.productPrice, 0) / filtered.length)
      : 0;

    const avgRatingBefore = original.filter(p => p.rating).length > 0
      ? (original.filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) /
         original.filter(p => p.rating).length).toFixed(2)
      : 0;

    const avgRatingAfter = filtered.filter(p => p.rating).length > 0
      ? (filtered.filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) /
         filtered.filter(p => p.rating).length).toFixed(2)
      : 0;

    return {
      original: {
        count: original.length,
        avgPrice: avgPriceBefore,
        avgRating: avgRatingBefore
      },
      filtered: {
        count: filtered.length,
        avgPrice: avgPriceAfter,
        avgRating: avgRatingAfter
      },
      passRate: original.length > 0
        ? ((filtered.length / original.length) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

module.exports = ProductFilter;
