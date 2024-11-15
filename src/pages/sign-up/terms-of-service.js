const $showMoreBtn = document.getElementById('show-more-btn');
const $modalContainer = document.getElementById('modal-container');
const $closeModalBtn = document.querySelector('.btn-close');
const $tosCheckbox = document.querySelector('input[type="checkbox"]');
const $nextBtn = document.getElementById('next-btn');
const $body = document.body;


// 모달 열기/닫기
$showMoreBtn.addEventListener('click', () => {
  $modalContainer.style.display = 'flex'; // 모달 열기
  // $showMoreBtn.classList.toggle('active'); // 화살표 회전
  $body.style.overflow = 'hidden'; // 모달 열 때 배경 스크롤 비활성화
});

// 모달 닫기
$closeModalBtn.addEventListener('click', () => {
  $modalContainer.style.display = 'none'; // 모달 닫기
  // $showMoreBtn.classList.remove('active'); // 화살표 원래 상태로
  $body.style.overflow = 'auto'; // 모달 닫을 때 배경 스크롤 활성화
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
  if (event.target === $modalContainer) {
    $modalContainer.style.display = 'none'; // 모달 닫기
    $showMoreBtn.classList.remove('active'); // 화살표 원래 상태로
  }
});

// 체크박스 상태가 변경될 때마다 버튼 상태 업데이트
$tosCheckbox.addEventListener('change', () => {
  if ($tosCheckbox.checked) {
    $nextBtn.disabled = false; // 체크박스가 체크되면 '다음' 버튼 활성화
  } else {
    $nextBtn.disabled = true;  // 체크박스가 체크되지 않으면 '다음' 버튼 비활성화
  }
});

$nextBtn.addEventListener("click", () => {
  window.location.href = "sign-up";
});