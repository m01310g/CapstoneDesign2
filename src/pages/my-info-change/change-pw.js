const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');

// 기존 비밀번호와 불일치할 경우
if (message) {
  alert(message);

  // URL에서 'message' 파라미터 제거
  urlParams.delete('message');
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  
  // 브라우저의 URL을 변경 (페이지 리로드 없음)
  window.history.replaceState({}, '', newUrl);
}

const $newPw = document.querySelector("input[name='new-pw']");
const $newPwCheck = document.querySelector("input[name='new-pw-check']");
const $formSubmitBtn = document.querySelector("input[type='submit']");

const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,64}$/;

// 새로운 비밀번호 입력 시, 버튼 비활성화
$newPw.addEventListener("input", () => {
  $newPwCheck.style.borderWidth = "1.8px";
  if (passwordReg.test($newPw.value)) {
    $newPw.style.borderWidth = "1.8px";
    $newPw.style.borderColor = "green";
  } else {
    // 정규식 만족 못 하면
    $newPw.style.borderWidth = "1.8px";
    $newPw.style.borderColor = "red";
    $formSubmitBtn.disabled = true; // 가입 버튼 비활성화
  }

  // 새로운 비밀번호가 비어 있으면 버튼 비활성화
  if ($newPw.value === "") {
    $newPw.style.borderWidth = "1px";
    $newPw.style.borderColor = "black";
    $formSubmitBtn.disabled = true;
  } else {
    checkPasswords(); // 비밀번호 확인 함수 호출
  }
});

// 비밀번호 확인란 포커스 시 스타일 초기화
$newPwCheck.addEventListener("focus", () => {
  $newPwCheck.style.outline = "none";
});

// 비밀번호 확인 입력 시 처리
$newPwCheck.addEventListener("input", () => {
  $newPwCheck.style.borderWidth = "1.8px";
  checkPasswords(); // 비밀번호 확인 함수 호출
});

// 비밀번호 확인 함수
function checkPasswords() {
  if ($newPw.value !== $newPwCheck.value) {
    $newPwCheck.style.borderColor = "red";
    $formSubmitBtn.disabled = true; // 버튼 비활성화
  } else {
    $newPwCheck.style.borderColor = "green";
    // 두 비밀번호가 같고 새로운 비밀번호가 비어있지 않으면 버튼 활성화
    $formSubmitBtn.disabled = $newPw.value === "" ? true : false; 
  }
}

document.querySelector("#change-pw-form").addEventListener("submit", (event) => {
  if ($newPwCheck.style.borderColor === "red" || $newPw.style.borderColor === "red") {
    alert("비밀번호 변경에 실패했습니다.\n양식에 맞춰 다시 진행해 주세요.");
    event.preventDefault();
    location.reload(); // 페이지 리로드
    return;
  }
});