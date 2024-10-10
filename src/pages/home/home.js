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
  const switchBanner = (newIndex) => {
      // 현재 활성화된 배너 숨기기
      banners[currentBannerIndex].classList.remove('active');
      dots[currentBannerIndex].classList.remove('active');

      // 새로운 인덱스로 배너 전환
      currentBannerIndex = newIndex;

      // 새로운 배너 표시
      banners[currentBannerIndex].classList.add('active');
      dots[currentBannerIndex].classList.add('active');
  };

  // 자동으로 배너 전환
  setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      switchBanner(nextIndex);
  }, 5000); // 5초마다 배너 전환

  // 인디케이터 점을 클릭할 때 해당 배너로 전환
  dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
          switchBanner(index); // 클릭한 인덱스로 배너 전환
      });
  });
});
