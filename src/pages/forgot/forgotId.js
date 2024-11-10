const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn");
const $emailAuthn = document.querySelector("input[name='forgot-id-authn']");
const $emailPre = document.querySelector("input[name='forgot-id-user-email-pre']");
const $emailPost = document.querySelector("input[name='forgot-id-user-email-post']");
// let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간

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