const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn");
const $emailAuthn = document.querySelector("input[name='forgot-id-authn']");
let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간
    
$btnClose.addEventListener("click", () => {
  window.location.href = "../login/login.html";
});

// 이메일로 인증번호 전송하면 -> 인증번호 입력 창에 입력 제한 시간 출력
$btnEmailAuthn.addEventListener("click", () => {
  const authnIntervalId = setInterval(() => {
    $emailAuthn.value = `${Math.floor(authnTimer / 60)}:${String(authnTimer % 60).padStart(2, "0")}`;
    authnTimer--;
    if(authnTimer === 0) {
      clearInterval(authnIntervalId);
      $emailAuthn.value = "인증번호 만료";
    }
  }, 1000);
});