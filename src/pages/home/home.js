document.addEventListener('DOMContentLoaded', () => {
  const banners = document.querySelectorAll('.moving-banner .banner-item');
  const bannerIndicator = document.querySelector('.banner-indicator');
  let currentBannerIndex = 0;

  // 인디케이터 점을 배너의 수만큼 생성
  banners.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator-dot');
      if (index === 0) {
          dot.classList.add('active'); // 첫 번째 배너 점 활성화
      }
      bannerIndicator.appendChild(dot);
  });

  const dots = document.querySelectorAll('.indicator-dot');

  // 초기 활성화된 배너 표시
  banners[currentBannerIndex].classList.add('active');

  // 일정 시간마다 배너 전환하기
  setInterval(() => {
      // 현재 활성화된 배너 숨기기
      banners[currentBannerIndex].classList.remove('active');
      dots[currentBannerIndex].classList.remove('active');

      // 다음 배너로 전환
      currentBannerIndex = (currentBannerIndex + 1) % banners.length;

      // 새로운 배너 표시
      banners[currentBannerIndex].classList.add('active');
      dots[currentBannerIndex].classList.add('active');
  }, 5000); // 5초마다 배너 전환
});
