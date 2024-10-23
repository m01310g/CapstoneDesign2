const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn");
const $emailAuthn = document.querySelector("input[name='email-authn']");
const $userPw = document.querySelector("input[name='user-pw']");
const $userPwCheck = document.querySelector("input[name='user-pw-check']");
const $userId = document.querySelector("input[name='user-id']");
let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간

document.addEventListener("DOMContentLoaded", () => {
  const $emailSelect = document.querySelector("select[name='user-email-post']");
  const $emailInput = document.querySelector("#user-email");

  $emailSelect.addEventListener("change", () => {
    if ($emailSelect.value === "email-typing") {
      $emailInput.value = "";
      $emailInput.placeholder = 'Ex) userEmail@mju.ac.kr';
      $emailInput.focus();
      $emailSelect.style.display = "none";
      $emailSelect.value= "";
      $emailInput.style.width = "86%";
    }
  });
});

// 회원 가입 실패 시 alert
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
const errorMessage = urlParams.get('error'); // 에러 메시지 추가
if (errorMessage) {
  alert(errorMessage);
}

$btnClose.addEventListener("click", () => {
  window.location.href = "../login/login.html";
});

// 입력 패스워드 double check
$userPwCheck.addEventListener("focus", () => {
  $userPwCheck.style.outline = "none";
  if ($userPw.value !== $userPwCheck.value) {
    $userPwCheck.style.borderColor = "red";
  } else {
    $userPwCheck.style.borderColor = "green";
  }
});

$userPwCheck.addEventListener("input", () => {
  if ($userPw.value !== $userPwCheck.value) {
    $userPwCheck.style.borderColor = "red";
  } else {
    $userPwCheck.style.borderColor = "green";
  }
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
    $emailAuthn.value = `${Math.floor(authnTimer / 60)}:${String(authnTimer % 60).padStart(2, "0")}`;
    authnTimer--;
    if(authnTimer === 0) {
      clearInterval(authnIntervalId);
      $emailAuthn.value = "인증번호 만료";
    }
  }, 1000);
});

function execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function(data) {
      var addr = '';
      var extraAddr = '';

      if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
      } else {
          addr = data.jibunAddress;
      }

      if(data.userSelectedType === 'R'){
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddr += data.bname;
          }

          if(data.buildingName !== '' && data.apartment === 'Y'){
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }

          if(extraAddr !== ''){
              extraAddr = ' (' + extraAddr + ')';
          }
          document.getElementById("user-extra-address").value = extraAddr;
        
      } else {
          document.getElementById("user-extra-address").value = '';
      }

      document.getElementById('user-postcode').value = data.zonecode;
      document.getElementById("user-address").value = addr;
      document.getElementById("user-detail-address").focus();
    }
  }).open();
}

// 아이디 제한 사항 작성할 것
// 비밀번호 제한 사항 작성할 것