/**
 * 수익 리포트 서비스
 *
 * 쿠팡 파트너스 대시보드에서 다운로드한 CSV 파일을 분석하여
 * 수익 리포트를 생성합니다.
 *
 * 사용법:
 * 1. 쿠팡 파트너스 대시보드 → 리포트 → CSV 다운로드
 * 2. data/revenue/ 폴더에 CSV 파일 저장
 * 3. npm run report 실행
 */

const fs = require('fs').promises;
const path = require('path');

class RevenueReporter {
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.join(process.cwd(), 'data', 'revenue');

    // CSV 컬럼 매핑 (쿠팡 CSV 형식에 맞게 조정 필요)
    this.columnMapping = options.columnMapping || {
      date: '날짜',
      productId: '상품ID',
      productName: '상품명',
      clicks: '클릭수',
      orders: '주문수',
      revenue: '예상수익',
      commission: '수수료'
    };

    // 리포트 데이터 캐시
    this.data = [];
    this.loaded = false;
  }

  /**
   * 데이터 디렉토리 초기화
   */
  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // 이미 존재하면 무시
    }
  }

  /**
   * CSV 파일 파싱
   */
  parseCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    // 헤더 파싱 (BOM 제거)
    const header = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim().replace(/"/g, ''));

    // 데이터 파싱
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === header.length) {
        const row = {};
        header.forEach((h, idx) => {
          row[h] = values[idx];
        });
        data.push(row);
      }
    }

    return data;
  }

  /**
   * CSV 라인 파싱 (따옴표 처리)
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  }

  /**
   * 데이터 정규화 (매핑 적용)
   */
  normalizeData(rawData) {
    const mapping = this.columnMapping;

    return rawData.map(row => {
      // 여러 가능한 컬럼명 시도
      const findValue = (keys) => {
        if (typeof keys === 'string') keys = [keys];
        for (const key of keys) {
          if (row[key] !== undefined) return row[key];
        }
        return null;
      };

      return {
        date: this.parseDate(findValue([mapping.date, '날짜', 'Date', '일자'])),
        productId: findValue([mapping.productId, '상품ID', 'ProductID', '상품코드']),
        productName: findValue([mapping.productName, '상품명', 'ProductName', '상품이름']),
        clicks: this.parseNumber(findValue([mapping.clicks, '클릭수', 'Clicks', '클릭'])),
        orders: this.parseNumber(findValue([mapping.orders, '주문수', 'Orders', '주문', '구매건수'])),
        revenue: this.parseNumber(findValue([mapping.revenue, '예상수익', 'Revenue', '수익', '매출'])),
        commission: this.parseNumber(findValue([mapping.commission, '수수료', 'Commission', '커미션']))
      };
    }).filter(row => row.date !== null);
  }

  /**
   * 날짜 파싱
   */
  parseDate(value) {
    if (!value) return null;

    // 다양한 형식 지원
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,           // 2024-01-15
      /^(\d{4})\/(\d{2})\/(\d{2})$/,          // 2024/01/15
      /^(\d{2})-(\d{2})-(\d{4})$/,            // 15-01-2024
      /^(\d{4})\.(\d{2})\.(\d{2})$/           // 2024.01.15
    ];

    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        // 연도가 4자리인지 확인
        const year = match[1].length === 4 ? match[1] : match[3];
        const month = match[1].length === 4 ? match[2] : match[1];
        const day = match[1].length === 4 ? match[3] : match[2];
        return new Date(year, month - 1, day);
      }
    }

    // 기본 파싱 시도
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * 숫자 파싱
   */
  parseNumber(value) {
    if (value === null || value === undefined) return 0;
    // 콤마, 원화 기호 등 제거
    const cleaned = String(value).replace(/[,원₩\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  /**
   * CSV 파일들 로드
   */
  async loadData() {
    await this.ensureDataDir();

    try {
      const files = await fs.readdir(this.dataDir);
      const csvFiles = files.filter(f => f.endsWith('.csv'));

      if (csvFiles.length === 0) {
        console.log('\n[리포트] CSV 파일이 없습니다.');
        console.log(`  → ${this.dataDir} 폴더에 CSV 파일을 넣어주세요.\n`);
        return false;
      }

      this.data = [];

      for (const file of csvFiles) {
        const filePath = path.join(this.dataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const rawData = this.parseCSV(content);
        const normalizedData = this.normalizeData(rawData);

        console.log(`[리포트] ${file} 로드: ${normalizedData.length}개 레코드`);
        this.data.push(...normalizedData);
      }

      // 날짜순 정렬
      this.data.sort((a, b) => b.date - a.date);
      this.loaded = true;

      console.log(`[리포트] 총 ${this.data.length}개 레코드 로드 완료\n`);
      return true;

    } catch (error) {
      console.error(`[리포트] 데이터 로드 실패: ${error.message}`);
      return false;
    }
  }

  /**
   * 특정 날짜의 데이터 필터링
   */
  getDataByDate(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return this.data.filter(row => {
      const rowDate = new Date(row.date);
      rowDate.setHours(0, 0, 0, 0);
      return rowDate.getTime() === targetDate.getTime();
    });
  }

  /**
   * 날짜 범위 데이터 필터링
   */
  getDataByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.data.filter(row => {
      const rowDate = new Date(row.date);
      return rowDate >= start && rowDate <= end;
    });
  }

  /**
   * 어제 날짜 가져오기
   */
  getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // ============================================
  // 리포트 생성
  // ============================================

  /**
   * 일일 수익 리포트 생성
   */
  generateDailyReport(date = null) {
    const targetDate = date || this.getYesterday();
    const data = this.getDataByDate(targetDate);

    const dateStr = targetDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // 집계
    const summary = {
      totalRevenue: 0,
      totalCommission: 0,
      totalClicks: 0,
      totalOrders: 0,
      products: []
    };

    // 상품별 집계
    const productMap = new Map();

    data.forEach(row => {
      summary.totalRevenue += row.revenue;
      summary.totalCommission += row.commission;
      summary.totalClicks += row.clicks;
      summary.totalOrders += row.orders;

      const key = row.productId || row.productName;
      if (key) {
        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: row.productId,
            productName: row.productName,
            clicks: 0,
            orders: 0,
            revenue: 0,
            commission: 0
          });
        }
        const product = productMap.get(key);
        product.clicks += row.clicks;
        product.orders += row.orders;
        product.revenue += row.revenue;
        product.commission += row.commission;
      }
    });

    // 수익순 정렬
    summary.products = Array.from(productMap.values())
      .sort((a, b) => b.commission - a.commission);

    return {
      date: targetDate,
      dateStr: dateStr,
      recordCount: data.length,
      ...summary
    };
  }

  /**
   * 베스트셀러 리포트 생성
   */
  generateBestSellersReport(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = this.getDataByDateRange(startDate, endDate);

    // 상품별 집계
    const productMap = new Map();

    data.forEach(row => {
      const key = row.productId || row.productName;
      if (key) {
        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: row.productId,
            productName: row.productName,
            clicks: 0,
            orders: 0,
            revenue: 0,
            commission: 0
          });
        }
        const product = productMap.get(key);
        product.clicks += row.clicks;
        product.orders += row.orders;
        product.revenue += row.revenue;
        product.commission += row.commission;
      }
    });

    // 주문수 기준 정렬
    const bestSellers = Array.from(productMap.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    return {
      period: `최근 ${days}일`,
      startDate,
      endDate,
      bestSellers
    };
  }

  /**
   * 주간 트렌드 리포트
   */
  generateWeeklyTrendReport() {
    const trends = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const report = this.generateDailyReport(date);
      trends.push({
        date: date,
        dateStr: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' }),
        revenue: report.totalRevenue,
        commission: report.totalCommission,
        orders: report.totalOrders,
        clicks: report.totalClicks
      });
    }

    return trends.reverse();
  }

  // ============================================
  // 리포트 출력
  // ============================================

  /**
   * 일일 리포트 출력
   */
  printDailyReport(date = null) {
    const report = this.generateDailyReport(date);

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 일일 수익 리포트                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📅 날짜: ${report.dateStr}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━ 수익 요약 ━━━━━━━━━━━━━━━━');
    console.log(`  💰 총 예상수익:  ${report.totalRevenue.toLocaleString()}원`);
    console.log(`  💵 총 수수료:    ${report.totalCommission.toLocaleString()}원`);
    console.log(`  🖱️  총 클릭수:    ${report.totalClicks.toLocaleString()}회`);
    console.log(`  📦 총 주문수:    ${report.totalOrders.toLocaleString()}건`);
    console.log('');

    if (report.totalClicks > 0) {
      const ctr = ((report.totalOrders / report.totalClicks) * 100).toFixed(2);
      const avgCommission = report.totalOrders > 0
        ? Math.round(report.totalCommission / report.totalOrders)
        : 0;
      console.log('━━━━━━━━━━━━━━━━ 전환 지표 ━━━━━━━━━━━━━━━━');
      console.log(`  📈 전환율 (CTR): ${ctr}%`);
      console.log(`  💎 건당 수수료:  ${avgCommission.toLocaleString()}원`);
      console.log('');
    }

    if (report.products.length > 0) {
      console.log('━━━━━━━━━━━━━━ 🏆 TOP 5 상품 ━━━━━━━━━━━━━━');
      report.products.slice(0, 5).forEach((product, index) => {
        const name = (product.productName || product.productId || 'Unknown').slice(0, 30);
        console.log(`  ${index + 1}. ${name}`);
        console.log(`     주문 ${product.orders}건 | 수수료 ${product.commission.toLocaleString()}원`);
      });
      console.log('');
    }

    if (report.recordCount === 0) {
      console.log('  ⚠️  해당 날짜의 데이터가 없습니다.');
      console.log('');
    }

    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * 베스트셀러 리포트 출력
   */
  printBestSellersReport(days = 7) {
    const report = this.generateBestSellersReport(days);

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                 🏆 베스트셀러 리포트                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📅 기간: ${report.period}`);
    console.log('');

    if (report.bestSellers.length === 0) {
      console.log('  ⚠️  데이터가 없습니다.');
    } else {
      console.log('━━━━━━━━ 주문수 기준 TOP 10 ━━━━━━━━');
      console.log('');

      report.bestSellers.forEach((product, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const name = (product.productName || product.productId || 'Unknown').slice(0, 35);

        console.log(`  ${medal} ${name}`);
        console.log(`     📦 ${product.orders}건 | 🖱️ ${product.clicks}회 | 💵 ${product.commission.toLocaleString()}원`);
        console.log('');
      });
    }

    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * 주간 트렌드 출력
   */
  printWeeklyTrend() {
    const trends = this.generateWeeklyTrendReport();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                   📈 주간 트렌드                               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    // 최대값 찾기 (그래프용)
    const maxCommission = Math.max(...trends.map(t => t.commission), 1);

    trends.forEach(day => {
      const barLength = Math.round((day.commission / maxCommission) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);

      console.log(`  ${day.dateStr.padEnd(12)} ${bar} ${day.commission.toLocaleString().padStart(10)}원`);
    });

    console.log('');

    // 합계
    const totalCommission = trends.reduce((sum, t) => sum + t.commission, 0);
    const totalOrders = trends.reduce((sum, t) => sum + t.orders, 0);
    const avgDaily = Math.round(totalCommission / 7);

    console.log('━━━━━━━━━━━━━━━━ 주간 합계 ━━━━━━━━━━━━━━━━');
    console.log(`  총 수수료:   ${totalCommission.toLocaleString()}원`);
    console.log(`  총 주문:     ${totalOrders.toLocaleString()}건`);
    console.log(`  일평균:      ${avgDaily.toLocaleString()}원`);
    console.log('');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * 전체 리포트 출력
   */
  async printFullReport() {
    if (!this.loaded) {
      const success = await this.loadData();
      if (!success) return;
    }

    this.printDailyReport();
    this.printBestSellersReport();
    this.printWeeklyTrend();
  }

  /**
   * 샘플 CSV 생성 (테스트용)
   */
  async createSampleCSV() {
    await this.ensureDataDir();

    const sampleData = [
      '날짜,상품ID,상품명,클릭수,주문수,예상수익,수수료',
      `${this.formatDate(this.getYesterday())},P001,삼성 갤럭시 버즈3 프로,150,12,2388000,71640`,
      `${this.formatDate(this.getYesterday())},P002,애플 에어팟 프로 2세대,200,8,2392000,71760`,
      `${this.formatDate(this.getYesterday())},P003,소니 WF-1000XM5,80,5,1895000,56850`,
      `${this.formatDate(new Date(Date.now() - 2*24*60*60*1000))},P001,삼성 갤럭시 버즈3 프로,120,10,1990000,59700`,
      `${this.formatDate(new Date(Date.now() - 2*24*60*60*1000))},P004,QCY T13 ANC,300,25,747500,22425`,
      `${this.formatDate(new Date(Date.now() - 3*24*60*60*1000))},P002,애플 에어팟 프로 2세대,180,6,1794000,53820`,
      `${this.formatDate(new Date(Date.now() - 3*24*60*60*1000))},P005,JBL 튠 760NC,90,7,559300,16779`,
    ];

    const filePath = path.join(this.dataDir, 'sample_revenue.csv');
    await fs.writeFile(filePath, sampleData.join('\n'), 'utf-8');

    console.log(`[리포트] 샘플 CSV 생성 완료: ${filePath}`);
    return filePath;
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
}

module.exports = RevenueReporter;
