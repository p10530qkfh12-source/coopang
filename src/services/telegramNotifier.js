/**
 * 텔레그램 알림 서비스
 *
 * 수집된 상품 정보를 텔레그램으로 전송
 * 폰으로 바로 확인 가능
 */

const axios = require('axios');

class TelegramNotifier {
  constructor(options = {}) {
    this.botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

    // 메시지 설정
    this.maxMessageLength = 4096; // 텔레그램 메시지 최대 길이
    this.delayBetweenMessages = 500; // 메시지 간 딜레이 (ms)
  }

  /**
   * 설정 확인
   */
  isConfigured() {
    return !!(this.botToken && this.chatId);
  }

  /**
   * 설정 오류 메시지 출력
   */
  printConfigError() {
    console.error('\n========================================');
    console.error('  텔레그램 설정이 필요합니다!');
    console.error('========================================\n');
    console.error('1. 텔레그램에서 @BotFather 로 봇 생성');
    console.error('   → /newbot 명령어로 봇 생성');
    console.error('   → 발급받은 토큰 복사\n');
    console.error('2. 봇과 대화 시작 후 Chat ID 확인');
    console.error('   → 봇에게 아무 메시지 전송');
    console.error('   → https://api.telegram.org/bot<토큰>/getUpdates 접속');
    console.error('   → "chat":{"id": 숫자} 에서 숫자가 Chat ID\n');
    console.error('3. .env 파일에 추가:');
    console.error('   TELEGRAM_BOT_TOKEN=your_bot_token');
    console.error('   TELEGRAM_CHAT_ID=your_chat_id\n');
  }

  /**
   * 기본 메시지 전송
   */
  async sendMessage(text, options = {}) {
    if (!this.isConfigured()) {
      this.printConfigError();
      return { success: false, error: '텔레그램 설정 필요' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: text.slice(0, this.maxMessageLength),
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: options.disablePreview ?? true
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.description || error.message;
      console.error(`[텔레그램] 전송 실패: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * 마크다운 메시지 전송
   */
  async sendMarkdown(text, options = {}) {
    return this.sendMessage(text, { ...options, parseMode: 'Markdown' });
  }

  // ============================================
  // 상품 알림 포맷
  // ============================================

  /**
   * 단일 상품 메시지 포맷
   */
  formatProduct(product, index = null) {
    const prefix = index !== null ? `${index}. ` : '';
    const rocket = product.isRocket ? '🚀' : '';
    const rating = product.rating ? `⭐${product.rating}` : '';
    const discount = product.discountRate ? `(${product.discountRate}% 할인)` : '';
    const reasons = product.filterReasons ? `\n   → ${product.filterReasons.join(', ')}` : '';

    return `${prefix}<b>${this.escapeHtml(product.productName.slice(0, 50))}</b>
💰 ${product.productPrice.toLocaleString()}원 ${discount}
${rating} ${rocket}
🔗 <a href="${product.productUrl}">상품 보기</a>${reasons}`;
  }

  /**
   * HTML 특수문자 이스케이프
   */
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * 상품 목록 메시지 생성
   */
  formatProductList(products, title = '상품 알림') {
    const header = `📦 <b>${this.escapeHtml(title)}</b>\n` +
                   `━━━━━━━━━━━━━━━\n` +
                   `총 ${products.length}개 상품\n\n`;

    const items = products.map((p, i) => this.formatProduct(p, i + 1)).join('\n\n');

    const footer = `\n━━━━━━━━━━━━━━━\n` +
                   `🕐 ${new Date().toLocaleString('ko-KR')}`;

    return header + items + footer;
  }

  // ============================================
  // 상품 알림 전송
  // ============================================

  /**
   * 단일 상품 알림
   */
  async notifyProduct(product) {
    const message = `📦 <b>새 상품 알림</b>\n\n${this.formatProduct(product)}`;
    return this.sendMessage(message);
  }

  /**
   * 상품 목록 알림 (자동 분할)
   */
  async notifyProducts(products, options = {}) {
    if (!this.isConfigured()) {
      this.printConfigError();
      return { success: false, error: '텔레그램 설정 필요' };
    }

    if (products.length === 0) {
      return { success: true, sent: 0 };
    }

    const title = options.title || '상품 알림';
    const maxPerMessage = options.maxPerMessage || 5; // 메시지당 최대 상품 수

    console.log(`\n[텔레그램] ${products.length}개 상품 전송 중...`);

    const results = [];
    const chunks = this.chunkArray(products, maxPerMessage);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkTitle = chunks.length > 1
        ? `${title} (${i + 1}/${chunks.length})`
        : title;

      const message = this.formatProductList(chunk, chunkTitle);
      const result = await this.sendMessage(message);
      results.push(result);

      if (result.success) {
        console.log(`  [${i + 1}/${chunks.length}] 전송 완료`);
      } else {
        console.log(`  [${i + 1}/${chunks.length}] 전송 실패: ${result.error}`);
      }

      // 메시지 간 딜레이
      if (i < chunks.length - 1) {
        await this.sleep(this.delayBetweenMessages);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[텔레그램] 완료: ${successCount}/${chunks.length} 메시지 전송됨\n`);

    return {
      success: successCount === chunks.length,
      sent: successCount,
      total: chunks.length,
      results
    };
  }

  /**
   * 핫딜 알림 (필터링된 상품)
   */
  async notifyHotDeals(products, keyword = '') {
    const title = keyword ? `🔥 핫딜: ${keyword}` : '🔥 핫딜 알림';
    return this.notifyProducts(products, { title, maxPerMessage: 3 });
  }

  /**
   * 검색 결과 요약 알림
   */
  async notifySummary(products, keyword) {
    const avgPrice = products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + p.productPrice, 0) / products.length)
      : 0;

    const rocketCount = products.filter(p => p.isRocket).length;
    const highRated = products.filter(p => p.rating >= 4.5).length;

    const message = `📊 <b>검색 결과 요약</b>
━━━━━━━━━━━━━━━
🔍 키워드: <b>${this.escapeHtml(keyword)}</b>

📦 총 상품: ${products.length}개
💰 평균 가격: ${avgPrice.toLocaleString()}원
🚀 로켓배송: ${rocketCount}개
⭐ 고평점(4.5↑): ${highRated}개

🕐 ${new Date().toLocaleString('ko-KR')}`;

    return this.sendMessage(message);
  }

