/**
 * 리뷰 초안 생성기
 * 상품 정보를 분석하여 SEO 친화적이고 독창적인 리뷰 초안을 작성
 *
 * 주의: 이 도구는 개인 블로그용 리뷰 "초안"을 생성합니다.
 * 최종 발행 전 반드시 직접 검토하고 개인 경험을 추가하세요.
 */

class ReviewDraftGenerator {
  constructor() {
    // 다양한 표현을 위한 어휘 풀
    this.vocabulary = {
      // 긍정적 특징 표현
      positive: [
        '눈에 띄는 점은', '특히 인상적인 부분은', '주목할 만한 특징으로는',
        '가장 마음에 드는 점은', '실용적인 측면에서'
      ],
      // 가격 관련 표현
      price: {
        cheap: ['합리적인 가격대', '가성비가 좋은', '부담 없는 가격'],
        mid: ['중간 가격대의', '적정 가격의', '균형 잡힌 가격'],
        expensive: ['프리미엄 가격대의', '투자 가치가 있는', '고급 라인의']
      },
      // 배송 관련 표현
      shipping: {
        rocket: ['로켓배송으로 빠르게 받아볼 수 있어요', '익일 배송이 가능한 로켓배송 상품이에요'],
        free: ['무료배송이라 부담이 적어요', '배송비 걱정 없이 주문할 수 있어요'],
        normal: ['일반 배송 상품이에요', '배송 기간을 여유있게 잡으시면 좋겠어요']
      },
      // 평점 관련 표현
      rating: {
        high: ['구매자 평점이 높은 편이에요', '많은 분들이 만족하신 상품이에요'],
        mid: ['평균적인 평점을 받고 있어요', '호불호가 있을 수 있는 상품이에요'],
        low: ['평점이 다소 낮은 편이니 신중하게 고려해보세요', '개선이 필요해 보이는 부분이 있어요']
      },
      // 리뷰 수 관련
      reviews: {
        many: ['리뷰가 많아 참고하기 좋아요', '다양한 실사용 후기를 확인할 수 있어요'],
        some: ['어느 정도 리뷰가 쌓인 상품이에요', '참고할 만한 후기들이 있어요'],
        few: ['아직 리뷰가 많지 않아요', '초기 상품이라 후기가 적은 편이에요']
      },
      // 연결어
      transitions: [
        '그리고', '또한', '더불어', '아울러', '한편'
      ],
      // 마무리 표현
      conclusions: [
        '구매를 고려하시는 분들께 참고가 되셨으면 해요.',
        '개인적인 필요에 맞게 선택하시면 좋겠어요.',
        '꼼꼼히 비교해보시고 결정하시길 추천드려요.',
        '실제 구매 전 상세 스펙을 한번 더 확인해보세요.'
      ]
    };

    // 카테고리별 특화 키워드
    this.categoryKeywords = {
      '전자제품': ['성능', '스펙', '호환성', '내구성', 'AS'],
      '패션': ['소재', '핏', '사이즈', '세탁', '코디'],
      '식품': ['맛', '신선도', '유통기한', '원산지', '포장'],
      '생활용품': ['편의성', '내구성', '수납', '청소', '관리'],
      '뷰티': ['성분', '발림성', '지속력', '향', '용량'],
      '기본': ['품질', '가격', '디자인', '실용성', '만족도']
    };
  }

  /**
   * 랜덤 요소 선택 (다양성 확보)
   */
  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 가격대 분석
   */
  analyzePriceRange(price) {
    if (price < 20000) return 'cheap';
    if (price < 100000) return 'mid';
    return 'expensive';
  }

  /**
   * 평점 분석
   */
  analyzeRating(rating) {
    if (rating >= 4.5) return 'high';
    if (rating >= 3.5) return 'mid';
    return 'low';
  }

  /**
   * 리뷰 수 분석
   */
  analyzeReviewCount(count) {
    if (count >= 100) return 'many';
    if (count >= 20) return 'some';
    return 'few';
  }

  /**
   * 상품명에서 주요 키워드 추출
   */
  extractKeywords(productName) {
    // 브랜드명, 모델명 등 주요 단어 추출
    const words = productName.split(/[\s\/\[\]\(\)]+/).filter(w => w.length > 1);
    // 숫자나 단위만 있는 것 제외
    return words.filter(w => !/^[\d]+[a-zA-Z]*$/.test(w)).slice(0, 5);
  }

  /**
   * 카테고리 키워드 가져오기
   */
  getCategoryKeywords(categoryName) {
    for (const [key, keywords] of Object.entries(this.categoryKeywords)) {
      if (categoryName.includes(key)) {
        return keywords;
      }
    }
    return this.categoryKeywords['기본'];
  }

  /**
   * SEO 친화적 제목 생성
   */
  generateTitle(product) {
    const keywords = this.extractKeywords(product.productName);
    const mainKeyword = keywords[0] || '상품';

    const titleTemplates = [
      `${mainKeyword} 구매 전 체크포인트`,
      `${mainKeyword} 상세 분석 리뷰`,
      `${mainKeyword} 장단점 솔직 정리`,
      `${product.productName.slice(0, 30)} 리뷰`
    ];

    return this.pickRandom(titleTemplates);
  }

