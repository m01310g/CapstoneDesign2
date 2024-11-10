// URL의 쿼리 파라미터에서 메시지 가져오기
const urlParams = new URLSearchParams(window.location.search);
const faultMessage = urlParams.get('fault_message');
// 회원 정보 변경 실패 시
if (faultMessage) {
  alert(faultMessage);
}

let nickNameCondition = true;
let telCondition = true;
const $userNickname = document.querySelector("input[name='user-nickname']");
const $formSubmitBtn = document.querySelector("input[type='submit']");

// 유저가 전화번호 입력시 자동적으로 '-'를 삽입. ex) 0101 => 010-1, 010-12345 => 010-1234-5
const insertHyphen = (t) => {
  t.value = t.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
    .replace(/(\-{1,2})$/g, "");
};

document.getElementById("nickname-availability-check").addEventListener("click", async (event) => {
  // 닉네임 중복 검사 체크
  const checkAvailableNickname = $userNickname.value;

  try {
    const response = await fetch("/sign-up/user-nickname-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "user-nickname": checkAvailableNickname }),
    });

    const data = await response.json();
    // console.log(data.available);
    if (data.available) {
      // 사용 가능한 닉네임
      $userNickname.style.borderWidth = "1.8px";
      $userNickname.style.borderColor = "green";
      $formSubmitBtn.disabled = false; // 가입 버튼 활성화
    } else {
      // 닉네임 중복
      $userNickname.style.borderWidth = "1.8px";
      $userNickname.style.borderColor = "red";
      $userNickname.value = "";
      $userNickname.placeholder = "이미 존재하는 닉네임입니다. 다시 입력해주세요.";
      $formSubmitBtn.disabled = true; // 가입 버튼 비활성화
    }
  } catch (error) {
    console.error("Error checking nickname availability:", error);
  }
});

// 닉네임 중복 검사 통과 후 input value 바꾸면 다시 제출 버튼 비활성화
$userNickname.addEventListener("input", () => {
  $userNickname.style.borderWidth = "1.8px";
  $userNickname.style.borderColor = "red";
  $formSubmitBtn.disabled = true; // 가입 버튼 비활성화
  if ($userNickname.value === "") {
    $formSubmitBtn.disabled = false; // 닉네임을 아무것도 입력x(기존 닉네임 사용)
    $userNickname.style.borderWidth = "1px";
    $userNickname.style.borderColor = "rgb(62, 62, 62)";
    $userNickname.style.placeholder = "";
  }
});