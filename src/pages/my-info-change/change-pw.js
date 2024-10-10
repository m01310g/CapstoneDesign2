const $newPw = document.querySelector("input[name='new-pw']");
const $newPwCheck = document.querySelector("input[name='new-pw-check']");

$newPwCheck.addEventListener("focus", () => {
  $newPwCheck.style.outline = "none";
  if ($newPw.value !== $newPwCheck.value) {
    $newPwCheck.style.borderColor = "red";
  } else {
    $newPwCheck.style.borderColor = "green";
  }
});

$newPwCheck.addEventListener("input", () => {
  if ($newPw.value !== $newPwCheck.value) {
    $newPwCheck.style.borderColor = "red";
  } else {
    $newPwCheck.style.borderColor = "green";
  }
});