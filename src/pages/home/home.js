const menuItems = document.querySelectorAll('.menu-item');
const listFrame = document.querySelector("iframe");
// 초기 변수 선언
const bannerItems = document.querySelectorAll('.banner-item');
const dots = document.querySelectorAll('.indicator-dot');
let currentIndex = 0;
const intervalTime = 5000; // 5초마다 이동

document.addEventListener("DOMContentLoaded", () => {
    listFrame.src = `/post/list?category=taxi`;
})

// 메뉴 클릭 이벤트
menuItems.forEach((item) => {
    item.addEventListener('click', async () => {
        // 메뉴 활성화 표시
        menuItems.forEach((btn) => btn.classList.remove('active'));
        item.classList.add('active');

        // 카테고리 가져오기
        const category = item.getAttribute('data-category');

        listFrame.src = `/post/list?category=${category}&`;
    });
});

// 배너 업데이트 함수
const updateBanner = (index) => {
    // 모든 배너 숨김 처리 및 점 비활성화
    bannerItems.forEach((item, idx) => {
        item.classList.remove('active');
        dots[idx].classList.remove('active');
    });

    // 현재 배너와 점 활성화
    bannerItems[index].classList.add('active');
    dots[index].classList.add('active');
};

// 자동 배너 전환 함수
const nextBanner = () => {
    currentIndex = (currentIndex + 1) % bannerItems.length; // 다음 배너로 이동
    updateBanner(currentIndex);
};

// 5초마다 배너 전환
let bannerInterval = setInterval(nextBanner, intervalTime);

// 인디케이터 클릭 이벤트
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(bannerInterval); // 자동 전환 멈춤
        updateBanner(index); // 선택한 배너로 이동
        currentIndex = index; // 현재 인덱스 갱신
        bannerInterval = setInterval(nextBanner, intervalTime); // 다시 자동 전환 시작
    });
});