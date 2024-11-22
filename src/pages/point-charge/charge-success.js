const $chargedPoint = document.querySelector("#point");

// 페이지 로드 시 세션 데이터를 요청
window.onload = function() {
  fetch('/api/session/user-info') // API 엔드포인트에 요청
    .then(response => response.json())
    .then(data => {
      $chargedPoint.textContent = `${data.userPoint}`;
    })
    .catch(error => console.error('Error fetching session data:', error));
};

document.querySelector("#next-btn").addEventListener("click", () => {
  window.location.href = "/home";
});