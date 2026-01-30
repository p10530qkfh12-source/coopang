<?php
/**
 * 쿠팡 파트너스 링크 리다이렉터
 *
 * 이 파일을 워드프레스 루트 디렉토리에 업로드하세요.
 * 예: https://realize.iwinv.net/go.php
 *
 * 사용법: go.php?url=인코딩된URL
 */

// 에러 표시 끄기 (보안)
error_reporting(0);
ini_set('display_errors', 0);

// URL 파라미터 확인
if (!isset($_GET['url']) || empty($_GET['url'])) {
    // URL이 없으면 홈으로
    header('Location: /');
    exit;
}

// URL 디코딩 (rawurldecode 사용 - 데이터 유실 방지)
$url = rawurldecode($_GET['url']);

// URL 유효성 검사
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    // 유효하지 않은 URL이면 홈으로
    header('Location: /');
    exit;
}

// 허용된 도메인 목록 (쿠팡 관련)
$allowedDomains = [
    'coupang.com',
    'link.coupang.com',
    'www.coupang.com',
    'm.coupang.com',
    'coupa.ng'
];

// URL에서 호스트 추출
$parsedUrl = parse_url($url);
$host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';

// 도메인 검증
$isAllowed = false;
foreach ($allowedDomains as $domain) {
    if ($host === $domain || substr($host, -strlen('.' . $domain)) === '.' . $domain) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    // 허용되지 않은 도메인이면 홈으로
    header('Location: /');
    exit;
}

// HTTPS 강제
if (strpos($url, 'http://') === 0) {
    $url = 'https://' . substr($url, 7);
}

// 리다이렉트 실행
header('HTTP/1.1 302 Found');
header('Location: ' . $url);
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
exit;
?>
