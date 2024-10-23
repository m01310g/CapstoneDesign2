const $btnClose = document.querySelector(".btn-close");
const $emailInput = document.querySelector("input[name='forgot-pw-user-email']");
const $emailSelect = document.querySelector("select[name='forgot-pw-user-email']");

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

$btnClose.addEventListener("click", () => {
  window.location.href = "../login/login.html";
});