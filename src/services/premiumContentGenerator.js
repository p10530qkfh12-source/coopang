/**
 * 프리미엄 컨텐츠 생성기
 *
 * 10년차 IT/라이프스타일 전문 블로거 스타일의 고품질 글 생성
 * - 공감형 도입부
 * - 스펙 → 혜택 전환
 * - 감성적 소제목
 * - 친절한 블로그 말투
 */

class PremiumContentGenerator {
  constructor() {
    // 클릭 유도 제목 템플릿
    this.titleTemplates = [
      '자취생 필수템 발견! {keyword} 솔직 리뷰 ✨',
      '삶의 질 수직상승하는 {keyword} 추천 BEST {count}',
      '{keyword} 고민이라면? 이거 하나로 해결됐어요 😊',
      '2026년 {keyword} 이거 사세요 (진심)',
      '써보고 반한 {keyword} 추천 | 가성비 끝판왕',
      '드디어 찾은 인생템! {keyword} 솔직 후기',
      '{keyword} 뭐 살지 고민될 때 보세요',
      '매일 쓰는 {keyword}, 제대로 고르는 법 알려드릴게요',
    ];

    // 공감형 도입부 템플릿 (카테고리별)
    this.introTemplates = {
      '무선이어폰': [
        '요즘 출퇴근길 지하철에서 음악 듣거나 영상 보시는 분들 정말 많으시죠? 저도 그중 한 명인데요, 유선 이어폰 줄 엉키는 거 진짜 스트레스더라고요 😅',
        '운동할 때 이어폰 줄이 거슬려서 집중이 안 된 적 있으시죠? 저도 그래서 무선이어폰을 찾아보기 시작했어요.',
        '카페에서 일하다 보면 주변 소음 때문에 집중이 안 될 때가 많잖아요. 노이즈캔슬링 이어폰 찾으시는 분들 많으실 것 같아요!',
      ],
      '보조배터리': [
        '밖에서 폰 배터리 1% 뜨는 순간... 그 공포 다들 아시죠? 😱 저도 몇 번 당하고 나서 보조배터리는 필수템이 됐어요.',
        '요즘 스마트폰 배터리 하루 버티기 힘드시죠? 특히 영상 많이 보시거나 게임 하시는 분들은 더 그러실 거예요.',
        '여행 갈 때 보조배터리 없으면 불안한 분들 손! 🙋 저도 그래서 이번에 제대로 알아봤어요.',
      ],
      '블루투스스피커': [
        '집에서 음악 틀어놓고 요리하거나 청소할 때 그 기분 아시죠? ✨ 폰 스피커로는 뭔가 아쉬운데... 하시는 분들 많으실 거예요.',
        '캠핑이나 피크닉 갈 때 분위기 있게 음악 틀고 싶은데, 어떤 스피커가 좋을지 고민되시죠?',
        '재택근무하면서 좋은 음악 들으면서 일하고 싶은데, 스피커 뭐가 좋을지 찾아보신 적 있으시죠?',
      ],
      '충전케이블': [
        '충전 케이블 또 고장났어요... 몇 개월 못 쓰고 버리는 거 너무 아깝지 않으세요? 😤',
        '급속충전 된다길래 샀는데 생각보다 느린 케이블, 다들 한 번쯤 경험해보셨죠?',
        '케이블 하나 사는 것도 은근 고민되더라고요. 싼 거 사면 금방 고장나고, 비싼 건 부담되고...',
      ],
      '스마트워치': [
        '운동할 때 일일이 기록하기 귀찮으신 분들 많으시죠? 저도 그랬는데 스마트워치 쓰고 나서 완전 달라졌어요! 💪',
        '폰 꺼내지 않고 알림 확인하고 싶을 때 많잖아요. 특히 회의 중이나 운동할 때요.',
        '건강 관리에 관심 생기셨는데 어디서부터 시작해야 할지 모르겠는 분들! 스마트워치가 답이에요.',
      ],
      'default': [
        '요즘 이거 없으면 불편한 분들 많으시죠? 저도 처음엔 "이게 필요할까?" 싶었는데, 쓰다 보니 없으면 안 되는 필수템이 됐어요 😊',
        '뭐 살지 고민될 때 제일 답답하잖아요. 그래서 제가 직접 써보고 비교해봤어요!',
        '가격도 천차만별, 종류도 너무 많아서 뭘 골라야 할지 막막하셨죠? 오늘 그 고민 해결해드릴게요 ✨',
      ]
    };

    // 스펙 → 혜택 변환 맵
    this.specToBenefit = {
      // 배터리
      '5000mAh': '하루 종일 밖에서 써도 배터리 걱정 없어요',
      '10000mAh': '스마트폰 2~3번은 거뜬히 충전할 수 있어요',
      '20000mAh': '여행 가도 며칠은 충전기 없이 버틸 수 있어요',
      // 충전
      '고속충전': '잠깐 충전해도 금방금방 차서 급할 때 딱이에요',
      '45W': '노트북도 충전할 수 있는 파워풀한 출력이에요',
      '100W': '노트북, 태블릿, 폰 다 빠르게 충전 가능해요',
      // 무선이어폰
      '노이즈캔슬링': '카페나 지하철에서도 내 음악에만 집중할 수 있어요',
      'ANC': '주변 소음 싹 차단해서 몰입감이 완전 달라요',
      '로켓배송': '오늘 주문하면 내일 바로 받아볼 수 있어요 🚀',
      '무료배송': '배송비 걱정 없이 부담 없이 주문할 수 있어요',
      // 방수
      'IP67': '비 오는 날이나 운동 중 땀에도 걱정 없어요',
      'IPX4': '가벼운 물방울이나 땀 정도는 거뜬해요',
      // 기타
      '무선': '선 없이 자유롭게 사용할 수 있어서 편해요',
      '블루투스': '폰이랑 연결도 간편하고 끊김 없이 잘 돼요',
    };

    // 감성적 소제목
    this.subheadings = {
      features: '✨ 실제로 써보면 체감되는 장점',
      specs: '📋 꼼꼼하게 살펴본 스펙 정리',
      review: '💬 솔직한 사용 후기',
      pros: '👍 이래서 추천해요',
      cons: '🤔 구매 전 알아두세요',
      recommend: '🎯 이런 분들께 강력 추천!',
      avoid: '⚠️ 이런 분들은 다시 생각해보세요',
      summary: '📝 한눈에 보는 총정리',
      analysis: '🔍 AI가 분석한 이 상품의 핵심',
      buying: '💡 구매 전 체크리스트',
    };

    // 추천 대상 템플릿
    this.recommendFor = {
      '무선이어폰': [
        '출퇴근길에 음악/팟캐스트 듣는 분',
        '운동할 때 이어폰 쓰시는 분',
        '카페에서 집중해서 일하고 싶은 분',
        '영상통화 자주 하시는 분',
      ],
      '보조배터리': [
        '외근이 잦은 직장인',
        '여행을 자주 다니시는 분',
        '폰 배터리 소모가 빠른 분',
        '캠핑/등산 좋아하시는 분',
      ],
      '블루투스스피커': [
        '집에서 음악 들으며 시간 보내시는 분',
        '캠핑/피크닉 자주 가시는 분',
        '홈파티 좋아하시는 분',
        '재택근무하시는 분',
      ],
      '충전케이블': [
        '케이블 자주 고장나서 스트레스 받으신 분',
        '급속충전 필요하신 분',
        '여러 기기 충전하시는 분',
        '깔끔한 정리 원하시는 분',
      ],
      '스마트워치': [
        '건강 관리에 관심 있으신 분',
        '운동 기록하고 싶은 분',
        '알림을 빠르게 확인하고 싶은 분',
        '패션 아이템으로도 활용하고 싶은 분',
      ],
    };
  }