  /**
   * 에러 알림
   */
  async notifyError(errorMessage, context = '') {
    const message = `⚠️ <b>오류 발생</b>
━━━━━━━━━━━━━━━
${context ? `📍 위치: ${this.escapeHtml(context)}\n` : ''}
❌ ${this.escapeHtml(errorMessage)}

🕐 ${new Date().toLocaleString('ko-KR')}`;

    return this.sendMessage(message);
  }

  /**
   * 커스텀 알림
   */
  async notify(title, body) {
    const message = `📢 <b>${this.escapeHtml(title)}</b>
━━━━━━━━━━━━━━━
${this.escapeHtml(body)}

🕐 ${new Date().toLocaleString('ko-KR')}`;

    return this.sendMessage(message);
  }

  // ============================================
  // 유틸리티
  // ============================================

  /**
   * 배열을 청크로 분할
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 슬립
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 봇 정보 확인 (테스트용)
   */
  async getMe() {
    if (!this.botToken) {
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      return { success: true, data: response.data.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 연결 테스트
   */
  async testConnection() {
    console.log('\n[텔레그램] 연결 테스트 중...');

    // 봇 정보 확인
    const botInfo = await this.getMe();
    if (!botInfo.success) {
      console.log(`[텔레그램] 봇 연결 실패: ${botInfo.error}`);
      return false;
    }

    console.log(`[텔레그램] 봇 연결 성공: @${botInfo.data.username}`);

    // 테스트 메시지 전송
    const testResult = await this.sendMessage('🔔 텔레그램 알림 테스트 성공!');
    if (testResult.success) {
      console.log('[텔레그램] 메시지 전송 테스트 성공\n');
      return true;
    } else {
      console.log(`[텔레그램] 메시지 전송 실패: ${testResult.error}\n`);
      return false;
    }
  }
}

module.exports = TelegramNotifier;
