<?php
$url = $_GET['url'];
if (!empty($url)) {
    // 인코딩된 문자가 섞여있을 수 있으므로 안전하게 디코딩 후 리다이렉트
    header("Location: " . rawurldecode($url), true, 301);
    exit;
} else {
    echo "상품 주소가 없습니다.";
}
?>