  /**
   * 클릭 유도 제목 생성
   */
  generateTitle(keyword, count) {
    const template = this.titleTemplates[Math.floor(Math.random() * this.titleTemplates.length)];
    return template
      .replace('{keyword}', keyword)
      .replace('{count}', count);
  }

  /**
   * 공감형 도입부 생성
   */
  generateIntro(keyword, products) {
    const intros = this.introTemplates[keyword] || this.introTemplates['default'];
    const intro = intros[Math.floor(Math.random() * intros.length)];

    const avgPrice = Math.round(products.reduce((sum, p) => sum + p.productPrice, 0) / products.length);

    return `
<p>${intro}</p>

<p>그래서 오늘은 제가 직접 비교하고 분석해본 <strong>${keyword}</strong> 추천 제품 ${products.length}가지를 소개해드리려고 해요.
평균 ${avgPrice.toLocaleString()}원대 가격으로 구성했고, 가성비부터 프리미엄까지 다양하게 담아봤어요! 🛒</p>

<p>끝까지 읽어보시면 분명 마음에 드는 제품 찾으실 수 있을 거예요 😊</p>
`;
  }

  /**
   * 스펙을 혜택으로 변환
   */
  convertSpecToBenefit(spec) {
    for (const [key, benefit] of Object.entries(this.specToBenefit)) {
      if (spec.toLowerCase().includes(key.toLowerCase())) {
        return benefit;
      }
    }
    return spec;
  }

