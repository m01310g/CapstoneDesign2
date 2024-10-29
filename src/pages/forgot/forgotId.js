const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn");
const $emailAuthn = document.querySelector("input[name='forgot-id-authn']");
const $emailInput = document.querySelector("input[name='forgot-id-user-email-pre']");
const $emailSelect = document.querySelector("select[name='forgot-id-user-email-post']");
// let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간

// URL의 쿼리 파라미터에서 메시지 가져오기
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
// 메시지가 있으면 alert 표시
if (message) {
  alert(message);
}


$emailSelect.addEventListener("change", () => {
  if ($emailSelect.value === "email-typing") {
    $emailInput.value = "";
    $emailInput.placeholder = 'Ex) userEmail@mju.ac.kr';
    $emailInput.focus();
    $emailSelect.style.display = "none";
    $emailSelect.value= "";
    $emailInput.style.width = "100%";
  }
});
    
$btnClose.addEventListener("click", () => {
  window.location.href = "../login/login.html";
});

// 이메일로 인증번호 전송하면 -> 인증번호 입력 창에 입력 제한 시간 출력
// $btnEmailAuthn.addEventListener("click", () => {
//   const authnIntervalId = setInterval(() => {
//     $emailAuthn.value = `${Math.floor(authnTimer / 60)}:${String(authnTimer % 60).padStart(2, "0")}`;
//     authnTimer--;
//     if(authnTimer === 0) {
//       clearInterval(authnIntervalId);
//       $emailAuthn.value = "인증번호 만료";
//     }
//   }, 1000);
// });
