document.addEventListener('DOMContentLoaded', () => {
  const $chargedPoint = document.querySelector("#point");

  // 페이지 로드 시 세션 데이터를 요청
  fetch('/api/session/user-info') // API 엔드포인트에 요청
    .then(response => response.json())
    .then(data => {
      if (data.sentMoney !== undefined) {
        // 서버에서 받은 sentMoney 값을 #point에 표시
        $chargedPoint.textContent = `${data.sentMoney.toLocaleString()}`;
      } else {
        console.error("sentMoney is not available in the response data");
      }
    })
    .catch(error => {
      console.error('Error fetching session data:', error);
    });

  // "확인" 버튼 클릭 시 루트로 리다이렉트
  document.querySelector("#next-btn").addEventListener("click", () => {
    window.location.href = '/';
  });
});
