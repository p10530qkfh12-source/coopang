/**
 * 프리미엄 컨텐츠 생성기 v2.0
 *
 * 10년차 IT/라이프스타일 전문 블로거 스타일
 * - 클릭 유도 제목
 * - 공감형 도입부 (개인 경험 기반)
 * - 스펙 → 혜택 전환
 * - 감성적 소제목
 * - AI 분석 + 개인 조언
 * - 친근한 블로그 말투 (~해요, ~입니다)
 */

const linkGenerator = require('../utils/linkGenerator');

class PremiumContentGenerator {
  constructor() {
    this.initTemplates();
  }

  initTemplates() {
    // 클릭 유도 제목 템플릿 (다양화)
    this.titleTemplates = [
      // 공감형
      '자취생 필수템 발견! {keyword} 솔직 리뷰 ✨',
      '{keyword} 뭐 살지 고민될 때 읽어보세요',
      '3개월 써보고 알려드리는 {keyword} 추천',

      // 강조형
      '삶의 질 수직상승! {keyword} BEST {count} 추천',
      '2026년 {keyword} 이거 사세요 (진심)',
      '드디어 찾은 인생템! {keyword} 후기',

      // 호기심형
      '{keyword} 고민이라면? 이거 하나로 끝났어요 😊',
      '왜 진작 안 샀을까... {keyword} 리얼 후기',
      '{keyword} 바꾸고 달라진 일상 (솔직 고백)',

      // 실용형
      '가성비 끝판왕 {keyword} 추천 | 써보고 반함',
      '매일 쓰는 {keyword}, 제대로 고르는 법',
      '{keyword} 구매 전 꼭 알아야 할 것들',
    ];

    // 카테고리별 공감형 도입부 (개인 경험 스토리)
    this.introTemplates = {
      '무선이어폰': [
        '저 진짜 유선 이어폰 쓸 때 줄 엉키는 거 때문에 스트레스 엄청 받았거든요? 😅 가방에서 꺼낼 때마다 실타래처럼 꼬여있고... 출근길 지하철에서 한참 풀고 있으면 진짜 짜증났어요.',
        '카페에서 노트북 작업하다 보면 주변 대화 소리 때문에 집중이 안 될 때 많지 않으세요? 저도 그래서 노이즈캔슬링 이어폰을 찾아보기 시작했는데요.',
        '운동할 때 이어폰 줄이 팔에 걸리면 진짜 거슬리잖아요 💦 런닝할 때도 그렇고 홈트할 때도 그렇고... 무선이어폰으로 바꾸고 운동 집중도가 확 달라졌어요!',
      ],
      '노트북': [
        '재택근무 시작하고 나서 노트북 성능 때문에 스트레스 받으신 분들 많으시죠? 저도 기존 노트북이 너무 느려서 화상회의 중에 렉 걸릴 때마다 식은땀 났거든요 😰',
        '카페에서 작업하시는 분들은 노트북 무게 진짜 중요하잖아요. 저도 매일 들고 다니다 보니까 어깨가 아파서 가벼운 노트북 찾아봤어요.',
        '요즘 영상 편집이나 개발하시는 분들 많은데, 노트북 사양 때문에 작업 속도 답답하셨죠? 어떤 노트북이 가성비 좋은지 제가 직접 비교해봤어요!',
      ],
      '공기청정기': [
        '봄만 되면 미세먼지 때문에 창문도 못 열잖아요 😷 저도 아침마다 공기질 앱 확인하는 게 일상이 됐는데... 그래서 집에 공기청정기를 들였거든요.',
        '저희 집 강아지가 털이 많이 빠지는 편이라 먼지가 장난 아니었어요. 공기청정기 틀고 나서 확실히 공기가 달라진 게 느껴지더라고요!',
        '아기 있는 집은 공기질 신경 많이 쓰이시죠? 저도 조카 때문에 언니네 공기청정기 고르는 거 도와줬는데, 그때 알아본 것들 공유해드릴게요.',
      ],
      '로봇청소기': [
        '퇴근하고 청소할 힘이 없는 분들... 저만 그런 거 아니죠? 😂 맨날 미루다가 주말에 몰아서 하는데, 로봇청소기 사고 나서 진짜 인생이 달라졌어요!',
        '저희 집 고양이 털 때문에 하루에 한 번은 청소해야 하거든요. 근데 매일 하기 너무 귀찮아서 로봇청소기를 들였는데... 대만족이에요!',
        '맞벌이하시는 분들은 평일에 청소하기 진짜 힘드시죠? 저도 그래서 로봇청소기 고민하다가 결국 샀는데, 왜 진작 안 샀나 후회했어요.',
      ],
      '키보드': [
        '하루 종일 타이핑하시는 분들, 손목 아프신 적 없으세요? 저도 개발자인데 싸구려 키보드 쓰다가 손목 아파서 병원 갔었거든요 😅',
        '기계식 키보드 처음 써보고 충격받았어요. 타건감이 이렇게 다르다니... 막 타이핑하고 싶은 느낌 아시죠? ⌨️',
        '재택근무하면서 좋은 키보드 하나 장만하시는 분들 많더라고요. 저도 그중 한 명인데, 어떤 키보드가 좋은지 직접 비교해봤어요!',
      ],
      '보조배터리': [
        '밖에서 폰 배터리 1% 뜨는 순간... 그 공포 다들 아시죠? 😱 저도 몇 번 당하고 나서 보조배터리는 필수템이 됐어요.',
        '여행 가서 사진 찍다 보면 배터리가 순삭이잖아요 📸 작년 여행 때 폰 꺼져서 고생한 후로 보조배터리 꼭 챙겨요.',
        '요즘 스마트폰 배터리 하루 버티기 힘드시죠? 저도 그래서 대용량 보조배터리 알아봤는데, 공유해드릴게요!',
      ],
      '블루투스스피커': [
        '집에서 음악 틀어놓고 요리할 때 그 기분 아시죠? ✨ 폰 스피커로는 뭔가 아쉬운데... 스피커 하나 들이니까 집 분위기가 확 달라졌어요!',
        '캠핑 가서 분위기 있게 음악 틀고 싶은데, 어떤 스피커가 좋을지 고민되시죠? 저도 캠핑 시작하면서 알아본 것들 공유해드릴게요 🏕️',
        '저 재택근무하면서 스피커로 음악 틀어놓고 일하거든요. 확실히 집중도 잘 되고 기분도 좋아지더라고요!',
      ],
      '충전케이블': [
        '충전 케이블 또 고장났어요... 😤 몇 개월 못 쓰고 버리는 거 너무 아깝지 않으세요?',
        '급속충전 된다길래 샀는데 생각보다 느린 케이블, 다들 한 번쯤 경험해보셨죠?',
        '케이블 하나 사는 것도 은근 고민되더라고요. 싼 거 사면 금방 고장나고, 비싼 건 부담되고...',
      ],
      '스마트워치': [
        '운동 기록 수첩에 적다가 포기하신 분들 손! 🙋 저도 그랬는데 스마트워치 쓰고 나서 운동 습관이 완전 달라졌어요.',
        '회의 중에 폰 확인하기 애매할 때 많잖아요. 스마트워치로 알림만 확인하면 되니까 진짜 편하더라고요!',
        '건강 관리 시작하고 싶은데 어디서부터 해야 할지 모르겠는 분들! 스마트워치가 생각보다 많은 걸 해줘요 💪',
      ],
      'default': [
        '저도 처음엔 "이게 꼭 필요할까?" 싶었거든요. 근데 한 번 써보니까 없으면 불편한 필수템이 되더라고요 😊',
        '뭐 살지 고민될 때 제일 답답하잖아요. 저도 그래서 며칠 동안 비교하고 분석해봤어요!',
        '종류도 많고 가격도 천차만별이라 뭘 골라야 할지 막막하셨죠? 오늘 그 고민 같이 해결해봐요 ✨',
      ]
    };

    // 스펙 → 혜택 변환 (확장)
    this.specToBenefit = {
      // 배터리/충전
      '5000mAh': '하루 종일 써도 배터리 걱정 없어요',
      '10000mAh': '폰 2~3번 풀충전해도 여유 있어요',
      '20000mAh': '여행 가도 며칠은 버틸 수 있는 용량이에요',
      '고속충전': '바쁠 때 잠깐 충전해도 금방 차요',
      '급속충전': '10분만 충전해도 쓸 만큼 차더라고요',
      '45W': '노트북도 충전할 수 있는 파워예요',
      '65W': '맥북도 거뜬히 충전하는 출력이에요',
      '100W': '노트북, 태블릿, 폰 다 빠르게 충전돼요',

      // 이어폰
      '노이즈캔슬링': '주변 소음 싹 차단돼서 집중할 때 딱이에요',
      'ANC': '카페에서도 내 음악에만 집중할 수 있어요',
      '통화품질': '상대방이 제 목소리 잘 들린다고 하더라고요',
      '멀티포인트': '노트북이랑 폰 번갈아 연결할 때 편해요',

      // 배송
      '로켓배송': '오늘 주문하면 내일 바로 받아볼 수 있어요 🚀',
      '무료배송': '배송비 걱정 없이 주문할 수 있어요',
      '당일배송': '급할 때 당일에 받을 수 있어서 좋아요',

      // 방수
      'IP67': '물에 빠뜨려도 걱정 없는 방수 등급이에요',
      'IP68': '수영장에서도 쓸 수 있는 완벽 방수예요',
      'IPX4': '땀이나 가벼운 물방울 정도는 거뜬해요',
      'IPX5': '샤워 중에도 쓸 수 있어요',

      // 무선/연결
      '무선': '선 없이 자유롭게 쓸 수 있어서 편해요',
      '블루투스': '연결도 간편하고 끊김 없이 잘 돼요',
      '블루투스 5.0': '연결 안정성이 확실히 좋아졌어요',
      '블루투스 5.3': '배터리 효율도 좋고 끊김도 거의 없어요',

      // 노트북
      '가벼운': '매일 들고 다녀도 어깨 안 아파요',
      '경량': '카페 갈 때 부담 없이 들고 다닐 수 있어요',
      'M3': '영상 편집도 거뜬히 돌아가요',
      'M2': '발열 거의 없이 조용하게 작업할 수 있어요',

      // 청소기
      '자동비움': '먼지통 비우는 것도 알아서 해줘요',
      '물걸레': '청소기 돌리고 물걸레질까지 한 번에 돼요',
      'LiDAR': '가구 피해서 꼼꼼하게 청소해요',

      // 공기청정기
      'HEPA': '미세먼지까지 99% 잡아줘요',
      '헤파필터': '초미세먼지도 걸러내는 고성능 필터예요',
      '공기질센서': '공기 상태 보고 알아서 세기 조절해요',
    };

    // 감성적 소제목
    this.subheadings = {
      intro: '💭 들어가며',
      features: '✨ 실제로 써보니까 이게 좋더라고요',
      specs: '📋 스펙 꼼꼼히 살펴보기',
      honest: '💬 솔직한 사용 후기',
      pros: '👍 이래서 추천해요',
      cons: '🤔 아쉬운 점도 있어요',
      recommend: '🎯 이런 분들께 강력 추천!',
      notFor: '⚠️ 이런 분들은 다시 생각해보세요',
      summary: '📝 총정리',
      analysis: '🤖 AI가 분석한 이 상품의 핵심',
      myPick: '💜 개인적인 추천',
      tip: '💡 구매 전 꿀팁',
      compare: '⚖️ 다른 제품과 비교하면',
    };

    // 추천 대상
    this.recommendFor = {
      '무선이어폰': [
        '출퇴근길에 음악이나 팟캐스트 듣는 분',
        '카페에서 집중해서 일하고 싶은 분',
        '운동할 때 이어폰 쓰시는 분',
        '영상통화 자주 하시는 분',
      ],
      '노트북': [
        '재택근무하시는 직장인',
        '카페 작업 많이 하시는 분',
        '영상 편집이나 개발하시는 분',
        '가벼운 노트북 찾으시는 분',
      ],
      '공기청정기': [
        '미세먼지 민감하신 분',
        '반려동물 키우시는 분',
        '아이가 있는 가정',
        '알레르기 있으신 분',
      ],
      '로봇청소기': [
        '평일에 청소할 시간 없는 직장인',
        '반려동물 털 때문에 고민이신 분',
        '넓은 집에 사시는 분',
        '청소하기 귀찮은 분 (저요 😂)',
      ],
      '키보드': [
        '하루 종일 타이핑하시는 분',
        '손목 건강 신경 쓰시는 분',
        '타건감 좋은 키보드 찾으시는 분',
        '재택근무 환경 업그레이드하고 싶은 분',
      ],
      '보조배터리': [
        '외근이 잦은 직장인',
        '여행 자주 다니시는 분',
        '폰 배터리 소모 빠른 분',
        '캠핑/등산 좋아하시는 분',
      ],
      '블루투스스피커': [
        '집에서 음악 들으며 시간 보내시는 분',
        '캠핑/피크닉 자주 가시는 분',
        '재택근무하시는 분',
        '홈파티 좋아하시는 분',
      ],
      '충전케이블': [
        '케이블 자주 고장나서 스트레스받으신 분',
        '급속충전 필요하신 분',
        '여러 기기 충전하시는 분',
        '내구성 좋은 케이블 찾으시는 분',
      ],
      '스마트워치': [
        '건강 관리 시작하고 싶은 분',
        '운동 기록 남기고 싶은 분',
        '알림 빠르게 확인하고 싶은 분',
        '패션 아이템으로도 활용하고 싶은 분',
      ],
    };

    // 비추천 대상
    this.notRecommendFor = {
      '무선이어폰': ['유선 이어폰 음질에 만족하시는 분', '충전하는 게 귀찮으신 분'],
      '노트북': ['무거운 게임 위주로 하시는 분 (데스크탑 추천)', '예산이 많이 제한적이신 분'],
      '공기청정기': ['환기 자주 하시는 분', '작은 원룸에 사시는 분'],
      '로봇청소기': ['바닥에 물건이 많은 집', '문턱이 높은 집'],
      '키보드': ['소음에 민감한 사무실에서 쓰실 분 (저소음 축 추천)'],
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
   * 공감형 도입부 생성 (스토리텔링)
   */
  generateIntro(keyword, products) {
    const intros = this.introTemplates[keyword] || this.introTemplates['default'];
    const intro = intros[Math.floor(Math.random() * intros.length)];

    const avgPrice = Math.round(products.reduce((sum, p) => sum + p.productPrice, 0) / products.length);
    const minPrice = Math.min(...products.map(p => p.productPrice));
    const maxPrice = Math.max(...products.map(p => p.productPrice));

    return `
<div style="margin-bottom: 30px; line-height: 1.9; color: #333;">
  <p style="font-size: 1.05em;">${intro}</p>

  <p>그래서 제가 직접 <strong>${keyword}</strong> 여러 개를 비교해보고,
  ${products.length}가지 제품을 엄선해서 가져왔어요!</p>

  <p>가격대는 ${minPrice.toLocaleString()}원부터 ${maxPrice.toLocaleString()}원까지 다양하게 구성했고,
  <strong>가성비 좋은 제품</strong>부터 <strong>프리미엄 제품</strong>까지 골고루 담아봤어요 🛒</p>

  <p>각 제품마다 <em>장점, 단점, 이런 분께 추천</em>까지 솔직하게 정리했으니까,
  끝까지 읽어보시면 본인에게 딱 맞는 제품 찾으실 수 있을 거예요 😊</p>
</div>
`;
  }

  /**
   * 스펙을 혜택으로 변환
   */
  convertSpecToBenefit(spec) {
    if (!spec) return spec;

    for (const [key, benefit] of Object.entries(this.specToBenefit)) {
      if (spec.toLowerCase().includes(key.toLowerCase())) {
        return benefit;
      }
    }
    return spec;
  }

  /**
   * 상품 혜택 생성 (사용자 관점)
   */
  generateBenefits(product) {
    const benefits = [];

    // 배송 관련
    if (product.isRocket) {
      benefits.push('🚀 <strong>로켓배송</strong>으로 오늘 주문하면 내일 받아볼 수 있어요');
    }
    if (product.isFreeShipping) {
      benefits.push('📦 <strong>무료배송</strong>이라 부담 없이 주문할 수 있어요');
    }

    // 평점/리뷰 관련
    if (product.rating >= 4.7) {
      benefits.push(`⭐ <strong>평점 ${product.rating}점</strong>! 거의 대부분의 구매자가 만족했어요`);
    } else if (product.rating >= 4.5) {
      benefits.push(`⭐ <strong>평점 ${product.rating}점</strong>으로 만족도가 높은 편이에요`);
    }

    if (product.reviewCount >= 10000) {
      benefits.push(`💬 <strong>리뷰 ${product.reviewCount.toLocaleString()}개</strong>! 엄청난 인기 상품이에요`);
    } else if (product.reviewCount >= 1000) {
      benefits.push(`💬 <strong>리뷰 ${product.reviewCount.toLocaleString()}개</strong>로 충분히 검증된 제품이에요`);
    }

    // 할인 관련
    if (product.discountRate >= 20) {
      benefits.push(`🔥 지금 <strong>${product.discountRate}% 할인 중</strong>이라 구매 타이밍 좋아요`);
    }

    // 장점 변환
    if (product.pros && product.pros.length > 0) {
      product.pros.forEach(pro => {
        benefits.push(`✅ ${this.convertSpecToBenefit(pro)}`);
      });
    }

    return benefits;
  }

  /**
   * AI 분석 섹션 (개인 조언 포함)
   */
  generateAIAnalysis(product, index) {
    // 평점 기반 한 줄 평가
    let summary = '';
    let emoji = '';

    if (product.rating >= 4.8) {
      summary = '리뷰를 보면 거의 모든 분이 만족하셨어요. 눈 감고 사도 후회 없는 제품이에요!';
      emoji = '🏆';
    } else if (product.rating >= 4.5) {
      summary = '대체로 만족하는 평가가 많아요. 가격 대비 충분히 괜찮은 선택이에요.';
      emoji = '👍';
    } else if (product.rating >= 4.2) {
      summary = '호불호가 조금 있는 편이에요. 본인 용도에 맞는지 확인해보세요.';
      emoji = '🤔';
    } else {
      summary = '리뷰를 꼼꼼히 읽어보시고 신중하게 결정하시는 게 좋겠어요.';
      emoji = '⚠️';
    }

    // 가격대 분석
    let priceAdvice = '';
    if (product.productPrice < 30000) {
      priceAdvice = '💰 <strong>가성비 제품</strong>이에요. 가볍게 써보기 좋은 가격대예요.';
    } else if (product.productPrice < 100000) {
      priceAdvice = '💎 <strong>적당한 가격</strong>에 괜찮은 품질을 기대할 수 있어요.';
    } else if (product.productPrice < 300000) {
      priceAdvice = '✨ <strong>중고가 제품</strong>이에요. 확실한 퀄리티를 원하시면 추천해요.';
    } else {
      priceAdvice = '👑 <strong>프리미엄 제품</strong>이에요. 최고의 경험을 원하신다면 이거예요.';
    }

    // 주의사항
    const warnings = [];
    if (product.cons && product.cons.length > 0) {
      product.cons.forEach(con => warnings.push(con));
    }
    if (product.productPrice > 300000 && product.rating < 4.5) {
      warnings.push('가격대 대비 평점이 조금 아쉬워요');
    }

    // 개인 추천 코멘트
    let personalComment = '';
    if (index === 1 && product.rating >= 4.5) {
      personalComment = '개인적으로 가장 추천하는 제품이에요! ⭐';
    } else if (product.productPrice < 50000 && product.rating >= 4.3) {
      personalComment = '가성비 찾으시면 이 제품 진짜 괜찮아요 👍';
    } else if (product.rating >= 4.8) {
      personalComment = '평점만 봐도 알 수 있는 인기 제품이에요!';
    }

    return { summary, emoji, priceAdvice, warnings, personalComment };
  }

  /**
   * 개별 상품 카드 HTML 생성
   */
  generateProductCard(product, index, keyword) {
    const benefits = this.generateBenefits(product);
    const analysis = this.generateAIAnalysis(product, index);
    const priceText = product.productPrice.toLocaleString();

    // 할인 배지
    const discountBadge = product.discountRate ? `
      <span style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
        ${product.discountRate}% OFF
      </span>
    ` : '';

    // 배송 배지
    const badges = [];
    if (product.isRocket) {
      badges.push('<span style="background: #3498db; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.8em; font-weight: 500;">🚀 로켓배송</span>');
    }
    if (product.isFreeShipping) {
      badges.push('<span style="background: #27ae60; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.8em; font-weight: 500;">📦 무료배송</span>');
    }

    // 순위 배지 스타일
    const rankStyle = index === 1 ?
      'background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);' :
      'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';

    return `
<!-- ${index}위 상품 카드 -->
<div class="product-card" style="
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  margin: 32px 0;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
">

  <!-- 헤더: 순위 + 배지 -->
  <div style="display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
    <span style="
      ${rankStyle}
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">${index}</span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">${badges.join('')}</div>
  </div>

  <!-- 상품명 -->
  <h3 style="margin: 0 0 20px 0; font-size: 1.35em; color: #1a1a1a; line-height: 1.5; font-weight: 600;">
    ${product.productName}
  </h3>

  <!-- 상품 이미지 -->
  ${product.productImage ? `
  <div style="text-align: center; margin: 24px 0; background: #fafafa; border-radius: 16px; padding: 24px;">
    <img src="${product.productImage}" alt="${product.productName}"
      style="max-width: 100%; max-height: 300px; border-radius: 12px; object-fit: contain;"
      loading="lazy" />
  </div>
  ` : ''}

  <!-- 가격 정보 -->
  <div style="background: linear-gradient(145deg, #f8f9fa 0%, #fff 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #eee;">
    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
      <span style="font-size: 1.8em; color: #e74c3c; font-weight: bold;">
        ${priceText}원
      </span>
      ${discountBadge}
    </div>
    ${product.basePrice && product.basePrice > product.productPrice ? `
    <p style="color: #999; margin: 0; font-size: 0.95em; text-decoration: line-through;">
      정가 ${product.basePrice.toLocaleString()}원
    </p>
    ` : ''}
    ${product.rating ? `
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
      <span style="color: #f39c12; font-size: 1.2em;">★</span>
      <strong style="color: #333; font-size: 1.1em;">${product.rating}</strong>
      <span style="color: #777; font-size: 0.95em;"> · 리뷰 ${(product.reviewCount || 0).toLocaleString()}개</span>
    </div>
    ` : ''}
  </div>

  <!-- 장점 (혜택 관점) -->
  <div style="margin: 28px 0;">
    <h4 style="color: #2c3e50; margin: 0 0 16px 0; font-size: 1.1em;">${this.subheadings.features}</h4>
    <ul style="line-height: 2.1; color: #444; padding-left: 0; margin: 0; list-style: none;">
      ${benefits.map(b => `<li style="margin: 8px 0; padding-left: 8px;">${b}</li>`).join('\n      ')}
    </ul>
  </div>

  <!-- AI 분석 박스 -->
  <div style="
    background: linear-gradient(145deg, #f0f4ff 0%, #faf0ff 100%);
    border-left: 5px solid #7c3aed;
    padding: 24px;
    border-radius: 0 16px 16px 0;
    margin: 28px 0;
  ">
    <h4 style="margin: 0 0 16px 0; color: #5b21b6; font-size: 1.05em;">
      ${this.subheadings.analysis}
    </h4>

    <p style="margin: 12px 0; color: #333; line-height: 1.8;">
      ${analysis.emoji} <strong>한 줄 평가:</strong> ${analysis.summary}
    </p>

    <p style="margin: 12px 0; color: #333; line-height: 1.8;">
      ${analysis.priceAdvice}
    </p>

    ${analysis.warnings.length > 0 ? `
    <p style="margin: 12px 0 0 0; color: #ea580c; line-height: 1.8;">
      ⚠️ <strong>구매 전 체크:</strong> ${analysis.warnings.join(', ')}
    </p>
    ` : ''}

    ${analysis.personalComment ? `
    <p style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px dashed #d8b4fe; color: #7c3aed; font-weight: 500;">
      💜 ${analysis.personalComment}
    </p>
    ` : ''}
  </div>

  <!-- CTA 버튼 -->
  <div style="text-align: center; margin-top: 28px;">
    ${linkGenerator.generateProductButton(product, '👉 최저가 확인하기', `
      display: inline-block;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: #fff;
      padding: 18px 48px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 1.15em;
      box-shadow: 0 8px 25px rgba(231,76,60,0.35);
      transition: all 0.3s ease;
    `.replace(/\s+/g, ' ').trim())}
  </div>

</div>
`;
  }

  /**
   * 추천 대상 섹션
   */
  generateRecommendSection(keyword) {
    const targets = this.recommendFor[keyword] || [
      '이 제품이 필요하신 모든 분',
      '가성비 좋은 제품 찾으시는 분',
      '품질 좋은 제품 원하시는 분',
    ];

    const notFor = this.notRecommendFor[keyword] || [];

    return `
<div style="background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); border-radius: 20px; padding: 28px; margin: 36px 0;">
  <h2 style="margin: 0 0 20px 0; color: #1a5d1a; font-size: 1.3em;">${this.subheadings.recommend}</h2>
  <ul style="line-height: 2.2; font-size: 1.05em; color: #2d572c; padding-left: 24px; margin: 0;">
    ${targets.map(t => `<li style="margin: 6px 0;">✅ ${t}</li>`).join('\n    ')}
  </ul>
</div>

${notFor.length > 0 ? `
<div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%); border-radius: 20px; padding: 28px; margin: 36px 0;">
  <h2 style="margin: 0 0 20px 0; color: #c92a2a; font-size: 1.3em;">${this.subheadings.notFor}</h2>
  <ul style="line-height: 2.2; font-size: 1.05em; color: #862e2e; padding-left: 24px; margin: 0;">
    ${notFor.map(t => `<li style="margin: 6px 0;">❌ ${t}</li>`).join('\n    ')}
  </ul>
</div>
` : ''}
`;
  }

  /**
   * 마무리 섹션 (친근한 정리)
   */
  generateOutro(keyword, products) {
    const cheapest = products.reduce((min, p) => p.productPrice < min.productPrice ? p : min, products[0]);
    const bestRated = products.reduce((max, p) => (p.rating || 0) > (max.rating || 0) ? p : max, products[0]);
    const mostReviewed = products.reduce((max, p) => (p.reviewCount || 0) > (max.reviewCount || 0) ? p : max, products[0]);

    return `
<div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 32px; margin: 40px 0;">
  <h2 style="margin: 0 0 24px 0; color: #1e293b; font-size: 1.4em;">${this.subheadings.summary}</h2>

  <p style="line-height: 1.9; color: #475569; margin-bottom: 20px;">
    오늘 소개해드린 <strong>${keyword}</strong> ${products.length}가지, 도움이 되셨나요? 😊
  </p>

  <div style="background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 12px 0; color: #334155;"><strong>💡 빠른 정리:</strong></p>
    <ul style="line-height: 2; color: #475569; margin: 0; padding-left: 24px;">
      <li><strong>💰 가성비 최고:</strong> ${cheapest.productName.slice(0, 28)}${cheapest.productName.length > 28 ? '...' : ''} (${cheapest.productPrice.toLocaleString()}원)</li>
      <li><strong>⭐ 평점 최고:</strong> ${bestRated.productName.slice(0, 28)}${bestRated.productName.length > 28 ? '...' : ''} (${bestRated.rating || '-'}점)</li>
      <li><strong>🔥 인기 최고:</strong> ${mostReviewed.productName.slice(0, 28)}${mostReviewed.productName.length > 28 ? '...' : ''} (리뷰 ${(mostReviewed.reviewCount || 0).toLocaleString()}개)</li>
    </ul>
  </div>

  <p style="line-height: 1.9; color: #475569; margin: 20px 0;">
    저도 여러 제품 비교하면서 많이 배웠는데요,
    결국 <strong>본인의 사용 환경</strong>에 맞는 제품이 제일 좋은 것 같아요!
  </p>

  <p style="line-height: 1.9; color: #475569;">
    궁금한 점이나 더 알고 싶은 제품 있으시면 <strong>댓글</strong>로 남겨주세요!
    최대한 빨리 답변드릴게요 💬
  </p>

  <p style="color: #94a3b8; font-size: 0.9em; margin: 24px 0 0 0; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
    ※ 가격은 시시각각 변할 수 있으니 구매 전 꼭 확인해주세요!<br>
    ※ 이 글이 도움이 되셨다면 <strong>공유</strong> 부탁드려요 🙏
  </p>
</div>
`;
  }

  /**
   * 반응형 스타일
   */
  getResponsiveStyles() {
    return `
<style>
  .coupang-post { max-width: 100%; padding: 0 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .coupang-post * { box-sizing: border-box; }
  .coupang-post p { margin: 0 0 16px 0; }
  .product-card { margin: 24px 0; }
  .product-card img { max-width: 100%; height: auto; }

  @media (max-width: 768px) {
    .coupang-post { padding: 0 12px; }
    .product-card { padding: 20px !important; margin: 20px 0 !important; }
    .product-card h3 { font-size: 1.15em !important; }
    .ftc-box { padding: 16px !important; }
  }

  @media (max-width: 480px) {
    .product-card { padding: 16px !important; }
    .product-card h3 { font-size: 1.05em !important; line-height: 1.4 !important; }
  }
</style>
`;
  }

  /**
   * 공정위 광고 표시
   */
  getFtcDisclaimer() {
    return `
<div class="ftc-box" style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px 28px;
  margin-bottom: 32px;
  color: #fff;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
">
  <p style="margin: 0; font-size: 0.95em; line-height: 1.7;">
    <span style="background: rgba(255,255,255,0.25); padding: 5px 12px; border-radius: 20px; font-weight: bold; margin-right: 10px;">AD</span>
    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
  </p>
</div>
`;
  }

  /**
   * 파트너스 고지 (하단)
   */
  getPartnerDisclaimer() {
    return `
<div class="ftc-box" style="
  margin-top: 50px;
  padding: 32px;
  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  border: 2px solid #dee2e6;
">
  <h4 style="margin: 0 0 16px 0; color: #495057; font-size: 1.1em;">
    🤝 쿠팡 파트너스 안내
  </h4>

  <p style="margin: 0 0 12px 0; color: #666; font-size: 0.95em; line-height: 1.9;">
    위 링크를 통해 구매하시면 저에게 소정의 수수료가 지급돼요.
    <strong>구매자분께 추가 비용은 전혀 없으니</strong> 안심하세요!
  </p>

  <p style="margin: 0 0 16px 0; color: #666; font-size: 0.95em; line-height: 1.9;">
    여러분의 구매가 더 좋은 콘텐츠를 만드는 힘이 됩니다.
    항상 감사드려요! 😊
  </p>

  <div style="padding-top: 16px; border-top: 1px dashed #ced4da;">
    <p style="margin: 0; color: #888; font-size: 0.85em; line-height: 1.7;">
      ※ 상품 정보와 가격은 작성 시점 기준이에요.<br>
      ※ 구매 전 상품 상세 페이지에서 최신 정보 확인해주세요!
    </p>
  </div>
</div>
`;
  }

  /**
   * 전체 포스트 생성
   */
  generateFullPost(products, keyword) {
    const title = this.generateTitle(keyword, products.length);

    let html = '';

    // 반응형 스타일
    html += this.getResponsiveStyles();

    // 메인 컨테이너
    html += '<div class="coupang-post">';

    // 공정위 표시
    html += this.getFtcDisclaimer();

    // 도입부
    html += this.generateIntro(keyword, products);

    // 목차
    html += `
<div style="
  background: #fff;
  border-radius: 16px;
  padding: 24px 28px;
  margin: 32px 0;
  border: 2px solid #f0f0f0;
">
  <h4 style="margin: 0 0 16px 0; color: #333; font-size: 1.1em;">
    📑 오늘 소개할 제품들
  </h4>
  <ol style="margin: 0; padding-left: 24px; line-height: 2.2; color: #555;">
    ${products.map((p, i) => `
    <li style="margin: 4px 0;">
      ${p.productName.slice(0, 40)}${p.productName.length > 40 ? '...' : ''}
    </li>
    `).join('')}
  </ol>
</div>
`;

    // 상품 카드
    html += `
<h2 style="margin: 44px 0 24px 0; color: #1e293b; font-size: 1.5em;">
  🛒 ${keyword} 추천 BEST ${products.length}
</h2>
`;

    products.forEach((product, index) => {
      html += this.generateProductCard(product, index + 1, keyword);
    });

    // 추천 대상
    html += this.generateRecommendSection(keyword);

    // 마무리
    html += this.generateOutro(keyword, products);

    // 파트너스 고지
    html += this.getPartnerDisclaimer();

    // 컨테이너 종료
    html += '</div>';

    return {
      title,
      content: html,
      excerpt: `${keyword} 추천 ${products.length}가지! 직접 비교 분석한 솔직 리뷰와 구매 가이드까지 ✨`
    };
  }
}

module.exports = PremiumContentGenerator;
