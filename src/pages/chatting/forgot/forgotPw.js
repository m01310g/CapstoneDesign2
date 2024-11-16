const $btnClose = document.querySelector(".btn-close");
const $emailPre = document.querySelector("input[name='forgot-pw-user-email-pre']");
const $emailPost = document.querySelector("input[name='forgot-pw-user-email-post']");

// URL의 쿼리 파라미터에서 메시지 가져오기
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
// 메시지가 있으면 alert 표시
if (message) {
  alert(message);
}

$btnClose.addEventListener("click", () => {
  window.location.href = "/";
});