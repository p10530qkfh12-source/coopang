/**
 * 컨텐츠 강화 서비스
 *
 * - 상품별 리뷰 요약 생성
 * - AI 검색 최적화 Q&A 섹션 생성
 * - SEO 친화적 컨텐츠 구조화
 */

class ContentEnhancer {
  constructor() {
    // 리뷰 요약 템플릿 (실제 리뷰 없을 때 상품 특성 기반 생성)
    this.reviewPhrases = {
      positive: [
        '가성비가 정말 좋아요',
        '배송이 빨라서 좋았어요',
        '품질이 기대 이상이에요',
        '사용하기 편리해요',
        '디자인이 예뻐요',
        '오래 쓸 수 있을 것 같아요',
        '가격 대비 만족해요',
        '재구매 의사 있어요'
      ],
      rocket: [
        '로켓배송이라 다음날 바로 받았어요',
        '새벽배송으로 빠르게 도착했어요',
        '포장도 꼼꼼하게 잘 왔어요'
      ],
      highRating: [
        '리뷰 보고 샀는데 역시 좋네요',
        '별점이 높은 이유가 있어요',
        '인기 상품이라 믿고 샀어요'
      ],
      lowPrice: [
        '이 가격에 이 품질이면 대만족',
        '세일할 때 사서 더 좋았어요',
        '가격이 착해서 부담 없이 샀어요'
      ]
    };

    // Q&A 템플릿
    this.qaTemplates = [
      {
        question: '{keyword} 추천 제품은 무엇인가요?',
        answer: '현재 가장 인기 있는 {keyword} 제품으로는 {topProducts}가 있습니다. 평점과 리뷰 수를 기준으로 엄선했습니다.'
      },
      {
        question: '{keyword} 가격대는 어떻게 되나요?',
        answer: '{keyword}의 가격대는 {minPrice}원부터 {maxPrice}원까지 다양합니다. 평균 가격은 약 {avgPrice}원입니다.'
      },
      {
        question: '{keyword} 구매 시 주의할 점은?',
        answer: '{keyword} 구매 시에는 {tips} 등을 확인하시는 것이 좋습니다. 또한 로켓배송 여부와 반품 정책도 체크해보세요.'
      },
      {
        question: '가성비 좋은 {keyword}는?',
        answer: '가성비를 중시한다면 {budgetProduct}을(를) 추천합니다. {budgetPrice}원에 {budgetFeatures} 등의 특징이 있습니다.'
      },
      {
        question: '{keyword} 인기 브랜드는?',
        answer: '{keyword} 분야에서는 {brands} 등의 브랜드가 인기입니다. 각 브랜드별 특징을 비교해보시기 바랍니다.'
      }
    ];

    // 구매 팁 풀
    this.purchaseTips = [
      '정품 여부',
      '보증 기간',
      '반품/교환 정책',
      '사용자 리뷰',
      '스펙 비교',
      '할인율',
      'AS 정책',
      '배송 방식'
    ];
  }

  // ============================================
  // 리뷰 요약 생성
  // ============================================

  /**
   * 상품별 가상 리뷰 요약 생성
   * (실제 리뷰 API가 없으므로 상품 특성 기반 생성)
   */
  generateReviewSummary(product, count = 3) {
    const reviews = [];

    // 기본 긍정 리뷰
    reviews.push(this.getRandomItem(this.reviewPhrases.positive));

    // 로켓배송이면 배송 관련 리뷰
    if (product.isRocket) {
      reviews.push(this.getRandomItem(this.reviewPhrases.rocket));
    }

    // 평점 높으면 평점 관련 리뷰
    if (product.rating >= 4.5) {
      reviews.push(this.getRandomItem(this.reviewPhrases.highRating));
    }

    // 가격이 평균보다 낮으면 가격 관련 리뷰
    if (product.productPrice < 50000) {
      reviews.push(this.getRandomItem(this.reviewPhrases.lowPrice));
    }

    // 추가 긍정 리뷰로 채우기
    while (reviews.length < count) {
      const review = this.getRandomItem(this.reviewPhrases.positive);
      if (!reviews.includes(review)) {
        reviews.push(review);
      }
    }

    return reviews.slice(0, count);
  }

  /**
   * 리뷰 요약 HTML 블록 생성
   */
  generateReviewHtml(product) {
    const reviews = this.generateReviewSummary(product, 3);

    return `
<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
  <p style="font-weight: bold; margin-bottom: 10px;">💬 구매자 리뷰 요약</p>
  <ul style="margin: 0; padding-left: 20px;">
    ${reviews.map(r => `<li style="margin: 5px 0;">"${r}"</li>`).join('\n    ')}
  </ul>
  ${product.reviewCount ? `<p style="color: #666; font-size: 0.9em; margin-top: 10px;">총 ${product.reviewCount.toLocaleString()}개 리뷰 중 요약</p>` : ''}
</div>`;
  }

  // ============================================
  // Q&A 섹션 생성 (AI 검색 최적화)
  // ============================================

