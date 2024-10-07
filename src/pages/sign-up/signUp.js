const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn");
const $emailAuthn = document.querySelector("input[name='email-authn']");
let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간
    
$btnClose.addEventListener("click", () => {
  window.location.href = "../login/login.html";
});

// 유저가 전화번호 입력시 자동적으로 '-'를 삽입. ex) 0101 => 010-1, 010-12345 => 010-1234-5
const insertHyphen = (t) => {
  t.value = t.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
    .replace(/(\-{1,2})$/g, "");
};

// 이메일로 인증번호 전송하면 -> 인증번호 입력 창에 입력 제한 시간 출력
$btnEmailAuthn.addEventListener("click", () => {
  const authnIntervalId = setInterval(() => {
    $emailAuthn.value = `${Math.floor(authnTimer / 60)}:${authnTimer % 60}`;
    authnTimer--;
    if(authnTimer === 0) {
      clearInterval(authnIntervalId);
      $emailAuthn.value = "인증번호 만료";
    }
  }, 1000);
});