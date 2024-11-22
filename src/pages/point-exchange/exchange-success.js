document.addEventListener('DOMContentLoaded', async () => {
  try {
      // 서버에서 JSON 데이터를 가져옴
      const response = await fetch('/exchange-success', {
        method: 'GET',
        credentials: 'same-origin', // 세션 쿠키 포함
      });
      const data = await response.json();

      // 받은 데이터를 HTML에 삽입
      const pointElement = document.getElementById('point');
      pointElement.textContent = `${data.recentSentMoney}`; // 최근 전송한 금액을 표시

  } catch (error) {
      console.error('데이터 로드 실패:', error);
  }
});

document.querySelector("#next-btn").addEventListener("click", () => {
  window.location.href = "/home";
});
