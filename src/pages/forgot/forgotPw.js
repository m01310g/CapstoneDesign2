const $btnClose = document.querySelector(".btn-close");
const $emailInput = document.querySelector("input[name='forgot-pw-user-email-pre']");
const $emailSelect = document.querySelector("select[name='forgot-pw-user-email-post']");

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