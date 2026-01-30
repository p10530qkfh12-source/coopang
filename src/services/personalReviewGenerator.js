/**
 * 개인 체험형 리뷰 생성기
 *
 * 상품 정보를 분석해서 마치 직접 써본 것처럼
 * 자연스럽고 친절한 말투의 블로그 포스트를 생성합니다.
 *
 * 특징:
 * - 장단점 키워드 자동 분석
 * - 3가지 템플릿 무작위 사용
 * - 1인칭 친근한 말투
 */

const fs = require('fs').promises;
const path = require('path');

class PersonalReviewGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../data/reviews');

    // 장점 키워드 매핑 (상품 속성 → 자연스러운 표현)
    this.prosKeywords = {
      isRocket: [
        '주문하고 다음 날 바로 받아볼 수 있어서 급할 때 정말 좋았어요',
        '로켓배송이라 기다림 없이 바로 써볼 수 있었어요',
        '배송이 정말 빨라서 택배 기다리는 스트레스가 없었어요'
      ],
      isFreeShipping: [
        '배송비 무료라 부담 없이 주문했어요',
        '무료배송이라 가격 그대로 구매할 수 있어서 좋았어요'
      ],
      highRating: [
        '다른 분들 후기도 대체로 좋더라고요',
        '평점이 높아서 믿고 샀는데 역시나였어요',
        '리뷰 보고 기대했는데 기대만큼 괜찮았어요'
      ],
      manyReviews: [
        '후기가 많아서 참고할 게 많았어요',
        '리뷰가 많으니까 실사용 후기 보고 결정하기 좋았어요'
      ],
      affordable: [
        '이 가격에 이 정도면 가성비 괜찮다고 생각해요',
        '부담 없는 가격이라 시험 삼아 써보기 좋았어요',
        '가격 대비 만족스러웠어요'
      ],
      midRange: [
        '너무 싸지도 비싸지도 않은 적당한 가격대예요',
        '이 정도 가격이면 품질 걱정 안 해도 될 것 같았어요'
      ],
      premium: [
        '가격이 좀 있지만 그만큼 퀄리티가 느껴졌어요',
        '투자한다 생각하고 샀는데 후회 없어요'
      ]
    };

    // 단점/주의점 키워드 매핑
    this.consKeywords = {
      lowRating: [
        '다만 호불호가 좀 있는 것 같아요',
        '일부 후기 중에 아쉽다는 분들도 계시더라고요'
      ],
      fewReviews: [
        '아직 후기가 많지 않아서 참고할 게 적었어요',
        '리뷰가 좀 적어서 고민을 좀 했었어요'
      ],
      expensive: [
        '가격이 좀 있는 편이라 고민될 수 있어요',
        '부담되는 가격일 수 있으니 꼼꼼히 비교해보세요'
      ],
      noRocket: [
        '로켓배송은 아니라서 배송이 며칠 걸렸어요',
        '급하신 분들은 배송 기간 확인해보세요'
      ],
      general: [
        '개인 취향에 따라 다를 수 있으니 참고해주세요',
        '실물은 사진이랑 조금 다를 수 있어요',
        '사이즈나 스펙은 꼭 확인하고 주문하세요'
      ]
    };

    // 카테고리별 체험 표현
    this.categoryExperiences = {
      '전자제품': {
        verbs: ['사용해봤는데', '써봤는데', '테스트해봤는데'],
        aspects: ['성능', '배터리', '연결 안정성', '소리', '화질'],
        feelings: ['만족스러웠어요', '기대 이상이었어요', '쓸만했어요', '괜찮았어요']
      },
      '패션': {
        verbs: ['입어봤는데', '착용해봤는데', '코디해봤는데'],
        aspects: ['핏', '소재감', '색감', '사이즈'],
        feelings: ['예뻤어요', '편했어요', '마음에 들었어요', '생각보다 좋았어요']
      },
      '식품': {
        verbs: ['먹어봤는데', '맛봤는데', '요리해봤는데'],
        aspects: ['맛', '양', '신선도', '포장'],
        feelings: ['맛있었어요', '괜찮았어요', '재구매 의사 있어요', '가족들도 좋아했어요']
      },
      '생활용품': {
        verbs: ['사용해봤는데', '써봤는데', '활용해봤는데'],
        aspects: ['편의성', '내구성', '디자인', '크기'],
        feelings: ['실용적이었어요', '유용했어요', '만족스러웠어요', '잘 샀다 싶었어요']
      },
      '뷰티': {
        verbs: ['발라봤는데', '사용해봤는데', '테스트해봤는데'],
        aspects: ['발림성', '지속력', '향', '용량'],
        feelings: ['좋았어요', '마음에 들었어요', '추천해요', '재구매할 것 같아요']
      },
      '기본': {
        verbs: ['사용해봤는데', '써봤는데', '받아봤는데'],
        aspects: ['품질', '디자인', '가격', '실용성'],
        feelings: ['괜찮았어요', '만족스러웠어요', '기대했던 대로였어요']
      }
    };

    // 연결 표현
    this.transitions = {
      addition: ['그리고', '또', '게다가', '여기에 더해서'],
      contrast: ['다만', '근데', '한 가지 아쉬운 점은', '솔직히 말하면'],
      conclusion: ['결론적으로', '총평하자면', '정리하자면', '한마디로']
    };
  }

  // ============================================
  // 유틸리티
  // ============================================

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  pickMultiple(array, count) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  getCategoryConfig(categoryName) {
    for (const [key, config] of Object.entries(this.categoryExperiences)) {
      if (categoryName && categoryName.includes(key)) {
        return config;
      }
    }
    return this.categoryExperiences['기본'];
  }

  // ============================================
  // 상품 분석
  // ============================================

  analyzeProduct(product) {
    const analysis = {
      pros: [],
      cons: [],
      priceLevel: 'mid',
      ratingLevel: 'mid',
      reviewLevel: 'some'
    };

    // 가격 분석
    if (product.productPrice < 20000) {
      analysis.priceLevel = 'affordable';
      analysis.pros.push(this.pickRandom(this.prosKeywords.affordable));
    } else if (product.productPrice < 100000) {
      analysis.priceLevel = 'mid';
      analysis.pros.push(this.pickRandom(this.prosKeywords.midRange));
    } else {
      analysis.priceLevel = 'premium';
      analysis.pros.push(this.pickRandom(this.prosKeywords.premium));
      analysis.cons.push(this.pickRandom(this.consKeywords.expensive));
    }

    // 배송 분석
    if (product.isRocket) {
      analysis.pros.push(this.pickRandom(this.prosKeywords.isRocket));
    } else {
      analysis.cons.push(this.pickRandom(this.consKeywords.noRocket));
    }

    if (product.isFreeShipping) {
      analysis.pros.push(this.pickRandom(this.prosKeywords.isFreeShipping));
    }

    // 평점 분석
    if (product.rating >= 4.5) {
      analysis.ratingLevel = 'high';
      analysis.pros.push(this.pickRandom(this.prosKeywords.highRating));
    } else if (product.rating < 3.5 && product.rating > 0) {
      analysis.ratingLevel = 'low';
      analysis.cons.push(this.pickRandom(this.consKeywords.lowRating));
    }

    // 리뷰 수 분석
    if (product.reviewCount >= 100) {
      analysis.reviewLevel = 'many';
      analysis.pros.push(this.pickRandom(this.prosKeywords.manyReviews));
    } else if (product.reviewCount < 20) {
      analysis.reviewLevel = 'few';
      analysis.cons.push(this.pickRandom(this.consKeywords.fewReviews));
    }

    // 일반적인 주의점 추가
    if (analysis.cons.length < 2) {
      analysis.cons.push(this.pickRandom(this.consKeywords.general));
    }

    return analysis;
  }

  // ============================================
  // 템플릿 1: 일상 대화체
  // ============================================

  generateTemplate1(product, analysis) {
    const category = this.getCategoryConfig(product.categoryName);
    const verb = this.pickRandom(category.verbs);
    const aspect = this.pickRandom(category.aspects);
    const feeling = this.pickRandom(category.feelings);

    return `# ${product.productName} 솔직 후기

안녕하세요! 오늘은 제가 최근에 구매한 **${product.productName}** 이야기를 해볼게요.

## 구매하게 된 계기

요즘 ${product.categoryName || '이런 제품'}을 찾아보다가 이 제품을 발견했어요. ${analysis.pros[0]} 그래서 고민 끝에 질렀답니다 ㅎㅎ

## 실제로 ${verb}

결론부터 말하면, ${feeling}

${aspect} 부분이 특히 ${this.pickRandom(['인상적이었어요', '좋았어요', '마음에 들었어요'])}.

### 좋았던 점 👍

${analysis.pros.map((pro, i) => `${i + 1}. ${pro}`).join('\n')}

### 아쉬웠던 점 👎

${analysis.cons.map((con, i) => `${i + 1}. ${con}`).join('\n')}

## 이런 분들께 추천해요

- ${product.productPrice < 50000 ? '가성비 좋은 제품 찾으시는 분' : '품질 좋은 제품 찾으시는 분'}
- ${product.isRocket ? '빠른 배송이 필요하신 분' : '배송 기간에 여유가 있으신 분'}
- ${product.categoryName || '이런 제품'}에 관심 있으신 분

## 상품 정보

| 항목 | 내용 |
|:---|:---|
| 가격 | ${product.productPrice.toLocaleString()}원 |
| 평점 | ${product.rating || '-'}점 |
| 리뷰 | ${product.reviewCount || 0}개 |
| 배송 | ${product.isRocket ? '🚀 로켓배송' : '일반배송'} |

**[👉 상품 보러가기](${product.productUrl})**

---
*이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.*
`;
  }

  // ============================================
  // 템플릿 2: 꼼꼼 리뷰체
  // ============================================

  generateTemplate2(product, analysis) {
    const category = this.getCategoryConfig(product.categoryName);
    const aspects = this.pickMultiple(category.aspects, 3);

    return `# [리뷰] ${product.productName} 직접 써보고 정리한 장단점

## 들어가며

${product.categoryName || '이 카테고리'} 제품 중에서 ${product.productName}을(를) 선택한 이유와 실제 사용 후기를 공유해드릴게요.

**한줄 요약**: ${analysis.pros[0]}

---

## 📦 개봉기 & 첫인상

택배로 받자마자 열어봤는데요, ${product.isRocket ? '로켓배송답게 포장도 깔끔하게 왔어요.' : '포장 상태는 양호했어요.'}

첫인상은 ${this.pickRandom(['기대했던 것과 비슷했어요', '생각보다 괜찮았어요', '사진이랑 거의 똑같았어요'])}.

---

## ✅ 장점 분석

제가 느낀 장점들을 하나씩 정리해볼게요.

${analysis.pros.map((pro, i) => `
### ${i + 1}. ${aspects[i] || '기타'}
${pro}
`).join('')}

---

## ⚠️ 단점 및 주의사항

솔직하게 아쉬웠던 부분도 말씀드릴게요.

${analysis.cons.map((con, i) => `- ${con}`).join('\n')}

---

## 💰 가격 대비 만족도

${product.productPrice.toLocaleString()}원에 구매했는데요,

${analysis.priceLevel === 'affordable' ? '이 가격이면 충분히 가성비 있다고 생각해요.' :
  analysis.priceLevel === 'premium' ? '가격이 좀 있지만 품질로 보상받는 느낌이에요.' :
  '가격 대비 적당한 만족도예요.'}

### 별점: ${'⭐'.repeat(Math.min(5, Math.ceil((product.rating || 4) )))} (${product.rating || 4}/5)

---

## 📋 상품 스펙 요약

| 구분 | 내용 |
|:---|:---|
| 상품명 | ${product.productName} |
| 가격 | ${product.productPrice.toLocaleString()}원 |
| 카테고리 | ${product.categoryName || '미분류'} |
| 배송 | ${product.isRocket ? '로켓배송' : '일반배송'} |
| 평점 | ${product.rating || '-'}점 (리뷰 ${product.reviewCount || 0}개) |

---

## 🛒 구매 링크

관심 있으신 분들은 아래 링크에서 확인해보세요!

**[상품 페이지 바로가기](${product.productUrl})**

---
*본 포스팅은 쿠팡 파트너스 활동의 일환으로 수수료를 지급받을 수 있습니다.*
`;
  }

  // ============================================
  // 템플릿 3: 친구에게 추천하는 톤
  // ============================================

  generateTemplate3(product, analysis) {
    const category = this.getCategoryConfig(product.categoryName);
    const feeling = this.pickRandom(category.feelings);

    return `# ${product.productName}, 이거 써봤는데 말이야...

야 나 이번에 ${product.categoryName || '이거'} 하나 샀거든?

**${product.productName}**인데, 오늘 솔직하게 후기 남겨볼게!

---

## 왜 샀냐면요

${analysis.pros[0]} 해서 그냥 한번 질러봤어.

가격이 **${product.productPrice.toLocaleString()}원**이었는데, ${
  analysis.priceLevel === 'affordable' ? '이 정도면 부담 없잖아?' :
  analysis.priceLevel === 'premium' ? '좀 비싸긴 한데 투자라 생각하고...' :
  '적당한 것 같아서'
} 그냥 샀지 뭐.

---

## 써보니까 어때?

음... ${feeling}

### 좋은 점 말해줄게 👍

${analysis.pros.map(pro => `> "${pro}"`).join('\n\n')}

### 근데 이건 좀 그래 👎

${analysis.cons.map(con => `> "${con}"`).join('\n\n')}

---

## 그래서 추천해?

${product.rating >= 4 ?
  '응 나는 추천해! 특히 ' + (product.isRocket ? '급하게 필요한 사람한테' : '천천히 기다릴 수 있는 사람한테') + ' 좋을 듯.' :
  '음... 사람마다 다를 것 같아. 후기 더 찾아보고 결정해!'
}

${product.productPrice < 30000 ?
  '가격도 부담 없으니까 한번 써보는 것도 나쁘지 않을 듯?' :
  '가격이 좀 있으니까 신중하게 생각해봐!'
}

---

## 상품 정보 정리

- **가격**: ${product.productPrice.toLocaleString()}원
- **평점**: ${product.rating || '아직 없음'}점
- **리뷰 수**: ${product.reviewCount || 0}개
- **배송**: ${product.isRocket ? '🚀 로켓배송 (개빠름)' : '일반배송'}

궁금하면 여기서 확인해봐!
👉 **[상품 링크](${product.productUrl})**

---

*이 글은 쿠팡 파트너스 활동으로 수수료를 받을 수 있어요~*
`;
  }

  // ============================================
  // 메인 생성 함수
  // ============================================

  /**
   * 개인 체험형 리뷰 생성
   * @param {Object} product - 상품 정보
   * @param {Object} options - 옵션 (templateNumber: 특정 템플릿 지정)
   */
  generateReview(product, options = {}) {
    // 상품 분석
    const analysis = this.analyzeProduct(product);

    // 템플릿 선택 (지정하거나 무작위)
    const templateNumber = options.templateNumber || Math.floor(Math.random() * 3) + 1;

    let content;
    switch (templateNumber) {
      case 1:
        content = this.generateTemplate1(product, analysis);
        break;
      case 2:
        content = this.generateTemplate2(product, analysis);
        break;
      case 3:
        content = this.generateTemplate3(product, analysis);
        break;
      default:
        content = this.generateTemplate1(product, analysis);
    }

    return {
      productId: product.productId,
      productName: product.productName,
      templateUsed: templateNumber,
      content,
      analysis,
      wordCount: content.split(/\s+/).length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 여러 상품 일괄 생성
   */
  generateBulkReviews(products, options = {}) {
    console.log(`\n[리뷰 생성] ${products.length}개 상품의 개인 체험형 리뷰 생성 중...\n`);

    const reviews = products.map((product, index) => {
      // 각 상품마다 다른 템플릿 사용 (순환)
      const templateNumber = options.rotateTemplates
        ? (index % 3) + 1
        : undefined;

      const review = this.generateReview(product, { ...options, templateNumber });

      console.log(`  ${index + 1}. [템플릿${review.templateUsed}] ${product.productName.slice(0, 30)}...`);

      return review;
    });

    console.log(`\n[완료] ${reviews.length}개 리뷰 생성됨\n`);
    return reviews;
  }

  /**
   * 리뷰를 파일로 저장
   */
  async saveReview(review, filename) {
    await fs.mkdir(this.outputDir, { recursive: true });

    const safeName = (filename || review.productName)
      .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40);

    const timestamp = Date.now();
    const filepath = path.join(this.outputDir, `${safeName}_${timestamp}.md`);

    await fs.writeFile(filepath, review.content, 'utf-8');
    console.log(`[저장] ${filepath}`);

    return filepath;
  }

  /**
   * 여러 리뷰 일괄 저장
   */
  async saveBulkReviews(reviews) {
    console.log(`\n[저장] ${reviews.length}개 리뷰 저장 중...\n`);

    const savedFiles = [];
    for (const review of reviews) {
      const filepath = await this.saveReview(review);
      savedFiles.push({
        productId: review.productId,
        productName: review.productName,
        templateUsed: review.templateUsed,
        filepath,
        wordCount: review.wordCount
      });
    }

    console.log(`\n[완료] ${savedFiles.length}개 파일 저장됨`);
    console.log(`       위치: ${this.outputDir}\n`);

    return savedFiles;
  }
}

module.exports = PersonalReviewGenerator;
