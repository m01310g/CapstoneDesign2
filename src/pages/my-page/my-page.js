// URL의 쿼리 파라미터에서 메시지 가져오기
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');

// 회원 정보 변경 성공 시
if (message) {
  alert(message);

  // URL에서 'message' 파라미터 제거
  urlParams.delete('message');
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  
  // 브라우저의 URL을 변경 (페이지 리로드 없음)
  window.history.replaceState({}, '', newUrl);
}

// 페이지 로드 시 세션 데이터를 요청
window.onload = function() {
  fetch('/api/session/user-info') // API 엔드포인트에 요청
    .then(response => response.json())
    .then(data => {
      // 받은 데이터로 HTML 내용 변경
      document.getElementById('user-nickname').textContent = `${data.userNickname}님 안녕하세요!`;
      document.getElementById('user-email').textContent = `${data.userEmail}`;
      document.getElementById('user-point').textContent = `${data.userPoint.toLocaleString()}${" 포인트"}`;
      // document.getElementById('penalty-count').textContent = data.userPenalty;
    })
    .catch(error => console.error('Error fetching session data:', error));
};