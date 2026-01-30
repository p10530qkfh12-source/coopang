/**
 * 이미지 다운로더 데모
 * 샘플 이미지 URL로 다운로드 기능 테스트
 */

const ImageDownloader = require('./services/imageDownloader');

// 테스트용 샘플 상품 (실제 이미지 URL 사용)
const sampleProducts = [
  {
    productId: 'DEMO001',
    productName: '테스트 상품 1 - 귀여운 고양이 이미지',
    productImage: 'https://placekitten.com/400/300'
  },
  {
    productId: 'DEMO002',
    productName: '테스트 상품 2 - 강아지 사진',
    productImage: 'https://placedog.net/400/300'
  },
  {
    productId: 'DEMO003',
    productName: '테스트 상품 3 - 랜덤 이미지',
    productImage: 'https://picsum.photos/400/300'
  },
  {
    productId: 'DEMO004',
    productName: '테스트 상품 4 - 또 다른 랜덤',
    productImage: 'https://picsum.photos/seed/demo/400/300'
  },
  {
    productId: 'DEMO005',
    productName: '테스트 상품 5 - 이미지 없음',
    productImage: null // 이미지 URL 없는 경우 테스트
  }
];

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              이미지 다운로더 데모                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const downloader = new ImageDownloader();

  // ==========================================
  // 테스트 1: 파일명 생성 테스트
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 안전한 파일명 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testNames = [
    '삼성 갤럭시 버즈3 프로 [화이트]',
    'Apple 에어팟 프로 2세대 (USB-C)',
    '특수문자!@#$%테스트<>:"/\\|?*',
    '아주 긴 상품명 테스트 - 이 상품명은 매우 길어서 잘려야 합니다 이렇게 길게 작성해봅니다'
  ];

  testNames.forEach(name => {
    const safeName = downloader.sanitizeFilename(name, 'P123');
    console.log(`원본: ${name.slice(0, 40)}...`);
    console.log(`변환: ${safeName}\n`);
  });

  // ==========================================
  // 테스트 2: 단일 이미지 다운로드
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 단일 이미지 다운로드');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const singleResult = await downloader.downloadProductImage(
    sampleProducts[0],
    'demo_single'
  );

  console.log('\n결과:', singleResult.success ? '성공' : '실패');
  if (singleResult.filepath) {
    console.log('저장 위치:', singleResult.filepath);
  }

  // ==========================================
  // 테스트 3: 일괄 다운로드
  // ==========================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 일괄 이미지 다운로드');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const bulkResult = await downloader.downloadBulkImages(sampleProducts, {
    keyword: '데모_테스트'
  });

  // ==========================================
  // 테스트 4: 저장된 이미지 통계
  // ==========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 4: 저장된 이미지 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await downloader.printImageStats();

  // ==========================================
  // 요약
  // ==========================================
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        기능 요약                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ 1. 안전한 파일명    : 특수문자 제거, 길이 제한               ║');
  console.log('║ 2. 자동 재시도      : 실패 시 최대 2회 재시도                ║');
  console.log('║ 3. 중복 스킵        : 이미 존재하는 파일은 건너뜀            ║');
  console.log('║ 4. 폴더 자동 생성   : 키워드_날짜 형식의 폴더 생성           ║');
  console.log('║ 5. 다운로드 로그    : _download_log.json 자동 저장           ║');
  console.log('║ 6. 요청 간 딜레이   : 서버 부하 방지 (500ms)                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('사용법:');
  console.log('  npm run images "무선 이어폰" 10');
  console.log('  npm run images:stats');
  console.log('');
}

runDemo().catch(console.error);