  /**
   * 상품 특징을 혜택 관점으로 설명
   */
  generateBenefits(product) {
    const benefits = [];

    if (product.isRocket) {
      benefits.push('🚀 로켓배송으로 오늘 주문하면 내일 도착해요');
    }
    if (product.isFreeShipping) {
      benefits.push('📦 무료배송이라 부담 없이 주문할 수 있어요');
    }
    if (product.rating >= 4.5) {
      benefits.push(`⭐ 평점 ${product.rating}점! 구매자들의 만족도가 높아요`);
    }
    if (product.reviewCount >= 1000) {
      benefits.push(`💬 리뷰 ${product.reviewCount.toLocaleString()}개, 검증된 인기 상품이에요`);
    }
    if (product.pros && product.pros.length > 0) {
      product.pros.forEach(pro => {
        benefits.push(`✅ ${this.convertSpecToBenefit(pro)}`);
      });
    }

    return benefits;
  }

  /**
   * AI 분석 섹션 생성
   */
  generateAIAnalysis(product) {
    // 평점 기반 한 줄 요약
    let summary = '';
    if (product.rating >= 4.7) {
      summary = '거의 모든 구매자가 만족하는 검증된 제품이에요. 눈 감고 사도 후회 없을 거예요! 👍';
    } else if (product.rating >= 4.3) {
      summary = '대체로 만족하는 평가가 많아요. 가격 대비 괜찮은 선택이 될 수 있어요.';
    } else if (product.rating >= 4.0) {
      summary = '호불호가 조금 갈리는 편이에요. 본인 용도에 맞는지 꼼꼼히 확인해보세요.';
    } else {
      summary = '리뷰를 꼼꼼히 읽어보시고 신중하게 결정하시길 권해요.';
    }

    // 가격대별 분석
    let priceAnalysis = '';
    if (product.productPrice < 30000) {
      priceAnalysis = '💰 가성비 제품이에요. 부담 없이 써보기 좋아요.';
    } else if (product.productPrice < 100000) {
      priceAnalysis = '💎 적당한 가격에 괜찮은 품질을 기대할 수 있어요.';
    } else if (product.productPrice < 300000) {
      priceAnalysis = '✨ 중고가 제품으로, 확실한 퀄리티를 원하시는 분께 추천해요.';
    } else {
      priceAnalysis = '👑 프리미엄 제품이에요. 최고의 경험을 원하신다면 이거예요.';
    }

    // 주의사항 생성
    const warnings = [];
    if (product.cons && product.cons.length > 0) {
      product.cons.forEach(con => {
        warnings.push(con);
      });
    }
    if (product.productPrice > 200000) {
      warnings.push('가격대가 있으니 예산 확인해보세요');
    }

    return { summary, priceAnalysis, warnings };
  }

  /**
   * 개별 상품 카드 HTML 생성
   */
  generateProductCard(product, index, keyword) {
    const benefits = this.generateBenefits(product);
    const analysis = this.generateAIAnalysis(product);

    const priceText = product.productPrice.toLocaleString();

    return `
<div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">

  <h3 style="margin-top: 0; font-size: 1.4em; color: #2c3e50;">
    ${index}위. ${product.productName}
  </h3>

  ${product.productImage ? `
  <div style="text-align: center; margin: 16px 0;">
    <img src="${product.productImage}" alt="${product.productName}" style="max-width: 100%; max-height: 300px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" />
  </div>
  ` : ''}

  <div style="background: #fff; border-radius: 12px; padding: 16px; margin: 16px 0;">
    <p style="font-size: 1.5em; color: #e74c3c; font-weight: bold; margin: 0;">
      💵 ${priceText}원
    </p>
    ${product.rating ? `
    <p style="color: #666; margin: 8px 0 0 0;">
      ⭐ ${product.rating}점 (리뷰 ${product.reviewCount?.toLocaleString() || 0}개)
    </p>
    ` : ''}
  </div>

  <h4 style="color: #34495e; margin-top: 20px;">${this.subheadings.features}</h4>
  <ul style="line-height: 1.8; color: #555;">
    ${benefits.map(b => `<li>${b}</li>`).join('\n    ')}
  </ul>

  <div style="background: #e8f4fd; border-left: 4px solid #3498db; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
    <h4 style="margin-top: 0; color: #2980b9;">${this.subheadings.analysis}</h4>
    <p style="margin: 8px 0;"><strong>📊 한 줄 평가:</strong> ${analysis.summary}</p>
    <p style="margin: 8px 0;">${analysis.priceAnalysis}</p>
    ${analysis.warnings.length > 0 ? `
    <p style="margin: 8px 0; color: #e67e22;"><strong>⚠️ 구매 전 체크:</strong> ${analysis.warnings.join(', ')}</p>
    ` : ''}
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${product.productUrl}" target="_blank" rel="noopener noreferrer sponsored"
       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; box-shadow: 0 4px 15px rgba(102,126,234,0.4);">
      ✨ 최저가 보러가기
    </a>
  </div>

</div>
`;
  }

