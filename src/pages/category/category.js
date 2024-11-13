// 페이지 로드 시 세션 데이터를 요청
window.onload = function() {
  fetch('/api/session/user-info') // API 엔드포인트에 요청
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          window.location.href = "/";
        }
        throw new Error("로그인 정보 불러오기 실패");
      }
      return response.json();
    })
    .then(data => {
      // 받은 데이터로 HTML 내용 변경
      document.querySelector("#available-point h5").textContent = `${data.userPoint.toLocaleString()}${" 포인트"}`;
    })
    .catch(error => console.error('Error fetching session data:', error));
};