  /**
   * 도입부 생성
   */
  generateIntro(product) {
    const priceRange = this.analyzePriceRange(product.productPrice);
    const priceDesc = this.pickRandom(this.vocabulary.price[priceRange]);

    const intros = [
      `오늘은 ${priceDesc} ${product.categoryName} 상품을 살펴보려고 해요.`,
      `${product.categoryName} 카테고리에서 관심 가는 상품을 발견했어요.`,
      `${priceDesc} 상품을 찾다가 이 제품을 발견하게 되었어요.`
    ];

    return this.pickRandom(intros);
  }

  /**
   * 기본 정보 섹션 생성
   */
  generateBasicInfo(product) {
    const lines = [
      `## 기본 정보\n`,
      `- **상품명**: ${product.productName}`,
      `- **가격**: ${product.productPrice.toLocaleString()}원`,
      `- **카테고리**: ${product.categoryName}`
    ];

    if (product.isRocket) {
      lines.push(`- **배송**: 로켓배송`);
    }

    if (product.rating > 0) {
      lines.push(`- **평점**: ${product.rating}점`);
    }

    if (product.reviewCount > 0) {
      lines.push(`- **리뷰 수**: ${product.reviewCount}개`);
    }

    return lines.join('\n');
  }

  /**
   * 특징 분석 섹션 생성
   */
  generateFeatureAnalysis(product) {
    const sections = [];
    sections.push(`## 주요 특징 분석\n`);

    // 가격 분석
    const priceRange = this.analyzePriceRange(product.productPrice);
    sections.push(`### 가격대`);
    sections.push(this.pickRandom(this.vocabulary.price[priceRange]) + '로 분류할 수 있어요.');
    sections.push('');

    // 배송 분석
    sections.push(`### 배송`);
    if (product.isRocket) {
      sections.push(this.pickRandom(this.vocabulary.shipping.rocket));
    } else if (product.isFreeShipping) {
      sections.push(this.pickRandom(this.vocabulary.shipping.free));
    } else {
      sections.push(this.pickRandom(this.vocabulary.shipping.normal));
    }
    sections.push('');

    // 평점/리뷰 분석
    if (product.rating > 0 || product.reviewCount > 0) {
      sections.push(`### 구매자 반응`);

      if (product.rating > 0) {
        const ratingLevel = this.analyzeRating(product.rating);
        sections.push(this.pickRandom(this.vocabulary.rating[ratingLevel]));
      }

      if (product.reviewCount > 0) {
        const reviewLevel = this.analyzeReviewCount(product.reviewCount);
        sections.push(this.pickRandom(this.vocabulary.reviews[reviewLevel]));
      }
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * 체크포인트 섹션 생성 (구매 전 확인사항)
   */
  generateCheckpoints(product) {
    const categoryKeywords = this.getCategoryKeywords(product.categoryName);

    const sections = [
      `## 구매 전 체크포인트\n`,
      `다음 사항들을 확인해보시면 좋겠어요:\n`
    ];

    // 랜덤하게 3-4개 선택
    const shuffled = categoryKeywords.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(4, shuffled.length));

    selected.forEach((keyword, index) => {
      sections.push(`${index + 1}. **${keyword}** - 본인의 기준에 맞는지 확인해보세요.`);
    });

    return sections.join('\n');
  }

  /**
   * 개인 메모 섹션 (사용자가 채울 영역)
   */
  generatePersonalSection() {
    return `
## 나의 메모 (직접 작성)

> 이 섹션은 직접 상품을 검토한 후 작성해주세요.

- **실제 사용 경험**: [직접 작성]
- **장점**: [직접 작성]
- **단점**: [직접 작성]
- **추천 대상**: [직접 작성]
- **비추천 대상**: [직접 작성]
`;
  }

  /**
   * 마무리 섹션 생성
   */
  generateConclusion(product) {
    const conclusion = this.pickRandom(this.vocabulary.conclusions);

    return `
## 마무리

${conclusion}

---
*이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.*
`;
  }

  /**
   * 전체 리뷰 초안 생성
   */
  generateDraft(product) {
    const sections = [
      `# ${this.generateTitle(product)}\n`,
      this.generateIntro(product),
      '',
      this.generateBasicInfo(product),
      '',
      this.generateFeatureAnalysis(product),
      this.generateCheckpoints(product),
      this.generatePersonalSection(),
      this.generateConclusion(product)
    ];

    const draft = sections.join('\n');

    return {
      title: this.generateTitle(product),
      content: draft,
      wordCount: draft.split(/\s+/).length,
      generatedAt: new Date().toISOString(),
      productId: product.productId,
      seoKeywords: this.extractKeywords(product.productName)
    };
  }

  /**
   * 여러 상품의 리뷰 초안 일괄 생성
   */
  generateBulkDrafts(products) {
    console.log(`\n[리뷰 생성] ${products.length}개 상품의 초안 생성 시작...\n`);

    const drafts = products.map((product, index) => {
      console.log(`  ${index + 1}/${products.length}: ${product.productName.slice(0, 30)}...`);
      return {
        product,
        draft: this.generateDraft(product)
      };
    });

    console.log(`\n[완료] ${drafts.length}개 초안 생성됨\n`);
    return drafts;
  }
}

module.exports = ReviewDraftGenerator;
