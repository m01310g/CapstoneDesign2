const $newPw = document.querySelector("input[name='new-pw']");
const $newPwCheck = document.querySelector("input[name='new-pw-check']");
const $formSubmitBtn = document.querySelector("input[type='submit']");

// 새로운 비밀번호 입력 시, 버튼 비활성화
$newPw.addEventListener("input", () => {
  $newPwCheck.style.borderWidth = "1.8px";
  // 새로운 비밀번호가 비어 있으면 버튼 비활성화
  if ($newPw.value === "") {
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