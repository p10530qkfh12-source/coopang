/**
 * 리뷰 초안 관리자
 * 생성된 초안을 저장, 조회, 수정하는 기능
 */

const fs = require('fs').promises;
const path = require('path');

class DraftManager {
  constructor() {
    this.draftsDir = path.join(__dirname, '../../data/drafts');
  }

  /**
   * 초안 디렉토리 초기화
   */
  async ensureDraftsDir() {
    try {
      await fs.mkdir(this.draftsDir, { recursive: true });
    } catch (error) {
      // 이미 존재하면 무시
    }
  }

  /**
   * 파일명 안전하게 변환
   */
  sanitizeFilename(name) {
    return name
      .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);
  }

  /**
   * 단일 초안 저장 (Markdown 파일)
   */
  async saveDraft(productName, draftContent, productId) {
    await this.ensureDraftsDir();

    const safeName = this.sanitizeFilename(productName);
    const timestamp = Date.now();
    const filename = `${safeName}_${productId}_${timestamp}.md`;
    const filepath = path.join(this.draftsDir, filename);

    await fs.writeFile(filepath, draftContent, 'utf-8');
    console.log(`  [저장] ${filename}`);

    return filepath;
  }

  /**
   * 여러 초안 일괄 저장
   */
  async saveBulkDrafts(draftsWithProducts) {
    console.log(`\n[저장 시작] ${draftsWithProducts.length}개 초안 저장 중...\n`);

    const savedFiles = [];

    for (const { product, draft } of draftsWithProducts) {
      const filepath = await this.saveDraft(
        product.productName,
        draft.content,
        product.productId
      );
      savedFiles.push({
        productId: product.productId,
        productName: product.productName,
        filepath,
        wordCount: draft.wordCount
      });
    }

    // 인덱스 파일 생성
    await this.saveIndex(savedFiles);

    console.log(`\n[완료] ${savedFiles.length}개 파일 저장됨`);
    console.log(`       위치: ${this.draftsDir}\n`);

    return savedFiles;
  }

  /**
   * 초안 목록 인덱스 저장
   */
  async saveIndex(savedFiles) {
    const indexPath = path.join(this.draftsDir, '_index.json');

    let existingIndex = [];
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      existingIndex = JSON.parse(content);
    } catch {
      // 파일 없으면 빈 배열로 시작
    }

    const newIndex = [
      ...existingIndex,
      ...savedFiles.map(f => ({
        ...f,
        savedAt: new Date().toISOString(),
        status: 'draft' // draft, reviewed, published
      }))
    ];

    await fs.writeFile(indexPath, JSON.stringify(newIndex, null, 2), 'utf-8');
  }

  /**
   * 저장된 초안 목록 조회
   */
  async listDrafts() {
    const indexPath = path.join(this.draftsDir, '_index.json');

    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * 초안 상태 업데이트
   */
  async updateDraftStatus(productId, status) {
    const indexPath = path.join(this.draftsDir, '_index.json');

    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(content);

      const updated = index.map(item => {
        if (item.productId === productId) {
          return { ...item, status, updatedAt: new Date().toISOString() };
        }
        return item;
      });

      await fs.writeFile(indexPath, JSON.stringify(updated, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 초안 통계 출력
   */
  async printStats() {
    const drafts = await this.listDrafts();

    if (drafts.length === 0) {
      console.log('저장된 초안이 없습니다.');
      return;
    }

    const stats = {
      total: drafts.length,
      draft: drafts.filter(d => d.status === 'draft').length,
      reviewed: drafts.filter(d => d.status === 'reviewed').length,
      published: drafts.filter(d => d.status === 'published').length
    };

    console.log('\n========== 초안 통계 ==========');
    console.log(`전체: ${stats.total}개`);
    console.log(`  - 초안: ${stats.draft}개`);
    console.log(`  - 검토완료: ${stats.reviewed}개`);
    console.log(`  - 발행됨: ${stats.published}개`);
    console.log('================================\n');
  }
}

module.exports = DraftManager;