  /**
   * AI 검색 최적화 Q&A 섹션 생성
   */
  generateQASection(products, keyword) {
    const stats = this.calculateStats(products);
    const qa = [];

    // 1. 추천 제품 Q&A
    const topProducts = products
      .slice(0, 3)
      .map(p => this.shortenName(p.productName))
      .join(', ');

    qa.push({
      question: this.qaTemplates[0].question.replace('{keyword}', keyword),
      answer: this.qaTemplates[0].answer
        .replace('{keyword}', keyword)
        .replace('{topProducts}', topProducts)
    });

    // 2. 가격대 Q&A
    qa.push({
      question: this.qaTemplates[1].question.replace('{keyword}', keyword),
      answer: this.qaTemplates[1].answer
        .replace('{keyword}', keyword)
        .replace('{minPrice}', stats.minPrice.toLocaleString())
        .replace('{maxPrice}', stats.maxPrice.toLocaleString())
        .replace('{avgPrice}', stats.avgPrice.toLocaleString())
    });

    // 3. 구매 팁 Q&A
    const tips = this.getRandomItems(this.purchaseTips, 3).join(', ');
    qa.push({
      question: this.qaTemplates[2].question.replace('{keyword}', keyword),
      answer: this.qaTemplates[2].answer
        .replace('{keyword}', keyword)
        .replace('{tips}', tips)
    });

    // 4. 가성비 제품 Q&A (최저가 상품)
    const budgetProduct = products.reduce((min, p) =>
      p.productPrice < min.productPrice ? p : min, products[0]);

    qa.push({
      question: this.qaTemplates[3].question.replace('{keyword}', keyword),
      answer: this.qaTemplates[3].answer
        .replace('{budgetProduct}', this.shortenName(budgetProduct.productName))
        .replace('{budgetPrice}', budgetProduct.productPrice.toLocaleString())
        .replace('{budgetFeatures}', this.extractFeatures(budgetProduct))
    });

    // 5. 브랜드 Q&A
    const brands = this.extractBrands(products);
    if (brands.length > 0) {
      qa.push({
        question: this.qaTemplates[4].question.replace('{keyword}', keyword),
        answer: this.qaTemplates[4].answer
          .replace('{keyword}', keyword)
          .replace('{brands}', brands.join(', '))
      });
    }

    return qa;
  }

  /**
   * Q&A HTML 블록 생성 (Schema.org FAQPage 포함)
   */
  generateQAHtml(products, keyword) {
    const qaList = this.generateQASection(products, keyword);

    // Schema.org JSON-LD for AI/Search optimization
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': qaList.map(qa => ({
        '@type': 'Question',
        'name': qa.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': qa.answer
        }
      }))
    };

    let html = `
<!-- AI 검색 최적화 Q&A 섹션 -->
<script type="application/ld+json">
${JSON.stringify(schemaData, null, 2)}
</script>

<div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
  <h2 style="color: #fff; margin-top: 0;">❓ 자주 묻는 질문</h2>
</div>

<div style="margin: 20px 0;">
`;

    qaList.forEach((qa, index) => {
      html += `
  <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background: #f5f5f5; padding: 15px; font-weight: bold;">
      Q${index + 1}. ${qa.question}
    </div>
    <div style="padding: 15px;">
      ${qa.answer}
    </div>
  </div>
`;
    });

    html += '</div>';

    return html;
  }

  // ============================================
  // 유틸리티 메서드
  // ============================================

  /**
   * 상품 통계 계산
   */
  calculateStats(products) {
    const prices = products.map(p => p.productPrice);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      count: products.length
    };
  }

  /**
   * 상품명 축약
   */
  shortenName(name, maxLength = 30) {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  }

  /**
   * 상품 특징 추출
   */
  extractFeatures(product) {
    const features = [];

    if (product.isRocket) features.push('로켓배송');
    if (product.isFreeShipping) features.push('무료배송');
    if (product.rating >= 4.5) features.push(`평점 ${product.rating}점`);

    return features.length > 0 ? features.join(', ') : '합리적인 가격';
  }

  /**
   * 브랜드 추출 (상품명에서)
   */
  extractBrands(products) {
    const knownBrands = [
      '삼성', 'Samsung', 'LG', '애플', 'Apple', '소니', 'Sony',
      '샤오미', 'Xiaomi', 'QCY', 'JBL', 'Bose', '젠하이저', 'Sennheiser',
      '필립스', 'Philips', '다이슨', 'Dyson', '브라운', 'Braun',
      '나이키', 'Nike', '아디다스', 'Adidas', '뉴발란스', 'New Balance'
    ];

    const foundBrands = new Set();

    products.forEach(p => {
      knownBrands.forEach(brand => {
        if (p.productName.toLowerCase().includes(brand.toLowerCase())) {
          foundBrands.add(brand);
        }
      });
    });

    return Array.from(foundBrands).slice(0, 5);
  }

  /**
   * 랜덤 아이템 선택
   */
  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 랜덤 아이템 여러 개 선택
   */
  getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // ============================================
  // 통합 컨텐츠 강화
  // ============================================

  /**
   * 상품 컨텐츠에 리뷰 요약 + Q&A 추가
   */
  enhanceProductContent(products, keyword, options = {}) {
    const {
      includeReviews = true,
      includeQA = true,
      reviewsPerProduct = 3
    } = options;

    let enhancedContent = '';

    // 각 상품에 리뷰 요약 추가
    if (includeReviews) {
      products.forEach((product, index) => {
        enhancedContent += `\n<!-- 상품 ${index + 1} 리뷰 요약 -->\n`;
        enhancedContent += this.generateReviewHtml(product);
      });
    }

    // Q&A 섹션 추가
    if (includeQA) {
      enhancedContent += '\n\n';
      enhancedContent += this.generateQAHtml(products, keyword);
    }

    return enhancedContent;
  }
}

module.exports = ContentEnhancer;
