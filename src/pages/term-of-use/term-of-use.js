let currentSlideIndex = 0;

function nextSlide(slideNumber) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    // 현재 슬라이드 숨기기
    slides[currentSlideIndex].classList.remove('active');

    // 마지막 슬라이드면 처음으로 돌아가기
    if (currentSlideIndex === totalSlides - 1) {
        currentSlideIndex = 0; // 첫 번째 슬라이드로
    } else {
        currentSlideIndex = slideNumber; // 전달받은 슬라이드 번호로 이동
    }

    slides[currentSlideIndex].classList.add('active');
}

function restartSlides() {
    const slides = document.querySelectorAll('.slide');

    // 모든 슬라이드를 숨기고 첫 번째 슬라이드 활성화
    slides.forEach(slide => slide.classList.remove('active'));
    currentSlideIndex = 0;
    slides[currentSlideIndex].classList.add('active');
}
