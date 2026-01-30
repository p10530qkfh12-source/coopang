/**
 * 안정적인 통신 로직 데모
 * 지수 백오프, 서킷 브레이커 등을 시뮬레이션합니다.
 */

const CoupangPartnersClient = require('./api/coupangClient');

// 테스트용 Mock 클라이언트
class MockCoupangClient extends CoupangPartnersClient {
  constructor(options = {}) {
    super('test_access_key', 'test_secret_key', {
      ...options,
      requestDelayMs: 100,      // 빠른 테스트를 위해 짧게
      baseRetryDelayMs: 500,
      maxRetryDelayMs: 2000,
      circuitBreakerThreshold: 3,
      circuitBreakerResetMs: 5000
    });

    this.mockScenario = options.scenario || 'success';
    this.callCount = 0;
  }

  // 실제 API 대신 시뮬레이션
  async request(method, path, params = {}, body = null) {
    // 서킷 브레이커 확인
    if (!this.checkCircuitBreaker()) {
      return {
        success: false,
        error: '서킷 브레이커가 열려 있습니다.',
        errorType: 'CIRCUIT_OPEN'
      };
    }

    this.state.requestCount++;
    this.callCount++;

    await this.respectRateLimit();

    // 시나리오별 동작
    switch (this.mockScenario) {
      case 'success':
        return this.simulateSuccess();

      case 'intermittent':
        // 3번 중 1번 실패
        if (this.callCount % 3 === 0) {
          return this.simulateRetryableError();
        }
        return this.simulateSuccess();

      case 'temporary_failure':
        // 처음 2번 실패 후 성공
        if (this.callCount <= 2) {
          return this.simulateRetryableError();
        }
        return this.simulateSuccess();

      case 'auth_failure':
        return this.simulateAuthError();

      case 'server_down':
        return this.simulateServerDown();

      default:
        return this.simulateSuccess();
    }
  }

  simulateSuccess() {
    this.onRequestSuccess();
    this.log('success', '(Mock) 요청 성공');
    return {
      success: true,
      data: {
        rCode: '0',
        data: [
          { productId: '12345', productName: '테스트 상품 1', productPrice: 10000 },
          { productId: '12346', productName: '테스트 상품 2', productPrice: 20000 }
        ]
      }
    };
  }

  simulateRetryableError() {
    this.onRequestFailure();
    this.log('error', '(Mock) 서버 오류 - 재시도 가능');
    return {
      success: false,
      error: '서버 내부 오류',
      errorType: 'SERVER_ERROR',
      statusCode: 500
    };
  }

  simulateAuthError() {
    this.onRequestFailure();
    this.log('error', '(Mock) 인증 실패 - 재시도 불가');
    return {
      success: false,
      error: '인증 실패',
      errorType: 'UNAUTHORIZED',
      statusCode: 401
    };
  }

  simulateServerDown() {
    this.onRequestFailure();
    this.log('error', '(Mock) 서버 다운');
    return {
      success: false,
      error: '서비스 일시 중단',
      errorType: 'SERVICE_UNAVAILABLE',
      statusCode: 503
    };
  }
}

async function runDemo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          안정적인 통신 로직 데모 (Resilience Demo)            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // 테스트 1: 정상 동작
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 정상 동작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const client1 = new MockCoupangClient({ scenario: 'success' });
  const result1 = await client1.searchProducts('테스트');
  console.log('결과:', result1.success ? '성공' : '실패');
  client1.printStats();

  // 테스트 2: 일시적 실패 후 성공 (지수 백오프)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 일시적 실패 후 성공 (지수 백오프 테스트)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const client2 = new MockCoupangClient({ scenario: 'temporary_failure' });

  console.log('\n[시나리오] 처음 2번 실패 후 3번째에 성공\n');

  for (let i = 1; i <= 4; i++) {
    console.log(`\n--- 요청 #${i} ---`);
    const result = await client2.searchProducts('테스트');
    console.log(`요청 #${i} 결과:`, result.success ? '성공' : '실패');
  }

  client2.printStats();

  // 테스트 3: 서킷 브레이커 동작
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: 서킷 브레이커 동작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const client3 = new MockCoupangClient({ scenario: 'server_down' });

  console.log('\n[시나리오] 연속 실패로 서킷 브레이커 작동 (임계값: 3회)\n');

  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- 요청 #${i} ---`);
    const result = await client3.searchProducts('테스트');
    console.log(`요청 #${i} 결과:`, result.success ? '성공' : `실패 (${result.errorType})`);

    if (result.errorType === 'CIRCUIT_OPEN') {
      console.log('\n[!] 서킷 브레이커 OPEN - 추가 요청 차단됨');
      break;
    }
  }

  client3.printStats();

  // 테스트 4: 인증 실패 (재시도 안함)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 4: 인증 실패 (재시도 불가 에러)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const client4 = new MockCoupangClient({ scenario: 'auth_failure' });

  console.log('\n[시나리오] 인증 실패는 재시도 없이 즉시 반환\n');

  const result4 = await client4.searchProducts('테스트');
  console.log('결과:', result4.success ? '성공' : `실패 (${result4.errorType})`);
  console.log('설명: 401 에러는 재시도해도 해결되지 않으므로 즉시 실패 반환');

  client4.printStats();

  // 요약
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        데모 요약                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ 1. Rate Limiting    : 요청 간 최소 지연 시간 적용             ║');
  console.log('║ 2. Exponential      : 실패 시 1초 → 2초 → 4초... 증가        ║');
  console.log('║    Backoff                                                   ║');
  console.log('║ 3. Circuit Breaker  : 연속 N회 실패 시 요청 차단             ║');
  console.log('║ 4. Error Category   : 재시도 가능/불가능 에러 자동 분류       ║');
  console.log('║ 5. Auto Retry       : 일시적 오류는 자동 재시도              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
}

runDemo().catch(console.error);
