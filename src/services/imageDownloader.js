/**
 * 상품 이미지 다운로더
 *
 * 상품 이미지 URL을 다운로드해서 로컬 폴더에 저장
 * 파일명을 상품명에 맞춰 자동 변경
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class ImageDownloader {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(__dirname, '../../data/images');
    this.timeout = options.timeout || 30000; // 30초
    this.retries = options.retries || 2;
    this.delay = options.delay || 500; // 요청 간 딜레이 (ms)

    // 통계
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
  }

  /**
   * 출력 디렉토리 생성
   */
  async ensureOutputDir(subDir = '') {
    const targetDir = subDir
      ? path.join(this.outputDir, subDir)
      : this.outputDir;

    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  }

  /**
   * 안전한 파일명 생성
   * 상품명에서 특수문자 제거하고 적절한 길이로 자름
   */
  sanitizeFilename(productName, productId) {
    // 특수문자 제거, 공백은 언더스코어로
    const safeName = productName
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 파일명 금지 문자 제거
      .replace(/[^\w가-힣\s-]/g, '')          // 영문, 한글, 숫자, 공백, 하이픈만 허용
      .replace(/\s+/g, '_')                   // 공백 → 언더스코어
      .replace(/_+/g, '_')                    // 중복 언더스코어 제거
      .trim()
      .slice(0, 50);                          // 최대 50자

    // 상품 ID 추가 (고유성 보장)
    return `${safeName}_${productId}`;
  }

  /**
   * URL에서 확장자 추출
   */
  getExtension(url) {
    try {
      const urlPath = new URL(url).pathname;
      const ext = path.extname(urlPath).toLowerCase();

      // 유효한 이미지 확장자인지 확인
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      if (validExtensions.includes(ext)) {
        return ext;
      }
    } catch (e) {
      // URL 파싱 실패
    }

    // 기본값
    return '.jpg';
  }

  /**
   * 단일 이미지 다운로드
   */
  async downloadImage(imageUrl, filename, subDir = '') {
    if (!imageUrl) {
      return { success: false, error: '이미지 URL이 없습니다.' };
    }

    const targetDir = await this.ensureOutputDir(subDir);
    const ext = this.getExtension(imageUrl);
    const filepath = path.join(targetDir, `${filename}${ext}`);

    // 이미 존재하는지 확인
    try {
      await fs.access(filepath);
      console.log(`  [스킵] 이미 존재: ${filename}${ext}`);
      this.stats.skipped++;
      return { success: true, filepath, skipped: true };
    } catch {
      // 파일이 없으면 계속 진행
    }

    // 다운로드 시도 (재시도 포함)
    let lastError = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`  [재시도 ${attempt}/${this.retries}] ${filename}`);
          await this.sleep(1000 * attempt); // 재시도 시 대기
        }

        const response = await axios({
          method: 'GET',
          url: imageUrl,
          responseType: 'arraybuffer',
          timeout: this.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        // 파일 저장
        await fs.writeFile(filepath, response.data);

        const fileSizeKB = Math.round(response.data.length / 1024);
        console.log(`  [다운로드] ${filename}${ext} (${fileSizeKB}KB)`);

        this.stats.success++;
        return {
          success: true,
          filepath,
          size: response.data.length,
          sizeKB: fileSizeKB
        };

      } catch (error) {
        lastError = error;

        // 재시도 불가능한 에러 (404 등)
        if (error.response?.status === 404) {
          break;
        }
      }
    }

    // 모든 시도 실패
    const errorMsg = lastError.response?.status
      ? `HTTP ${lastError.response.status}`
      : lastError.message;

    console.log(`  [실패] ${filename}: ${errorMsg}`);
    this.stats.failed++;

    return { success: false, error: errorMsg };
  }

  /**
   * 상품 정보로 이미지 다운로드
   */
  async downloadProductImage(product, subDir = '') {
    const filename = this.sanitizeFilename(product.productName, product.productId);
    return this.downloadImage(product.productImage, filename, subDir);
  }

  /**
   * 여러 상품 이미지 일괄 다운로드
   */
  async downloadBulkImages(products, options = {}) {
    const subDir = options.subDir || this.generateFolderName(options.keyword);
    const skipExisting = options.skipExisting !== false;

    console.log(`\n========== 이미지 다운로드 시작 ==========`);
    console.log(`대상: ${products.length}개 상품`);
    console.log(`저장 위치: ${path.join(this.outputDir, subDir)}`);
    console.log(`==========================================\n`);

    // 통계 초기화
    this.stats = { total: products.length, success: 0, failed: 0, skipped: 0 };

    const results = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      console.log(`[${i + 1}/${products.length}] ${product.productName.slice(0, 40)}...`);

      const result = await this.downloadProductImage(product, subDir);
      results.push({
        productId: product.productId,
        productName: product.productName,
        ...result
      });

      // 요청 간 딜레이 (서버 부하 방지)
      if (i < products.length - 1) {
        await this.sleep(this.delay);
      }
    }

    // 결과 요약
    this.printStats();

    // 다운로드 목록 저장
    await this.saveDownloadLog(results, subDir);

    return {
      results,
      stats: { ...this.stats },
      outputDir: path.join(this.outputDir, subDir)
    };
  }

  /**
   * 폴더명 생성 (키워드 + 날짜)
   */
  generateFolderName(keyword = 'images') {
    const safeKeyword = keyword
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 20);

    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `${safeKeyword}_${date}`;
  }

  /**
   * 다운로드 로그 저장
   */
  async saveDownloadLog(results, subDir) {
    const logPath = path.join(this.outputDir, subDir, '_download_log.json');

    const log = {
      downloadedAt: new Date().toISOString(),
      stats: this.stats,
      files: results.map(r => ({
        productId: r.productId,
        productName: r.productName,
        filepath: r.filepath,
        success: r.success,
        skipped: r.skipped || false,
        error: r.error || null
      }))
    };

    await fs.writeFile(logPath, JSON.stringify(log, null, 2), 'utf-8');
    console.log(`\n[로그 저장] ${logPath}`);
  }

  /**
   * 통계 출력
   */
  printStats() {
    console.log(`\n========== 다운로드 결과 ==========`);
    console.log(`전체: ${this.stats.total}개`);
    console.log(`  - 성공: ${this.stats.success}개`);
    console.log(`  - 스킵 (이미 존재): ${this.stats.skipped}개`);
    console.log(`  - 실패: ${this.stats.failed}개`);
    console.log(`===================================\n`);
  }

  /**
   * 슬립 유틸리티
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 저장된 이미지 목록 조회
   */
  async listDownloadedImages(subDir = '') {
    const targetDir = subDir
      ? path.join(this.outputDir, subDir)
      : this.outputDir;

    try {
      const files = await fs.readdir(targetDir);
      const imageFiles = files.filter(f =>
        /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f)
      );

      return {
        directory: targetDir,
        count: imageFiles.length,
        files: imageFiles
      };
    } catch (error) {
      return {
        directory: targetDir,
        count: 0,
        files: [],
        error: '디렉토리를 찾을 수 없습니다.'
      };
    }
  }

  /**
   * 폴더별 이미지 통계
   */
  async getImageStats() {
    try {
      const folders = await fs.readdir(this.outputDir);
      const stats = [];

      for (const folder of folders) {
        const folderPath = path.join(this.outputDir, folder);
        const stat = await fs.stat(folderPath);

        if (stat.isDirectory()) {
          const images = await this.listDownloadedImages(folder);
          stats.push({
            folder,
            imageCount: images.count,
            path: folderPath
          });
        }
      }

      return stats;
    } catch (error) {
      return [];
    }
  }

  /**
   * 이미지 통계 출력
   */
  async printImageStats() {
    const stats = await this.getImageStats();

    console.log('\n========== 저장된 이미지 통계 ==========');
    console.log(`저장 위치: ${this.outputDir}`);
    console.log('');

    if (stats.length === 0) {
      console.log('저장된 이미지가 없습니다.');
    } else {
      let totalImages = 0;
      for (const s of stats) {
        console.log(`  ${s.folder}: ${s.imageCount}개`);
        totalImages += s.imageCount;
      }
      console.log('');
      console.log(`총 ${stats.length}개 폴더, ${totalImages}개 이미지`);
    }

    console.log('========================================\n');
  }
}

module.exports = ImageDownloader;
