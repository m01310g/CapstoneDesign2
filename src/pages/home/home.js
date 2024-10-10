document.addEventListener('DOMContentLoaded', () => {
    const banners = document.querySelectorAll('.moving-banner .banner-item');
    let currentBannerIndex = 0;
  
    // 초기 활성화된 배너 표시
    banners[currentBannerIndex].classList.add('active');
  
    // 일정 시간마다 배너 전환하기
    setInterval(() => {
      // 현재 활성화된 배너 숨기기
      banners[currentBannerIndex].classList.remove('active');
  
      // 다음 배너로 전환
      currentBannerIndex = (currentBannerIndex + 1) % banners.length;
  
      // 새로운 배너 표시
      banners[currentBannerIndex].classList.add('active');
    }, 5000); // 3초마다 배너 전환
  });
  