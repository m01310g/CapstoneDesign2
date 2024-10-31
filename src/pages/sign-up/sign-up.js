const $btnClose = document.querySelector(".btn-close");
const $btnEmailAuthn = document.querySelector("#send-authn-btn");
const $emailAuthn = document.querySelector("input[name='email-authn']");
const $userPw = document.querySelector("input[name='user-pw']");
const $userPwCheck = document.querySelector("input[name='user-pw-check']");
const $userId = document.querySelector("input[name='user-id']");
const $formSubmitBtn = document.querySelector("input[type='submit']")
// let authnTimer = 180; // 이메일 인증 번호 입력 제한 시간

document.addEventListener("DOMContentLoaded", () => {
  // 이메일 도메인 직접 입력 시
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

document.getElementById("id-availability-check").addEventListener("click", async (event) => {
  // id 중복 검사 체크
  const checkAvailableId = $userId.value;

  try {
    const response = await fetch("/sign-up/user-id-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "user-id": checkAvailableId }),
    });

    const data = await response.json();
    console.log(data.available);
    if (data.available) {
      // 사용 가능한 아이디
      $userId.style.borderWidth = "1.8px";
      $userId.style.borderColor = "green";
      $formSubmitBtn.disabled = false; // 가입 버튼 활성화
    } else {
      // 아이디 중복
      $userId.style.borderWidth = "1.8px";
      $userId.style.borderColor = "red";
      $userId.value = "";
      $userId.placeholder = "이미 존재하는 아이디입니다. 다시 입력해주세요.(6자 이상)";
      $formSubmitBtn.disabled = true; // 가입 버튼 비활성화
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
  }
});

// id 중복 검사 통과 후 input value 바꾸면 다시 제출 버튼 비활성화
$userId.addEventListener("input", () => {
  $userId.style.borderWidth = "1.8px";
  $userId.style.borderColor = "red";
  $formSubmitBtn.disabled = true; // 가입 버튼 비활성화
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

// 새로운 비밀번호 입력 시, 버튼 비활성화
$userPw.addEventListener("input", () => {
  $userPwCheck.style.borderWidth = "1.8px";
  // 새로운 비밀번호가 비어 있으면 버튼 비활성화
  if ($userPw.value === "") {
    $formSubmitBtn.disabled = true;
  } else {
    checkPasswords(); // 비밀번호 확인 함수 호출
  }
});

// 비밀번호 확인란 포커스 시 스타일 초기화
$userPwCheck.addEventListener("focus", () => {
  $userPwCheck.style.outline = "none";
});

// 비밀번호 확인 입력 시 처리
$userPwCheck.addEventListener("input", () => {
  $userPwCheck.style.borderWidth = "1.8px";
  checkPasswords(); // 비밀번호 확인 함수 호출
});

// 비밀번호 확인 함수
function checkPasswords() {
  if ($userPw.value !== $userPwCheck.value) {
    $userPwCheck.style.borderColor = "red";
    $formSubmitBtn.disabled = true; // 버튼 비활성화
  } else {
    $userPwCheck.style.borderColor = "green";
    // 두 비밀번호가 같고 새로운 비밀번호가 비어있지 않으면 버튼 활성화
    $formSubmitBtn.disabled = $userPw.value === "" ? true : false; 
  }
}

// 유저가 전화번호 입력시 자동적으로 '-'를 삽입. ex) 0101 => 010-1, 010-12345 => 010-1234-5
const insertHyphen = (t) => {
  t.value = t.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
    .replace(/(\-{1,2})$/g, "");
};

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
$btnEmailAuthn.addEventListener("click", () => {
  document.querySelector("#email-authn-container").style.display = "block";
  const authnForEmailPre = document.querySelector("#user-email").value;
  const authnForEmailPost = document.querySelector("select[name='user-email-post']").value;
  let fullEmail;
  if (authnForEmailPost === "email-typing") {
    // 직접 입력 선택 시
    fullEmail = authnForEmailPre; // authnForEmailPre 값만 사용
  } else {
    fullEmail = `${authnForEmailPre}${authnForEmailPost}`; // authnForEmailPre와 authnForEmailPost 결합
  }

  fetch('/send-authn', {
    method: 'POST', // POST 요청
    headers: {
      'Content-Type': 'application/json' // JSON 형식으로 데이터 전송
    },
    body: JSON.stringify({ email: fullEmail }) // 이메일 주소를 JSON 형식으로 변환하여 전송
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('네트워크 응답이 정상이 아닙니다.');
    }
    return response.json(); // JSON 형식으로 응답 받기
  })
  .then(data => {
    console.log('성공:', data); // 성공적으로 전송된 데이터 확인
  })
  .catch((error) => {
    console.error('문제가 발생했습니다:', error); // 에러 처리
  });
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