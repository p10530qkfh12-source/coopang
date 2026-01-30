/**
 * 블로그 포스트 생성기
 * 상품 정보를 예쁜 마크다운 문서로 변환
 */

const fs = require('fs').promises;
const path = require('path');

class BlogPostGenerator {
  constructor(options = {}) {
    this.outputDir = path.join(__dirname, '../../data/posts');
    this.templateStyle = options.templateStyle || 'modern'; // modern, minimal, card
    this.includeDisclaimer = options.includeDisclaimer !== false;
    this.includeTableOfContents = options.includeTableOfContents || false;
  }

  /**
   * 출력 디렉토리 생성
   */
  async ensureOutputDir() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * 가격 포맷팅
   */
  formatPrice(price) {
    return price.toLocaleString('ko-KR') + '원';
  }

  /**
   * 할인율 계산 (원가가 있는 경우)
   */
  calculateDiscount(originalPrice, salePrice) {
    if (!originalPrice || originalPrice <= salePrice) return null;
    return Math.round((1 - salePrice / originalPrice) * 100);
  }

  /**
   * 상품 특징 태그 생성
   */
  generateFeatureTags(product) {
    const tags = [];

    if (product.isRocket) {
      tags.push('🚀 로켓배송');
    }
    if (product.isFreeShipping) {
      tags.push('📦 무료배송');
    }
    if (product.rating >= 4.5) {
      tags.push('⭐ 베스트');
    }
    if (product.reviewCount >= 100) {
      tags.push('💬 리뷰다수');
    }
    if (product.productPrice < 30000) {
      tags.push('💰 가성비');
    }

    return tags;
  }

  /**
   * 별점 시각화
   */
  renderStars(rating) {
    if (!rating) return '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars) + ` (${rating})`;
  }

  // ============================================
  // 템플릿 스타일별 렌더링
  // ============================================

  /**
   * 모던 스타일 - 단일 상품 카드
   */
  renderModernCard(product, index) {
    const tags = this.generateFeatureTags(product);
    const tagLine = tags.length > 0 ? tags.join(' · ') : '';

    return `
### ${index}. ${product.productName}

${product.productImage ? `![상품 이미지](${product.productImage})` : ''}

| 항목 | 내용 |
|:---:|:---|
| **가격** | **${this.formatPrice(product.productPrice)}** |
| **평점** | ${this.renderStars(product.rating)} |
| **리뷰** | ${product.reviewCount?.toLocaleString() || 0}개 |
| **카테고리** | ${product.categoryName || '미분류'} |

${tagLine ? `> ${tagLine}` : ''}

**[👉 구매하러 가기](${product.productUrl})**

---
`;
  }

  /**
   * 미니멀 스타일 - 간결한 리스트
   */
  renderMinimalCard(product, index) {
    const tags = this.generateFeatureTags(product);

    return `
### ${index}. ${product.productName}

- 💵 **${this.formatPrice(product.productPrice)}**${product.rating ? ` · ⭐ ${product.rating}점` : ''}${product.reviewCount ? ` · 리뷰 ${product.reviewCount}개` : ''}
${tags.length > 0 ? `- ${tags.join(' ')}` : ''}

➡️ **[구매하러 가기](${product.productUrl})**

---
`;
  }

