/**
 * 워드프레스 자동 포스팅 서비스
 *
 * 워드프레스 REST API를 통해 블로그에 포스트 자동 업로드
 * - 애플리케이션 비밀번호 인증
 * - 카테고리/태그 설정
 * - 쿠팡 파트너스 고지 자동 포함
 * - 중복 포스팅 방지
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const DuplicateChecker = require('./duplicateChecker');
const ContentEnhancer = require('./contentEnhancer');

class WordPressPublisher {
  constructor(options = {}) {
    // 환경변수에서 설정 로드
    this.siteUrl = options.siteUrl || process.env.WP_SITE_URL;
    this.username = options.username || process.env.WP_USERNAME;
    this.appPassword = options.appPassword || process.env.WP_APP_PASSWORD;

    // API 엔드포인트 (Plain 퍼머링크 지원)
    this.usePlainPermalinks = options.usePlainPermalinks || false;
    this.apiBase = this.siteUrl ? this.buildApiBase() : null;

    // 기본 설정
    this.defaultCategory = options.defaultCategory || null;
    this.defaultTags = options.defaultTags || [];
    this.defaultStatus = options.defaultStatus || 'draft'; // draft, publish, pending

    // 공정위 문구 (포스트 최상단에 삽입)
    this.ftcDisclaimer = options.ftcDisclaimer || `
<div style="margin-bottom: 25px; padding: 12px 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.85em; color: #856404;">
  <strong>📢 광고 표시</strong> 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
</div>`;

    // 쿠팡 파트너스 고지 문구 (포스트 하단)
    this.partnerDisclaimer = options.partnerDisclaimer || `
<div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ccc; font-size: 0.9em; color: #666;">
  <p><strong>쿠팡 파트너스 활동 안내</strong></p>
  <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
  <p>상품 정보 및 가격은 작성 시점 기준이며, 변동될 수 있습니다.</p>
</div>`;

    // 컨텐츠 강화 서비스
    this.contentEnhancer = new ContentEnhancer();

    // 중복 체커
    this.duplicateChecker = new DuplicateChecker();

    // 통계
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
  }

  /**
   * API Base URL 생성
   */
  buildApiBase() {
    const baseUrl = this.siteUrl.replace(/\/$/, '');
    if (this.usePlainPermalinks) {
      return `${baseUrl}/?rest_route=/wp/v2`;
    }
    return `${baseUrl}/wp-json/wp/v2`;
  }

  /**
   * API 엔드포인트 URL 생성
   */
  getEndpointUrl(endpoint) {
    const baseUrl = this.siteUrl.replace(/\/$/, '');
    if (this.usePlainPermalinks) {
      return `${baseUrl}/?rest_route=/wp/v2/${endpoint}`;
    }
    return `${baseUrl}/wp-json/wp/v2/${endpoint}`;
  }

  /**
   * 설정 확인
   */
  isConfigured() {
    return !!(this.siteUrl && this.username && this.appPassword);
  }

  /**
   * 설정 오류 메시지 출력
   */
  printConfigError() {
    console.error('\n========================================');
    console.error('  워드프레스 설정이 필요합니다!');
    console.error('========================================\n');
    console.error('1. 워드프레스 관리자에서 애플리케이션 비밀번호 생성');
    console.error('   → 사용자 → 프로필 → 애플리케이션 비밀번호');
    console.error('   → 새 애플리케이션 비밀번호 추가\n');
    console.error('2. .env 파일에 추가:');
    console.error('   WP_SITE_URL=https://your-blog.com');
    console.error('   WP_USERNAME=your_username');
    console.error('   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx\n');
    console.error('참고: 애플리케이션 비밀번호는 공백 포함해서 입력하세요.');
    console.error('');
  }

  /**
   * 인증 헤더 생성
   */
  getAuthHeader() {
    const credentials = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  // ============================================
  // 1. 썸네일(특성 이미지) 업로드
  // ============================================

  /**
   * 이미지 URL을 워드프레스 미디어 라이브러리에 업로드
   * @param {string} imageUrl - 이미지 URL
   * @param {string} filename - 저장할 파일명
   * @param {string} altText - 대체 텍스트
   * @returns {Object} { success, mediaId, mediaUrl }
   */
  async uploadImageFromUrl(imageUrl, filename, altText = '') {
    if (!imageUrl) {
      return { success: false, error: '이미지 URL이 없습니다.' };
    }

    try {
      console.log(`[미디어] 이미지 다운로드 중: ${imageUrl.slice(0, 50)}...`);

      // 1. 이미지 다운로드
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      let imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';

      // 이미지 메타데이터 제거 (EXIF 스트리핑)
      imageBuffer = this.stripImageMetadata(imageBuffer);

      // 확장자 결정
      const extMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      const ext = extMap[contentType] || '.jpg';
      const safeFilename = this.sanitizeFilename(filename) + ext;

      console.log(`[미디어] 워드프레스에 업로드 중: ${safeFilename}`);

      // 2. 워드프레스 미디어 라이브러리에 업로드
      const credentials = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64');

      const uploadResponse = await axios.post(
        this.getEndpointUrl('media'),
        imageBuffer,
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"`
          }
        }
      );

      const mediaId = uploadResponse.data.id;
      const mediaUrl = uploadResponse.data.source_url;

      // 3. 대체 텍스트 설정
      if (altText) {
        await axios.post(
          this.getEndpointUrl(`media/${mediaId}`),
          { alt_text: altText },
          { headers: this.getAuthHeader() }
        );
      }

      console.log(`[미디어] 업로드 성공: ID=${mediaId}`);

      return {
        success: true,
        mediaId: mediaId,
        mediaUrl: mediaUrl
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`[미디어] 업로드 실패: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * 파일명 안전하게 변환
   */
  sanitizeFilename(name) {
    return name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  }

  /**
   * 포스트에 특성 이미지(Featured Image) 설정
   */
  async setFeaturedImage(postId, mediaId) {
    try {
      await axios.post(
        this.getEndpointUrl(`posts/${postId}`),
        { featured_media: mediaId },
        { headers: this.getAuthHeader() }
      );

      console.log(`[미디어] 특성 이미지 설정 완료: 포스트 ${postId} ← 미디어 ${mediaId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 이미지 메타데이터 제거 (EXIF 스트리핑)
   * JPEG의 경우 SOI 마커부터 시작해서 EXIF/APP1 세그먼트 제거
   */
  stripImageMetadata(imageBuffer) {
    // JPEG 파일인지 확인 (SOI 마커: 0xFFD8)
    if (imageBuffer[0] !== 0xFF || imageBuffer[1] !== 0xD8) {
      // JPEG가 아니면 그대로 반환 (PNG 등)
      console.log('[미디어] JPEG가 아닌 이미지 - 메타데이터 스트리핑 생략');
      return imageBuffer;
    }

    console.log('[미디어] 이미지 메타데이터 제거 중...');

    const result = [];
    let i = 0;

    // SOI 마커 복사
    result.push(imageBuffer[0], imageBuffer[1]);
    i = 2;

    while (i < imageBuffer.length - 1) {
      // 마커 시작 확인
      if (imageBuffer[i] !== 0xFF) {
        // 이미지 데이터 영역 - 나머지 모두 복사
        while (i < imageBuffer.length) {
          result.push(imageBuffer[i++]);
        }
        break;
      }

      const marker = imageBuffer[i + 1];

      // EOI (End of Image) 또는 SOS (Start of Scan) - 이후 데이터 모두 복사
      if (marker === 0xD9 || marker === 0xDA) {
        while (i < imageBuffer.length) {
          result.push(imageBuffer[i++]);
        }
        break;
      }

      // 세그먼트 길이 읽기
      const segmentLength = (imageBuffer[i + 2] << 8) + imageBuffer[i + 3];

      // APP1 (EXIF), APP2-APP15 세그먼트 제거 (0xE1 ~ 0xEF)
      if (marker >= 0xE1 && marker <= 0xEF) {
        // 이 세그먼트 건너뛰기
        i += 2 + segmentLength;
        continue;
      }

      // APP0 (JFIF)도 제거 가능하지만 보존
      // 나머지 세그먼트는 복사
      for (let j = 0; j < 2 + segmentLength && i + j < imageBuffer.length; j++) {
        result.push(imageBuffer[i + j]);
      }
      i += 2 + segmentLength;
    }

    const strippedBuffer = Buffer.from(result);
    const savedBytes = imageBuffer.length - strippedBuffer.length;

    if (savedBytes > 0) {
      console.log(`[미디어] 메타데이터 ${(savedBytes / 1024).toFixed(1)}KB 제거됨`);
    }

    return strippedBuffer;
  }

  // ============================================
  // 2. SEO 최적화 (키워드 추출 & 슬러그)
  // ============================================

  /**
   * 상품명에서 SEO 키워드 추출 (3~5개)
   */
  extractKeywords(productName, additionalKeywords = []) {
    // 불용어 (제외할 단어)
    const stopWords = new Set([
      '의', '가', '이', '은', '들', '는', '좀', '잘', '걍', '과', '도', '를', '으로',
      '자', '에', '와', '한', '하다', '및', '더', '등', '데', '때', '년', '월', '일',
      'the', 'a', 'an', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'of'
    ]);

    // 상품명 토큰화
    const words = productName
      .replace(/[^\w가-힣\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1)
      .filter(w => !stopWords.has(w.toLowerCase()))
      .filter(w => !/^\d+$/.test(w)); // 숫자만 있는 것 제외

    // 빈도 계산
    const wordFreq = {};
    words.forEach(w => {
      const key = w.toLowerCase();
      wordFreq[key] = (wordFreq[key] || 0) + 1;
    });

    // 상위 키워드 추출
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    // 추가 키워드와 합치기 (중복 제거)
    const allKeywords = [...new Set([...topKeywords, ...additionalKeywords])];

    return allKeywords.slice(0, 5);
  }

  /**
   * 여러 상품에서 공통 키워드 추출
   */
  extractKeywordsFromProducts(products, baseKeyword = '') {
    const allWords = [];

    products.forEach(p => {
      const words = this.extractKeywords(p.productName);
      allWords.push(...words);
    });

    // 빈도 계산
    const wordFreq = {};
    allWords.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    // 상위 키워드
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word]) => word);

    // 기본 키워드 추가
    const keywords = baseKeyword
      ? [baseKeyword, ...topKeywords.filter(k => k !== baseKeyword.toLowerCase())]
      : topKeywords;

    return keywords.slice(0, 5);
  }

  /**
   * SEO 친화적인 유니크 슬러그 생성
   */
  generateUniqueSlug(keyword, productIds = []) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

    // 키워드를 슬러그로 변환
    const keywordSlug = keyword
      .toLowerCase()
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);

    // 상품 ID 해시 (유니크성 보장)
    const idHash = productIds.length > 0
      ? productIds.slice(0, 3).join('-').slice(0, 10)
      : Math.random().toString(36).slice(2, 8);

    return `${keywordSlug}-${dateStr}-${idHash}`;
  }

  // ============================================
  // 3. 예약 발행 (Scheduling)
  // ============================================

  /**
   * 예약 발행 시간 계산
   * @param {number} index - 포스트 순번 (0부터)
   * @param {Object} options - 옵션
   * @returns {string} ISO 8601 형식의 날짜/시간
   */
  calculateScheduleTime(index, options = {}) {
    const {
      postsPerDay = 3,           // 하루 발행 개수
      startHour = 9,             // 시작 시간 (오전 9시)
      endHour = 21,              // 종료 시간 (오후 9시)
      startDate = new Date()     // 시작 날짜
    } = options;

    // 몇 번째 날인지 계산
    const dayOffset = Math.floor(index / postsPerDay);

    // 하루 중 몇 번째 포스트인지
    const postOfDay = index % postsPerDay;

    // 시간 간격 계산 (시작~종료 시간을 균등 분할)
    const hoursRange = endHour - startHour;
    const hourInterval = hoursRange / postsPerDay;
    const postHour = startHour + (postOfDay * hourInterval);

    // 날짜 계산
    const scheduleDate = new Date(startDate);
    scheduleDate.setDate(scheduleDate.getDate() + dayOffset);
    scheduleDate.setHours(Math.floor(postHour), Math.floor((postHour % 1) * 60), 0, 0);

    // 과거 시간이면 내일로 조정
    if (scheduleDate <= new Date()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    return scheduleDate.toISOString();
  }

  /**
   * 예약 발행 일정 미리보기
   */
  previewSchedule(count, options = {}) {
    console.log('\n========== 예약 발행 일정 미리보기 ==========');
    console.log(`총 ${count}개 포스트\n`);

    for (let i = 0; i < count; i++) {
      const scheduleTime = this.calculateScheduleTime(i, options);
      const date = new Date(scheduleTime);
      const dateStr = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`  ${i + 1}. ${dateStr}`);
    }

    console.log('\n=============================================\n');
  }

  // ============================================
  // API 메서드
  // ============================================

  /**
   * 퍼머링크 형식 자동 감지
   */
  async detectPermalinkFormat() {
    const baseUrl = this.siteUrl.replace(/\/$/, '');

    // 1. Plain Permalinks 먼저 시도 (더 안정적)
    try {
      const response = await axios.get(`${baseUrl}/?rest_route=/wp/v2/`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      if (response.status === 200 && response.data && typeof response.data === 'object') {
        this.usePlainPermalinks = true;
        this.apiBase = this.buildApiBase();
        return 'plain';
      }
    } catch (e) {
      // Plain 실패, Pretty 시도
    }

    // 2. Pretty Permalinks 시도
    try {
      const response = await axios.get(`${baseUrl}/wp-json/wp/v2/`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      if (response.status === 200 && response.data && typeof response.data === 'object') {
        this.usePlainPermalinks = false;
        this.apiBase = this.buildApiBase();
        return 'pretty';
      }
    } catch (e) {
      // 둘 다 실패
    }

    // 기본값: Plain
    this.usePlainPermalinks = true;
    this.apiBase = this.buildApiBase();
    return 'plain';
  }

  /**
   * 연결 테스트
   */
  async testConnection() {
    if (!this.isConfigured()) {
      this.printConfigError();
      return { success: false, error: '설정 필요' };
    }

    console.log('\n[워드프레스] 연결 테스트 중...');

    // 퍼머링크 형식 자동 감지
    const permalinkFormat = await this.detectPermalinkFormat();
    if (!permalinkFormat) {
      console.error('[워드프레스] REST API에 접근할 수 없습니다.');
      return { success: false, error: 'REST API 접근 불가' };
    }
    console.log(`[워드프레스] 퍼머링크 형식: ${permalinkFormat}`);

    try {
      const response = await axios.get(this.getEndpointUrl('users/me'), {
        headers: this.getAuthHeader()
      });

      console.log(`[워드프레스] 연결 성공!`);
      console.log(`  - 사이트: ${this.siteUrl}`);
      console.log(`  - 사용자: ${response.data.name} (@${response.data.slug})`);
      console.log(`  - 역할: ${response.data.roles?.join(', ') || 'N/A'}\n`);

      return { success: true, user: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`[워드프레스] 연결 실패: ${errorMsg}\n`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * 카테고리 목록 조회
   */
  async getCategories() {
    try {
      const response = await axios.get(this.getEndpointUrl('categories'), {
        headers: this.getAuthHeader(),
        params: { per_page: 100 }
      });

      return {
        success: true,
        categories: response.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat.count
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 카테고리 ID 찾기 (이름 또는 슬러그로)
   */
  async findCategoryId(nameOrSlug) {
    const result = await this.getCategories();
    if (!result.success) return null;

    const category = result.categories.find(cat =>
      cat.name.toLowerCase() === nameOrSlug.toLowerCase() ||
      cat.slug.toLowerCase() === nameOrSlug.toLowerCase()
    );

    return category ? category.id : null;
  }

  /**
   * 카테고리 생성 (없으면)
   */
  async createCategory(name, slug = null) {
    try {
      const response = await axios.post(this.getEndpointUrl('categories'), {
        name: name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-')
      }, {
        headers: this.getAuthHeader()
      });

      return { success: true, category: response.data };
    } catch (error) {
      // 이미 존재하면 ID 반환
      if (error.response?.data?.code === 'term_exists') {
        return { success: true, categoryId: error.response.data.data.term_id };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * 태그 ID 찾기 또는 생성
   */
  async getOrCreateTags(tagNames) {
    const tagIds = [];

    for (const tagName of tagNames) {
      try {
        // 먼저 검색
        const searchResponse = await axios.get(this.getEndpointUrl('tags'), {
          headers: this.getAuthHeader(),
          params: { search: tagName }
        });

        if (searchResponse.data.length > 0) {
          tagIds.push(searchResponse.data[0].id);
        } else {
          // 없으면 생성
          const createResponse = await axios.post(this.getEndpointUrl('tags'), {
            name: tagName
          }, {
            headers: this.getAuthHeader()
          });
          tagIds.push(createResponse.data.id);
        }
      } catch (error) {
        console.log(`[워드프레스] 태그 "${tagName}" 처리 실패`);
      }
    }

    return tagIds;
  }

  // ============================================
  // 포스트 생성
  // ============================================

  /**
   * HTML 컨텐츠 생성 (마크다운 → HTML 변환)
   */
  convertMarkdownToHtml(markdown) {
    // 간단한 마크다운 → HTML 변환
    let html = markdown
      // 제목
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // 굵게
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 이탤릭
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 링크
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 이미지
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // 인용
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // 리스트
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // 구분선
      .replace(/^---$/gm, '<hr />')
      // 줄바꿈
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    // 리스트 래핑
    html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

    // 테이블 처리 (간단한 버전)
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        return ''; // 구분선 제거
      }
      const isHeader = match.includes('**');
      const cellTag = isHeader ? 'th' : 'td';
      const row = cells.map(c => `<${cellTag}>${c.trim()}</${cellTag}>`).join('');
      return `<tr>${row}</tr>`;
    });

    return `<p>${html}</p>`;
  }

  /**
   * 상품용 HTML 블록 생성
   */
  generateProductHtml(product, index) {
    const tags = [];
    if (product.isRocket) tags.push('🚀 로켓배송');
    if (product.isFreeShipping) tags.push('📦 무료배송');
    if (product.rating >= 4.5) tags.push('⭐ 베스트');

    return `
<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fff;">
  <h3 style="margin-top: 0;">${index}. ${product.productName}</h3>

  ${product.productImage ? `<img src="${product.productImage}" alt="${product.productName}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;" />` : ''}

  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>가격</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; color: #e74c3c; font-size: 1.2em;"><strong>${product.productPrice.toLocaleString()}원</strong></td>
    </tr>
    ${product.rating ? `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>평점</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">⭐ ${product.rating}점 (리뷰 ${product.reviewCount?.toLocaleString() || 0}개)</td>
    </tr>
    ` : ''}
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>배송</strong></td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.isRocket ? '🚀 로켓배송' : '일반배송'}</td>
    </tr>
  </table>

  ${tags.length > 0 ? `<p>${tags.join(' · ')}</p>` : ''}

  <a href="${product.productUrl}" target="_blank" rel="noopener noreferrer sponsored"
     style="display: inline-block; background: #FF5722; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px;">
    👉 구매하러 가기
  </a>
</div>`;
  }

  /**
   * 전체 포스트 HTML 생성 (수익 최적화 모드)
   */
  generatePostHtml(products, options = {}) {
    const keyword = options.keyword || '추천 상품';
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    // 옵션
    const {
      includeReviews = true,      // 리뷰 요약 포함
      includeQA = true,           // Q&A 섹션 포함
      includeFtcDisclaimer = true // 공정위 문구 포함
    } = options;

    // 통계 계산
    const avgPrice = Math.round(products.reduce((sum, p) => sum + p.productPrice, 0) / products.length);
    const rocketCount = products.filter(p => p.isRocket).length;

    // HTML 시작 - 공정위 문구 최상단 삽입
    let html = '';

    if (includeFtcDisclaimer) {
      html += this.ftcDisclaimer;
    }

    // 인트로
    html += `
<p>안녕하세요! 오늘은 <strong>${keyword}</strong> 추천 상품 ${products.length}개를 소개해 드릴게요.</p>

<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 5px 0;">📊 평균 가격: <strong>${avgPrice.toLocaleString()}원</strong></p>
  <p style="margin: 5px 0;">🚀 로켓배송: <strong>${rocketCount}개</strong></p>
  <p style="margin: 5px 0;">📅 업데이트: <strong>${year}년 ${month}월</strong></p>
</div>

<h2>🛒 추천 상품 목록</h2>
`;

    // 상품별 HTML + 리뷰 요약
    products.forEach((product, index) => {
      html += this.generateProductHtml(product, index + 1);

      // 각 상품 아래에 리뷰 요약 추가
      if (includeReviews) {
        html += this.contentEnhancer.generateReviewHtml(product);
      }
    });

    // Q&A 섹션 추가 (AI 검색 최적화)
    if (includeQA) {
      html += this.contentEnhancer.generateQAHtml(products, keyword);
    }

    // 파트너스 고지 (하단)
    html += this.partnerDisclaimer;

    return html;
  }

  /**
   * 포스트 생성 (고급 옵션 지원)
   */
  async createPost(options) {
    if (!this.isConfigured()) {
      this.printConfigError();
      return { success: false, error: '설정 필요' };
    }

    const {
      title,
      content,
      status = this.defaultStatus,
      categories = [],
      tags = [],
      excerpt = null,
      // 새 옵션들
      slug = null,              // SEO 슬러그
      featuredImageUrl = null,  // 특성 이미지 URL
      featuredImageAlt = null,  // 특성 이미지 alt 텍스트
      scheduleDate = null       // 예약 발행 날짜 (ISO 8601)
    } = options;

    try {
      // 카테고리 ID 변환
      let categoryIds = [];
      for (const cat of categories) {
        if (typeof cat === 'number') {
          categoryIds.push(cat);
        } else {
          const catId = await this.findCategoryId(cat);
          if (catId) categoryIds.push(catId);
        }
      }

      // 태그 ID 가져오기
      const tagIds = tags.length > 0 ? await this.getOrCreateTags(tags) : [];

      // 포스트 데이터
      const postData = {
        title: title,
        content: content,
        status: scheduleDate ? 'future' : status, // 예약 발행이면 'future'
        categories: categoryIds,
        tags: tagIds
      };

      // SEO 슬러그 설정
      if (slug) {
        postData.slug = slug;
      }

      // 예약 발행 날짜
      if (scheduleDate) {
        postData.date = scheduleDate;
        console.log(`[예약] 발행 예정: ${new Date(scheduleDate).toLocaleString('ko-KR')}`);
      }

      if (excerpt) {
        postData.excerpt = excerpt;
      }

      // 1. 특성 이미지 업로드 (있으면)
      let featuredMediaId = null;
      if (featuredImageUrl) {
        const mediaResult = await this.uploadImageFromUrl(
          featuredImageUrl,
          title,
          featuredImageAlt || title
        );

        if (mediaResult.success) {
          featuredMediaId = mediaResult.mediaId;
          postData.featured_media = featuredMediaId;
        }
      }

      // 2. API 호출 - 포스트 생성
      const response = await axios.post(this.getEndpointUrl('posts'), postData, {
        headers: this.getAuthHeader()
      });
      const data = response.data;
      const postTitle = data.title?.rendered || data.title?.raw || title;
      const postLink = typeof data.link === 'string' ? data.link : `${this.siteUrl}/?p=${data.id}`;

      return {
        success: true,
        post: {
          id: data.id,
          title: postTitle,
          link: postLink,
          status: data.status,
          slug: data.slug || '',
          date: data.date,
          featuredMediaId: featuredMediaId
        }
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`[워드프레스] API 오류: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  // ============================================
  // 상품 포스팅
  // ============================================

  /**
   * 상품 목록으로 포스트 생성 및 업로드 (고급 옵션)
   */
  async publishProducts(products, options = {}) {
    if (!this.isConfigured()) {
      this.printConfigError();
      return { success: false, error: '설정 필요' };
    }

    // 퍼머링크 형식 자동 감지
    await this.detectPermalinkFormat();

    const keyword = options.keyword || '추천 상품';
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    console.log(`\n========== 워드프레스 포스팅 시작 ==========`);
    console.log(`키워드: ${keyword}`);
    console.log(`상품 수: ${products.length}개`);
    console.log(`상태: ${options.schedule ? '예약 발행' : (options.status || this.defaultStatus)}`);
    console.log(`수익 최적화: 리뷰요약=${options.includeReviews !== false ? 'ON' : 'OFF'}, Q&A=${options.includeQA !== false ? 'ON' : 'OFF'}`);
    console.log(`==========================================\n`);

    // 제목 생성
    const title = options.title || `${keyword} 추천 TOP ${products.length} (${year}년 ${month}월)`;

    // HTML 컨텐츠 생성 (수익 최적화 모드)
    const content = this.generatePostHtml(products, {
      keyword,
      includeReviews: options.includeReviews !== false,
      includeQA: options.includeQA !== false,
      includeFtcDisclaimer: options.includeFtcDisclaimer !== false
    });

    // 요약 생성
    const excerpt = `${keyword} 관련 인기 상품 ${products.length}개를 엄선하여 소개합니다. 가격, 평점, 배송 정보를 한눈에 비교해보세요.`;

    // SEO 키워드 자동 추출
    const seoKeywords = options.tags || this.extractKeywordsFromProducts(products, keyword);
    console.log(`[SEO] 추출된 키워드: ${seoKeywords.join(', ')}`);

    // 유니크 슬러그 생성
    const productIds = products.map(p => p.productId);
    const slug = options.slug || this.generateUniqueSlug(keyword, productIds);
    console.log(`[SEO] 슬러그: ${slug}`);

    // 특성 이미지 (첫 번째 상품 이미지 사용)
    const featuredImageUrl = options.featuredImageUrl || products[0]?.productImage;

    // 예약 발행 시간 (옵션)
    let scheduleDate = null;
    if (options.schedule) {
      scheduleDate = this.calculateScheduleTime(options.scheduleIndex || 0, options.scheduleOptions);
    }

    // 포스트 생성
    const result = await this.createPost({
      title: title,
      content: content,
      excerpt: excerpt,
      status: options.status || this.defaultStatus,
      categories: options.categories || [this.defaultCategory].filter(Boolean),
      tags: seoKeywords,
      slug: slug,
      featuredImageUrl: featuredImageUrl,
      featuredImageAlt: `${keyword} 추천 상품`,
      scheduleDate: scheduleDate
    });

    if (result.success) {
      console.log(`\n[워드프레스] 포스트 생성 성공!`);
      console.log(`  - 제목: ${result.post.title}`);
      console.log(`  - 상태: ${result.post.status}`);
      console.log(`  - 슬러그: ${result.post.slug}`);
      if (result.post.status === 'future') {
        console.log(`  - 예약 시간: ${new Date(result.post.date).toLocaleString('ko-KR')}`);
      }
      console.log(`  - URL: ${result.post.link}`);
      if (result.post.featuredMediaId) {
        console.log(`  - 특성 이미지: ID ${result.post.featuredMediaId}`);
      }
      console.log('');

      // 중복 체크 파일에 기록
      if (options.markAsPosted !== false) {
        await this.markProductsAsPublished(products, keyword);
      }
    } else {
      console.error(`[워드프레스] 포스트 생성 실패: ${result.error}\n`);
    }

    return result;
  }

  /**
   * 여러 포스트 예약 발행 (일정한 간격)
   * @param {Array} postDataArray - 포스트 데이터 배열
   * @param {Object} options - 예약 옵션
   */
  async publishWithSchedule(postDataArray, options = {}) {
    const {
      postsPerDay = 3,
      startHour = 9,
      endHour = 21,
      startDate = new Date()
    } = options;

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              예약 발행 시작                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`총 ${postDataArray.length}개 포스트`);
    console.log(`하루 ${postsPerDay}개씩, ${startHour}시 ~ ${endHour}시 사이 발행\n`);

    // 일정 미리보기
    this.previewSchedule(postDataArray.length, { postsPerDay, startHour, endHour, startDate });

    const results = [];

    for (let i = 0; i < postDataArray.length; i++) {
      const postData = postDataArray[i];

      console.log(`\n[${i + 1}/${postDataArray.length}] 포스트 업로드 중...`);

      const result = await this.publishProducts(postData.products, {
        ...postData.options,
        schedule: true,
        scheduleIndex: i,
        scheduleOptions: { postsPerDay, startHour, endHour, startDate }
      });

      results.push(result);

      // API 부하 방지
      if (i < postDataArray.length - 1) {
        await this.sleep(2000);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n========== 예약 발행 완료 ==========`);
    console.log(`성공: ${successCount}/${postDataArray.length}개`);
    console.log(`=====================================\n`);

    return results;
  }

  /**
   * 슬립 유틸리티
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 상품들을 발행 완료로 표시
   */
  async markProductsAsPublished(products, keyword) {
    console.log(`[중복체크] ${products.length}개 상품을 발행 완료로 표시...`);

    for (const product of products) {
      await this.duplicateChecker.markAsPosted(product.productId, {
        keyword: keyword,
        productName: product.productName,
        status: 'published'
      });
    }

    console.log(`[중복체크] 완료\n`);
  }

  /**
   * 카테고리 목록 출력
   */
  async printCategories() {
    const result = await this.getCategories();

    if (!result.success) {
      console.error('카테고리 조회 실패:', result.error);
      return;
    }

    console.log('\n========== 워드프레스 카테고리 ==========');
    result.categories.forEach(cat => {
      console.log(`  [${cat.id}] ${cat.name} (${cat.slug}) - ${cat.count}개 글`);
    });
    console.log('==========================================\n');
  }
}

module.exports = WordPressPublisher;
