const menuItems = document.querySelectorAll('.menu-item');
const listFrame = document.querySelector("iframe");

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
