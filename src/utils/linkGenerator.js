/**
 * 링크 생성 유틸리티
 *
 * - URL 인코딩 처리
 * - HTTPS 프로토콜 강제
 * - 안전한 HTML 링크 생성
 * - 에러 처리 및 폴백
 */

class LinkGenerator {
  constructor() {
    // 쿠팡 도메인 패턴
    this.coupangDomains = [
      'coupang.com',
      'www.coupang.com',
      'link.coupang.com',
      'm.coupang.com'
    ];
  }

  /**
   * URL 유효성 검사
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }

  /**
   * HTTPS 프로토콜 강제 적용
   */
  enforceHttps(url) {
    if (!url || typeof url !== 'string') return url;

    // http:// → https://
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }

    // 프로토콜 없으면 https:// 추가
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return 'https://' + url;
    }

    return url;
  }

  /**
   * URL 안전하게 인코딩
   */
  encodeUrl(url) {
    if (!url || typeof url !== 'string') return '';

    try {
      // URL 객체로 파싱하여 각 부분을 안전하게 처리
      const parsed = new URL(url);

      // 쿼리 파라미터 인코딩
      const params = new URLSearchParams(parsed.search);
      const encodedParams = new URLSearchParams();

      for (const [key, value] of params) {
        encodedParams.append(key, value);
      }

      // 재조합
      let result = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
      if (encodedParams.toString()) {
        result += '?' + encodedParams.toString();
      }
      if (parsed.hash) {
        result += parsed.hash;
      }

      return result;
    } catch (e) {
      // URL 파싱 실패시 기본 인코딩
      return encodeURI(url);
    }
  }

  /**
   * 쿠팡 링크인지 확인
   */
  isCoupangLink(url) {
    if (!url) return false;

    try {
      const parsed = new URL(url);
      return this.coupangDomains.some(domain =>
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * 안전한 상품 URL 생성
   */
  getSafeProductUrl(product) {
    try {
      let url = product.productUrl || product.url || '';

      // 빈 URL 처리
      if (!url) {
        console.warn(`[링크] 상품 URL 없음: ${product.productName || product.productId}`);
        return '#';
      }

      // HTTPS 강제
      url = this.enforceHttps(url);

      // URL 유효성 검사
      if (!this.isValidUrl(url)) {
        console.warn(`[링크] 유효하지 않은 URL: ${url}`);
        return '#';
      }

      // URL 인코딩
      url = this.encodeUrl(url);

      return url;
    } catch (error) {
      console.error(`[링크] URL 처리 오류: ${error.message}`);
      return '#';
    }
  }

  /**
   * HTML 앵커 태그 생성 (순수 HTML)
   */
  generateHtmlLink(url, text, options = {}) {
    const {
      target = '_blank',
      rel = 'noopener noreferrer sponsored',
      className = '',
      style = '',
      title = ''
    } = options;

    // URL 안전 처리
    const safeUrl = this.enforceHttps(url);

    if (!this.isValidUrl(safeUrl)) {
      console.warn(`[링크] 유효하지 않은 링크 URL: ${url}`);
      return `<span>${this.escapeHtml(text)}</span>`;
    }

    // URL 인코딩
    const encodedUrl = this.encodeUrl(safeUrl);

    // HTML 특수문자 이스케이프
    const safeText = this.escapeHtml(text);
    const safeTitle = this.escapeHtml(title);

    // 속성 조합
    const attrs = [
      `href="${encodedUrl}"`,
      target ? `target="${target}"` : '',
      rel ? `rel="${rel}"` : '',
      className ? `class="${className}"` : '',
      style ? `style="${style}"` : '',
      safeTitle ? `title="${safeTitle}"` : ''
    ].filter(Boolean).join(' ');

    return `<a ${attrs}>${safeText}</a>`;
  }

  /**
   * 상품 링크 버튼 HTML 생성
   */
  generateProductButton(product, buttonText = '✨ 최저가 보러가기', buttonStyle = null) {
    const url = this.getSafeProductUrl(product);

    const defaultStyle = `
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      font-size: 1.1em;
      box-shadow: 0 4px 15px rgba(102,126,234,0.4);
    `.replace(/\s+/g, ' ').trim();

    return this.generateHtmlLink(url, buttonText, {
      target: '_blank',
      rel: 'noopener noreferrer sponsored',
      style: buttonStyle || defaultStyle
    });
  }

  /**
   * 간단한 텍스트 링크 생성
   */
  generateTextLink(product, linkText = null) {
    const url = this.getSafeProductUrl(product);
    const text = linkText || product.productName || '상품 보기';

    return this.generateHtmlLink(url, text, {
      target: '_blank',
      rel: 'noopener noreferrer sponsored',
      style: 'color: #3498db; text-decoration: underline;'
    });
  }

  /**
   * HTML 특수문자 이스케이프
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';

    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => htmlEntities[char]);
  }

  /**
   * URL에서 상품 ID 추출 (쿠팡)
   */
  extractProductId(url) {
    if (!url) return null;

    try {
      // /vp/products/123456 패턴
      const vpMatch = url.match(/\/vp\/products\/(\d+)/);
      if (vpMatch) return vpMatch[1];

      // /products/123456 패턴
      const productsMatch = url.match(/\/products\/(\d+)/);
      if (productsMatch) return productsMatch[1];

      // ?itemId=123456 패턴
      const parsed = new URL(url);
      const itemId = parsed.searchParams.get('itemId');
      if (itemId) return itemId;

      // vendorItemId 패턴
      const vendorItemId = parsed.searchParams.get('vendorItemId');
      if (vendorItemId) return vendorItemId;

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 배치 링크 처리 (여러 상품)
   */
  processProductLinks(products) {
    return products.map(product => ({
      ...product,
      productUrl: this.getSafeProductUrl(product)
    }));
  }
}

module.exports = new LinkGenerator();