  /**
   * 추천 대상 섹션 생성
   */
  generateRecommendSection(keyword) {
    const targets = this.recommendFor[keyword] || [
      '이 제품이 필요하신 모든 분',
      '가성비 좋은 제품을 찾으시는 분',
      '품질 좋은 제품을 원하시는 분',
    ];

    return `
<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 16px; padding: 24px; margin: 30px 0;">
  <h2 style="margin-top: 0; color: #2c3e50;">${this.subheadings.recommend}</h2>
  <ul style="line-height: 2; font-size: 1.1em;">
    ${targets.map(t => `<li>✅ ${t}</li>`).join('\n    ')}
  </ul>
</div>
`;
  }

  /**
   * 마무리 섹션 생성
   */
  generateOutro(keyword, products) {
    const cheapest = products.reduce((min, p) => p.productPrice < min.productPrice ? p : min, products[0]);
    const bestRated = products.reduce((max, p) => (p.rating || 0) > (max.rating || 0) ? p : max, products[0]);

    return `
<div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin: 30px 0;">
  <h2 style="margin-top: 0;">${this.subheadings.summary}</h2>

  <p>오늘 소개해드린 ${keyword} ${products.length}가지, 어떠셨나요? 😊</p>

  <p>간단히 정리해드리자면:</p>
  <ul style="line-height: 1.8;">
    <li><strong>💰 가성비 최고:</strong> ${cheapest.productName.slice(0, 25)}... (${cheapest.productPrice.toLocaleString()}원)</li>
    <li><strong>⭐ 평점 최고:</strong> ${bestRated.productName.slice(0, 25)}... (${bestRated.rating}점)</li>
  </ul>

  <p>제품 선택에 조금이라도 도움이 되셨으면 좋겠어요.
  궁금한 점 있으시면 댓글로 남겨주세요! 💬</p>

  <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
    ※ 가격은 변동될 수 있으니 구매 전 꼭 확인해주세요!
  </p>
</div>
`;
  }

  /**
   * 공정위 광고 표시
   */
  getFtcDisclaimer() {
    return `
<div style="background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 0.9em; color: #856404;">
  📢 <strong>광고 표시</strong> | 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
</div>
`;
  }

  /**
   * 파트너스 고지
   */
  getPartnerDisclaimer() {
    return `
<div style="margin-top: 40px; padding: 20px; background: #f1f3f5; border-radius: 12px; font-size: 0.85em; color: #666;">
  <p><strong>🤝 쿠팡 파트너스 안내</strong></p>
  <p>위 링크를 통해 구매하시면 소정의 수수료를 받을 수 있어요.
  하지만 구매자분께 추가 비용이 발생하지 않으니 안심하세요!
  더 좋은 콘텐츠로 보답하겠습니다 😊</p>
  <p style="margin-bottom: 0;">※ 상품 정보와 가격은 작성 시점 기준이며 변동될 수 있어요.</p>
</div>
`;
  }

  /**
   * 전체 포스트 HTML 생성
   */
  generateFullPost(products, keyword) {
    const title = this.generateTitle(keyword, products.length);

    let html = '';

    // 공정위 광고 표시 (최상단)
    html += this.getFtcDisclaimer();

    // 공감형 도입부
    html += this.generateIntro(keyword, products);

    // 목차
    html += `
<div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
  <h4 style="margin-top: 0;">📑 목차</h4>
  <ol style="margin-bottom: 0; line-height: 1.8;">
    ${products.map((p, i) => `<li>${p.productName.slice(0, 30)}${p.productName.length > 30 ? '...' : ''}</li>`).join('\n    ')}
  </ol>
</div>
`;

    // 상품 카드들
    html += `<h2 style="margin-top: 40px;">🛒 ${keyword} 추천 BEST ${products.length}</h2>`;

    products.forEach((product, index) => {
      html += this.generateProductCard(product, index + 1, keyword);
    });

    // 추천 대상 섹션
    html += this.generateRecommendSection(keyword);

    // 마무리
    html += this.generateOutro(keyword, products);

    // 파트너스 고지
    html += this.getPartnerDisclaimer();

    return {
      title,
      content: html,
      excerpt: `${keyword} 추천 제품 ${products.length}가지를 소개해요. 직접 비교 분석한 솔직 리뷰와 구매 가이드까지!`
    };
  }
}

module.exports = PremiumContentGenerator;
