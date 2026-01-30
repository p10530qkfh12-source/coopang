/**
 * 링크 생성 유틸리티 v3.1
 *
 * 모드 설정:
 * - USE_REDIRECT=true: go.php 리다이렉트 사용
 * - USE_REDIRECT=false: 쿠팡 링크 직접 사용 (기본값)
 */

class LinkGenerator {
  constructor() {
    // 워드프레스 사이트 URL
    this.siteUrl = process.env.WP_SITE_URL || 'https://realize.iwinv.net';

    // 리다이렉트 모드 (go.php 사용 여부)
    // go.php가 서버에 없으면 false로 설정
    this.useRedirect = process.env.USE_REDIRECT === 'true';

    // 쿠팡 도메인 (검증용)
    this.coupangDomains = ['coupang.com', 'link.coupang.com', 'coupa.ng'];
  }

  /**
   * 최종 상품 링크 URL 생성
   *
   * useRedirect=true: go.php?url=인코딩된URL
   * useRedirect=false: 쿠팡 링크 직접 사용 (기본)
   */
  generateRedirectUrl(targetUrl) {
    if (!targetUrl || typeof targetUrl !== 'string') {
      return null;
    }

    const url = targetUrl.trim();
    if (!url) return null;

    // go.php 리다이렉트 모드
    if (this.useRedirect) {
      // 이미 go.php URL이면 그대로 반환
      if (url.includes('/go.php?url=')) {
        return url;
      }

      const encoded = encodeURIComponent(url);
      const redirectUrl = `${this.siteUrl}/go.php?url=${encoded}`;
      console.log(`[링크] go.php: ${url.substring(0, 40)}...`);
      return redirectUrl;
    }

    // 직접 링크 모드 (기본)
    console.log(`[링크] 직접: ${url.substring(0, 40)}...`);
    return url;
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
   * 상품 URL → go.php 리다이렉트 URL 생성
   *
   * 우선순위: shortenUrl > productUrl > url
   */
  getSafeProductUrl(product) {
    // shortenUrl 우선 사용 (쿠팡 API에서 제공하는 단축 URL)
    const originalUrl = product.shortenUrl || product.productUrl || product.url || '';

    if (!originalUrl) {
      console.warn(`[링크] URL 없음: ${product.productName || 'unknown'}`);
      return null;
    }

    return this.generateRedirectUrl(originalUrl);
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
