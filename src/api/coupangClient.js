/**
 * 쿠팡 파트너스 API 클라이언트 (강화 버전)
 *
 * 주요 기능:
 * - HMAC-SHA256 서명 인증
 * - 지수 백오프 (Exponential Backoff)
 * - 자동 재시도 (Configurable Retry)
 * - 서킷 브레이커 패턴
 * - 요청 큐 관리
 * - 상세 로깅
 */

const crypto = require('crypto');
const axios = require('axios');

/**
 * 서킷 브레이커 상태
 */
const CircuitState = {
  CLOSED: 'CLOSED',     // 정상 작동
  OPEN: 'OPEN',         // 차단 (요청 거부)
  HALF_OPEN: 'HALF_OPEN' // 테스트 중
};

class CoupangPartnersClient {
  constructor(accessKey, secretKey, options = {}) {
    if (!accessKey || !secretKey) {
      throw new Error('Access Key와 Secret Key가 필요합니다.');
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://api-gateway.coupang.com';

    // 설정 옵션 (환경변수 또는 기본값)
    this.config = {
      // Rate Limiting
      requestDelayMs: options.requestDelayMs || parseInt(process.env.REQUEST_DELAY_MS) || 1000,

      // 재시도 설정
      maxRetries: options.maxRetries || 3,
      baseRetryDelayMs: options.baseRetryDelayMs || 1000,
      maxRetryDelayMs: options.maxRetryDelayMs || 30000,

      // 타임아웃
      timeoutMs: options.timeoutMs || 10000,

      // 서킷 브레이커
      circuitBreakerThreshold: options.circuitBreakerThreshold || 5,  // 연속 실패 횟수
      circuitBreakerResetMs: options.circuitBreakerResetMs || 60000,  // 리셋 대기 시간

      // 로깅
      verbose: options.verbose !== undefined ? options.verbose : true
    };

    // 상태 관리
    this.state = {
      lastRequestTime: 0,
      requestCount: 0,
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      circuitState: CircuitState.CLOSED,
      circuitOpenedAt: null,
      requestQueue: []
    };

    this.log('info', '클라이언트 초기화 완료', {
      requestDelay: this.config.requestDelayMs,
      maxRetries: this.config.maxRetries,
      timeout: this.config.timeoutMs
    });
  }

  // ============================================
  // 로깅
  // ============================================

  log(level, message, data = null) {
    if (!this.config.verbose && level === 'debug') return;

    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = {
      'info': '📘',
      'success': '✅',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍',
      'retry': '🔄'
    }[level] || '📌';

    const logMessage = `[${timestamp}] ${prefix} ${message}`;

    if (data) {
      console.log(logMessage, JSON.stringify(data, null, 2));
    } else {
      console.log(logMessage);
    }
  }

  // ============================================
  // 서킷 브레이커
  // ============================================

  checkCircuitBreaker() {
    if (this.state.circuitState === CircuitState.CLOSED) {
      return true; // 요청 허용
    }

    if (this.state.circuitState === CircuitState.OPEN) {
      const elapsed = Date.now() - this.state.circuitOpenedAt;

      if (elapsed >= this.config.circuitBreakerResetMs) {
        this.state.circuitState = CircuitState.HALF_OPEN;
        this.log('info', '서킷 브레이커: HALF_OPEN 상태로 전환 (테스트 요청 허용)');
        return true;
      }

      const remainingMs = this.config.circuitBreakerResetMs - elapsed;
      this.log('warn', `서킷 브레이커 OPEN 상태 - ${Math.ceil(remainingMs / 1000)}초 후 재시도 가능`);
      return false;
    }

    // HALF_OPEN 상태에서는 한 번의 요청만 허용
    return true;
  }

  onRequestSuccess() {
    this.state.successCount++;
    this.state.consecutiveFailures = 0;

    if (this.state.circuitState === CircuitState.HALF_OPEN) {
      this.state.circuitState = CircuitState.CLOSED;
      this.log('success', '서킷 브레이커: CLOSED 상태로 복구');
    }
  }

  onRequestFailure() {
    this.state.failureCount++;
    this.state.consecutiveFailures++;

    if (this.state.consecutiveFailures >= this.config.circuitBreakerThreshold) {
      this.state.circuitState = CircuitState.OPEN;
      this.state.circuitOpenedAt = Date.now();
      this.log('error', `서킷 브레이커: OPEN 상태로 전환 (연속 ${this.state.consecutiveFailures}회 실패)`);
    }
  }

  // ============================================
  // Rate Limiting & 지수 백오프
  // ============================================

  async respectRateLimit() {
    const now = Date.now();
    const elapsed = now - this.state.lastRequestTime;

    if (elapsed < this.config.requestDelayMs) {
      const delay = this.config.requestDelayMs - elapsed;
      this.log('debug', `Rate Limit 대기: ${delay}ms`);
      await this.sleep(delay);
    }

    this.state.lastRequestTime = Date.now();
  }

  calculateBackoffDelay(attempt) {
    // 지수 백오프: baseDelay * 2^attempt + 랜덤 지터
    const exponentialDelay = this.config.baseRetryDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 0~1초 랜덤 지터
    const delay = Math.min(exponentialDelay + jitter, this.config.maxRetryDelayMs);

    return Math.round(delay);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // 에러 분류
  // ============================================

  isRetryableError(error) {
    // 네트워크 에러
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    // HTTP 상태 코드 기반
    const statusCode = error.response?.status;
    if (!statusCode) return true; // 응답 없으면 재시도

    // 재시도 가능한 상태 코드
    const retryableCodes = [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504  // Gateway Timeout
    ];

    return retryableCodes.includes(statusCode);
  }

  categorizeError(error) {
    const statusCode = error.response?.status;

    if (!statusCode) {
      return { type: 'NETWORK', message: '네트워크 연결 실패', retryable: true };
    }

    const errorMap = {
      400: { type: 'BAD_REQUEST', message: '잘못된 요청', retryable: false },
      401: { type: 'UNAUTHORIZED', message: '인증 실패 - API 키 확인 필요', retryable: false },
      403: { type: 'FORBIDDEN', message: '접근 권한 없음', retryable: false },
      404: { type: 'NOT_FOUND', message: '리소스를 찾을 수 없음', retryable: false },
      429: { type: 'RATE_LIMITED', message: 'API 호출 한도 초과', retryable: true },
      500: { type: 'SERVER_ERROR', message: '서버 내부 오류', retryable: true },
      502: { type: 'BAD_GATEWAY', message: '게이트웨이 오류', retryable: true },
      503: { type: 'SERVICE_UNAVAILABLE', message: '서비스 일시 중단', retryable: true },
      504: { type: 'GATEWAY_TIMEOUT', message: '게이트웨이 타임아웃', retryable: true }
    };

    return errorMap[statusCode] || { type: 'UNKNOWN', message: `알 수 없는 오류 (${statusCode})`, retryable: false };
  }

  // ============================================
  // 인증
  // ============================================

  generateTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear().toString().slice(-2);
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  generateSignature(method, path, timestamp) {
    const message = `${timestamp}${method}${path}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  generateAuthHeader(method, path) {
    const timestamp = this.generateTimestamp();
    const signature = this.generateSignature(method, path, timestamp);
    return `CEA algorithm=HmacSHA256, access-key=${this.accessKey}, signed-date=${timestamp}, signature=${signature}`;
  }

  // ============================================
  // 핵심 요청 로직 (재시도 포함)
  // ============================================

  async request(method, path, params = {}, body = null) {
    // 서킷 브레이커 확인
    if (!this.checkCircuitBreaker()) {
      return {
        success: false,
        error: '서킷 브레이커가 열려 있습니다. 잠시 후 다시 시도해주세요.',
        errorType: 'CIRCUIT_OPEN'
      };
    }

    this.state.requestCount++;
    let lastError = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Rate Limit 준수
        await this.respectRateLimit();

        // 쿼리 파라미터 처리
        let fullPath = path;
        if (Object.keys(params).length > 0) {
          const queryString = new URLSearchParams(params).toString();
          fullPath = `${path}?${queryString}`;
        }

        // 인증 헤더 생성 (매 시도마다 새로 생성 - 타임스탬프 갱신)
        const authorization = this.generateAuthHeader(method, fullPath);

        // 요청 옵션
        const requestConfig = {
          method,
          url: `${this.baseUrl}${fullPath}`,
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json;charset=UTF-8'
          },
          timeout: this.config.timeoutMs
        };

        if (body) {
          requestConfig.data = body;
        }

        // 시도 로깅
        if (attempt > 0) {
          this.log('retry', `재시도 ${attempt}/${this.config.maxRetries}`, { path: fullPath });
        } else {
          this.log('debug', `요청: ${method} ${fullPath}`);
        }

        // 요청 실행
        const response = await axios(requestConfig);

        // 성공
        this.onRequestSuccess();
        this.log('success', `응답 성공 (${response.status})`);

        return {
          success: true,
          data: response.data,
          statusCode: response.status,
          attempt: attempt + 1
        };

      } catch (error) {
        lastError = error;
        const errorInfo = this.categorizeError(error);

        this.log('error', `요청 실패: ${errorInfo.message}`, {
          statusCode: error.response?.status,
          attempt: attempt + 1
        });

        // 재시도 불가능한 에러면 즉시 반환
        if (!errorInfo.retryable) {
          this.onRequestFailure();
          return {
            success: false,
            error: errorInfo.message,
            errorType: errorInfo.type,
            statusCode: error.response?.status,
            details: error.response?.data
          };
        }

        // 마지막 시도가 아니면 백오프 후 재시도
        if (attempt < this.config.maxRetries) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          this.log('retry', `${backoffDelay}ms 후 재시도...`);
          await this.sleep(backoffDelay);
        }
      }
    }

    // 모든 재시도 실패
    this.onRequestFailure();
    const errorInfo = this.categorizeError(lastError);

    return {
      success: false,
      error: `${this.config.maxRetries + 1}회 시도 후 실패: ${errorInfo.message}`,
      errorType: errorInfo.type,
      statusCode: lastError.response?.status,
      details: lastError.response?.data
    };
  }

  // ============================================
  // API 메서드
  // ============================================

  async searchProducts(keyword, limit = 20) {
    this.log('info', `상품 검색: "${keyword}" (최대 ${limit}개)`);

    const path = '/v2/providers/affiliate_open_api/apis/openapi/products/search';
    const params = {
      keyword: keyword,
      limit: Math.min(limit, 100)
    };

    return this.request('GET', path, params);
  }

  async getBestProducts(categoryId, limit = 20) {
    this.log('info', `베스트 상품 조회: 카테고리 ${categoryId}`);

    const path = '/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories';
    const params = {
      categoryId: categoryId,
      limit: Math.min(limit, 100)
    };

    return this.request('GET', path, params);
  }

  async getGoldboxProducts(limit = 20) {
    this.log('info', '골드박스 상품 조회');

    const path = '/v2/providers/affiliate_open_api/apis/openapi/products/goldbox';
    const params = {
      limit: Math.min(limit, 100)
    };

    return this.request('GET', path, params);
  }

  async createDeeplinks(originalUrls) {
    this.log('info', `딥링크 생성: ${originalUrls.length}개 URL`);

    const path = '/v2/providers/affiliate_open_api/apis/openapi/deeplink';
    const body = { coupangUrls: originalUrls };

    return this.request('POST', path, {}, body);
  }

  // ============================================
  // 상태 조회
  // ============================================

  getStats() {
    return {
      totalRequests: this.state.requestCount,
      successCount: this.state.successCount,
      failureCount: this.state.failureCount,
      successRate: this.state.requestCount > 0
        ? ((this.state.successCount / this.state.requestCount) * 100).toFixed(1) + '%'
        : 'N/A',
      circuitState: this.state.circuitState,
      consecutiveFailures: this.state.consecutiveFailures
    };
  }

  printStats() {
    const stats = this.getStats();
    console.log('\n========== API 클라이언트 통계 ==========');
    console.log(`총 요청: ${stats.totalRequests}회`);
    console.log(`성공: ${stats.successCount}회`);
    console.log(`실패: ${stats.failureCount}회`);
    console.log(`성공률: ${stats.successRate}`);
    console.log(`서킷 상태: ${stats.circuitState}`);
    console.log(`연속 실패: ${stats.consecutiveFailures}회`);
    console.log('==========================================\n');
  }

  resetStats() {
    this.state.requestCount = 0;
    this.state.successCount = 0;
    this.state.failureCount = 0;
    this.state.consecutiveFailures = 0;
    this.state.circuitState = CircuitState.CLOSED;
    this.state.circuitOpenedAt = null;
    this.log('info', '통계 초기화 완료');
  }
}

module.exports = CoupangPartnersClient;