  /**
   * 카드 스타일 - 비주얼 강조
   */
  renderVisualCard(product, index) {
    const tags = this.generateFeatureTags(product);
    const priceText = this.formatPrice(product.productPrice);

    return `
<div align="center">

### ${index}. ${product.productName}

${product.productImage ? `<img src="${product.productImage}" alt="${product.productName}" width="300"/>` : ''}

**💰 ${priceText}**

${tags.length > 0 ? `\`${tags.join('\` \`')}\`` : ''}

${product.rating ? `⭐ **${product.rating}점** (리뷰 ${product.reviewCount?.toLocaleString() || 0}개)` : ''}

<a href="${product.productUrl}">
  <img src="https://img.shields.io/badge/구매하러_가기-FF5722?style=for-the-badge&logo=coupang&logoColor=white" alt="구매하기"/>
</a>

</div>

---
`;
  }

  /**
   * 비교표 스타일 - 여러 상품 비교
   */
  renderComparisonTable(products) {
    if (products.length === 0) return '';

    let table = `
## 📊 상품 비교표

| 순위 | 상품명 | 가격 | 평점 | 특징 | 링크 |
|:---:|:---|---:|:---:|:---|:---:|
`;

    products.forEach((product, index) => {
      const tags = this.generateFeatureTags(product);
      const shortTags = tags.slice(0, 2).join(' ');
      const shortName = product.productName.length > 25
        ? product.productName.slice(0, 25) + '...'
        : product.productName;

      table += `| ${index + 1} | ${shortName} | ${this.formatPrice(product.productPrice)} | ${product.rating || '-'} | ${shortTags} | [보기](${product.productUrl}) |\n`;
    });

    return table + '\n';
  }

  /**
   * 상품 렌더링 (스타일에 따라)
   */
  renderProduct(product, index) {
    switch (this.templateStyle) {
      case 'minimal':
        return this.renderMinimalCard(product, index);
      case 'visual':
        return this.renderVisualCard(product, index);
      case 'modern':
      default:
        return this.renderModernCard(product, index);
    }
  }

  // ============================================
  // 포스트 생성
  // ============================================

  /**
   * 포스트 제목 생성
   */
  generateTitle(keyword, products) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const templates = [
      `${keyword} 추천 TOP ${products.length} (${year}년 ${month}월)`,
      `${year} ${keyword} 인기 상품 ${products.length}선`,
      `${keyword} 구매 가이드 - 추천 상품 ${products.length}개`,
      `요즘 잘 나가는 ${keyword} BEST ${products.length}`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 포스트 인트로 생성
   */
  generateIntro(keyword, products) {
    const avgPrice = Math.round(
      products.reduce((sum, p) => sum + p.productPrice, 0) / products.length
    );
    const rocketCount = products.filter(p => p.isRocket).length;

    return `
안녕하세요! 오늘은 **${keyword}** 관련 추천 상품 ${products.length}개를 소개해 드릴게요.

- 📊 평균 가격: **${this.formatPrice(avgPrice)}**
- 🚀 로켓배송 가능: **${rocketCount}개**
- ✅ 모든 상품 직접 선별

그럼 하나씩 살펴볼까요?
`;
  }

  /**
   * 목차 생성
   */
  generateTableOfContents(products) {
    let toc = `
## 📑 목차

`;
    products.forEach((product, index) => {
      const shortName = product.productName.length > 30
        ? product.productName.slice(0, 30) + '...'
        : product.productName;
      toc += `${index + 1}. [${shortName}](#${index + 1}-${encodeURIComponent(product.productName.slice(0, 20))})\n`;
    });

    return toc + '\n';
  }

  /**
   * 면책 조항 (쿠팡 파트너스 고지)
   */
  generateDisclaimer() {
    return `
---

> 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
>
> 상품 정보 및 가격은 작성 시점 기준이며, 변동될 수 있습니다.
`;
  }

  /**
   * 전체 블로그 포스트 생성
   */
  generatePost(products, keyword, options = {}) {
    const title = options.title || this.generateTitle(keyword, products);
    const includeComparison = options.includeComparison !== false;
    const style = options.style || this.templateStyle;

    // 임시로 스타일 변경
    const originalStyle = this.templateStyle;
    this.templateStyle = style;

    let post = `# ${title}\n`;

    // 인트로
    post += this.generateIntro(keyword, products);

    // 목차 (옵션)
    if (this.includeTableOfContents || options.includeTableOfContents) {
      post += this.generateTableOfContents(products);
    }

    // 비교표 (옵션)
    if (includeComparison && products.length > 1) {
      post += this.renderComparisonTable(products);
    }

    // 상품별 상세 섹션
    post += `\n## 🛒 상품 상세 정보\n`;

    products.forEach((product, index) => {
      post += this.renderProduct(product, index + 1);
    });

    // 면책 조항
    if (this.includeDisclaimer) {
      post += this.generateDisclaimer();
    }

    // 스타일 복원
    this.templateStyle = originalStyle;

    return {
      title,
      content: post,
      wordCount: post.split(/\s+/).length,
      productCount: products.length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 포스트를 파일로 저장
   */
  async savePost(post, filename) {
    await this.ensureOutputDir();

    const safeName = filename
      .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);

    const timestamp = Date.now();
    const filepath = path.join(this.outputDir, `${safeName}_${timestamp}.md`);

    await fs.writeFile(filepath, post.content, 'utf-8');

    console.log(`\n[저장 완료] ${filepath}`);
    return filepath;
  }

  /**
   * 여러 스타일로 프리뷰 생성
   */
  generateStylePreviews(products, keyword) {
    const styles = ['modern', 'minimal', 'visual'];
    const previews = {};

    for (const style of styles) {
      const post = this.generatePost(products.slice(0, 2), keyword, {
        style,
        includeComparison: false
      });
      previews[style] = post.content;
    }

    return previews;
  }
}

module.exports = BlogPostGenerator;
