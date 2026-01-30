/**
 * 텔레그램 알림 데모
 *
 * 실행 전 .env 파일에 설정 필요:
 * TELEGRAM_BOT_TOKEN=your_bot_token
 * TELEGRAM_CHAT_ID=your_chat_id
 */

require('dotenv').config();

const TelegramNotifier = require('./services/telegramNotifier');

// 테스트용 샘플 상품
const sampleProducts = [
  {
    productId: 'P001',
    productName: '삼성 갤럭시 버즈3 프로 무선 이어폰',
    productPrice: 199000,
    discountRate: 31,
    rating: 4.7,
    isRocket: true,
    productUrl: 'https://www.coupang.com/product/12345',
    filterReasons: ['할인 31%', '평점 4.7점']
  },
  {
    productId: 'P002',
    productName: 'QCY T13 가성비 무선 이어폰',
    productPrice: 15900,
    discountRate: 47,
    rating: 4.2,
    isRocket: true,
    productUrl: 'https://www.coupang.com/product/12346',
    filterReasons: ['할인 47%']
  },
  {
    productId: 'P003',
    productName: '소니 WH-1000XM5 노이즈캔슬링 헤드폰',
    productPrice: 379000,
    discountRate: 12,
    rating: 4.9,
    isRocket: true,
    productUrl: 'https://www.coupang.com/product/12347',
    filterReasons: ['평점 4.9점']
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              텔레그램 알림 데모                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const telegram = new TelegramNotifier();

  // 설정 확인
  if (!telegram.isConfigured()) {
    telegram.printConfigError();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('메시지 포맷 미리보기 (실제 전송되지 않음)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 포맷 미리보기
    const preview = telegram.formatProductList(sampleProducts, '🔥 핫딜: 무선 이어폰');
    console.log('\n--- 전송될 메시지 미리보기 ---\n');
    console.log(preview.replace(/<[^>]*>/g, '')); // HTML 태그 제거하여 출력
    console.log('\n--- 미리보기 끝 ---\n');

    return;
  }

  // ==========================================
  // 테스트 1: 연결 테스트
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 연결 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const connected = await telegram.testConnection();
  if (!connected) {
    console.log('연결 테스트 실패. 설정을 확인해주세요.');
    return;
  }

  // ==========================================
  // 테스트 2: 핫딜 알림
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 핫딜 상품 알림 (3개 상품)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await telegram.notifyHotDeals(sampleProducts, '무선 이어폰');

  // ==========================================
  // 테스트 3: 검색 요약 알림
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 검색 결과 요약 알림');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await telegram.notifySummary(sampleProducts, '무선 이어폰');

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     사용 가능한 알림                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ notifyProduct(product)     단일 상품 알림                     ║');
  console.log('║ notifyProducts(products)   상품 목록 알림 (자동 분할)         ║');
  console.log('║ notifyHotDeals(products)   핫딜 알림 (필터된 상품)            ║');
  console.log('║ notifySummary(products)    검색 결과 요약                     ║');
  console.log('║ notify(title, body)        커스텀 알림                        ║');
  console.log('║ notifyError(msg, context)  에러 알림                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('CLI 사용법:');
  console.log('  npm run notify:test              연결 테스트');
  console.log('  npm run notify "무선 이어폰" 10  검색 + 알림 전송');
  console.log('');
}

runDemo().catch(console.error);
