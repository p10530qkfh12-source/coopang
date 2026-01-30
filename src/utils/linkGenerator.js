/**
 * 링크 생성 유틸리티 v2.0
 *
 * - go.php 리다이렉트 방식
 * - 절대 경로 사용 (도메인 포함)
 * - 이중 인코딩 방지
 * - HTML 태그 고도화
 */

class LinkGenerator {
  constructor() {
    // 워드프레스 사이트 URL (환경변수에서 로드)
    this.siteUrl = process.env.WP_SITE_URL || 'https://realize.iwinv.net';

    // go.php 리다이렉터 경로
    this.redirectorPath = '/go.php';

    // 쿠팡 도메인 패턴
    this.coupangDomains = [
      'coupang.com',
      'www.coupang.com',
      'link.coupang.com',
      'm.coupang.com',
      'coupa.ng'
    ];
  }

  /**
   * go.php 리다이렉트 URL 생성
   * 절대 경로 사용 + encodeURIComponent 한 번만 적용
   */
  generateRedirectUrl(targetUrl) {
    if (!targetUrl || typeof targetUrl !== 'string') {
      console.warn('[링크] 빈 URL 전달됨');
      return null;
    }

    // 이미 go.php로 래핑된 URL이면 그대로 반환 (이중 래핑 방지)
    if (targetUrl.includes('/go.php?url=')) {
      console.log(`[링크] 이미 go.php URL: ${targetUrl.substring(0, 80)}...`);
      return targetUrl;
    }

    // HTTPS 강제
    let safeUrl = this.enforceHttps(targetUrl.trim());

    // URL 유효성 검사
    if (!this.isValidUrl(safeUrl)) {
      console.warn(`[링크] 유효하지 않은 URL: ${targetUrl}`);
      return null;
    }

    // 이중 인코딩 방지: 이미 인코딩된 URL인지 확인
    // %로 시작하는 인코딩이 있으면 디코딩 후 재인코딩
    try {
      const decoded = decodeURIComponent(safeUrl);
      // 디코딩 성공하면 이미 인코딩된 상태였음
      safeUrl = decoded;
    } catch (e) {
      // 디코딩 실패 = 인코딩 안 된 상태 (정상)
    }

    // encodeURIComponent 딱 한 번만 적용
    const encodedUrl = encodeURIComponent(safeUrl);

    // 절대 경로로 go.php URL 생성
    const redirectUrl = `${this.siteUrl}${this.redirectorPath}?url=${encodedUrl}`;

    console.log(`[링크] 리다이렉트 URL 생성: ${redirectUrl.substring(0, 100)}...`);

    return redirectUrl;
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
   * 안전한 상품 URL 생성 (go.php 리다이렉트 사용)
   */
  getSafeProductUrl(product) {
    try {
      // shortenUrl 우선, 없으면 productUrl 사용
      let originalUrl = product.shortenUrl || product.productUrl || product.url || '';

      if (!originalUrl) {
        console.warn(`[링크] 상품 URL 없음: ${product.productName || product.productId}`);
        return null;
      }

      // go.php 리다이렉트 URL 생성
      const redirectUrl = this.generateRedirectUrl(originalUrl);

      if (!redirectUrl) {
        console.warn(`[링크] 리다이렉트 URL 생성 실패: ${originalUrl}`);
        return null;
      }

      return redirectUrl;
    } catch (error) {
      console.error(`[링크] URL 처리 오류: ${error.message}`);
      return null;
    }
  }

  /**
   * HTML 앵커 태그 생성 (고도화)
   * - target="_blank"
   * - rel="nofollow noopener"
   * - href 빈값 검증
   */
  generateHtmlLink(url, text, options = {}) {
    const {
      target = '_blank',
      rel = 'nofollow noopener',
      className = '',
      style = '',
      title = ''
    } = options;

    // href 빈값 최종 검증
    if (!url || url === '#' || url.trim() === '') {
      console.warn(`[링크] href가 비어있음 - 링크 생성 취소`);
      return `<span class="link-error" style="${style}">${this.escapeHtml(text)}</span>`;
    }

    // HTML 특수문자 이스케이프
    const safeText = this.escapeHtml(text);
    const safeTitle = this.escapeHtml(title);

    // URL은 이미 인코딩되어 있으므로 그대로 사용
    // 단, HTML 속성 내 특수문자만 이스케이프
    const safeUrl = url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // 속성 조합
    const attrs = [
      `href="${safeUrl}"`,
      `target="${target}"`,
      `rel="${rel}"`,
      className ? `class="${className}"` : '',
      style ? `style="${style}"` : '',
      safeTitle ? `title="${safeTitle}"` : ''
    ].filter(Boolean).join(' ');

    return `<a ${attrs}>${safeText}</a>`;
  }

  /**
   * 상품 링크 버튼 HTML 생성
   */
  generateProductButton(product, buttonText = '최저가 보러가기', buttonStyle = null) {
    const url = this.getSafeProductUrl(product);

    // URL 생성 실패시 대체 텍스트
    if (!url) {
      console.warn(`[링크] 버튼 생성 실패 - URL 없음: ${product.productName}`);
      return `<span style="color: #999; padding: 14px 32px;">링크 준비중</span>`;
    }

    const defaultStyle = `
      display: inline-block;
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: #fff;
      padding: 16px 36px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1.1em;
      box-shadow: 0 4px 15px rgba(231,76,60,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    `.replace(/\s+/g, ' ').trim();

    return this.generateHtmlLink(url, buttonText, {
      target: '_blank',
      rel: 'nofollow noopener',
      style: buttonStyle || defaultStyle,
      title: `${product.productName || '상품'} 최저가 확인`
    });
  }

  /**
   * 간단한 텍스트 링크 생성
   */
  generateTextLink(product, linkText = null) {
    const url = this.getSafeProductUrl(product);
    const text = linkText || product.productName || '상품 보기';

    if (!url) {
      return `<span style="color: #999;">${this.escapeHtml(text)}</span>`;
    }

    return this.generateHtmlLink(url, text, {
      target: '_blank',
      rel: 'nofollow noopener',
      style: 'color: #e74c3c; text-decoration: underline; font-weight: bold;',
      title: `${text} 보러가기`
    });
  }

  /**
   * 이미지 + 링크 조합 생성
   */
  generateImageLink(product, imgStyle = '') {
    const url = this.getSafeProductUrl(product);
    const imgUrl = product.productImage || product.imageUrl || '';
    const name = product.productName || '상품';

    if (!url || !imgUrl) {
      return '';
    }

    const defaultImgStyle = 'max-width: 100%; height: auto; border-radius: 8px;';

    return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="nofollow noopener" title="${this.escapeHtml(name)}">
      <img src="${this.escapeHtml(imgUrl)}" alt="${this.escapeHtml(name)}" style="${imgStyle || defaultImgStyle}" loading="lazy">
    </a>`;
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
      redirectUrl: this.getSafeProductUrl(product)
    }));
  }

  /**
   * 링크 검증 (디버깅용)
   */
  validateLink(product) {
    const originalUrl = product.shortenUrl || product.productUrl || product.url;
    const redirectUrl = this.getSafeProductUrl(product);

    return {
      productName: product.productName,
      originalUrl: originalUrl,
      redirectUrl: redirectUrl,
      isValid: !!redirectUrl && redirectUrl !== '#',
      isCoupang: this.isCoupangLink(originalUrl)
    };
  }

  /**
   * 디버그 로그 출력
   */
  debugProduct(product) {
    const validation = this.validateLink(product);
    console.log('\n========== 링크 검증 ==========');
    console.log(`상품명: ${validation.productName}`);
    console.log(`원본 URL: ${validation.originalUrl}`);
    console.log(`리다이렉트 URL: ${validation.redirectUrl}`);
    console.log(`유효: ${validation.isValid ? 'O' : 'X'}`);
    console.log(`쿠팡링크: ${validation.isCoupang ? 'O' : 'X'}`);
    console.log('================================\n');
    return validation;
  }
}

module.exports = new LinkGenerator();
