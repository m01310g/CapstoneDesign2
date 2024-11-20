const menuItems = document.querySelectorAll('.menu-item');
const listFrame = document.querySelector("iframe");
let userId;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // userId를 가져오는 API 호출
    const response = await fetch('/api/session/user-id');
    const data = await response.json();

    if (response.ok) {
        userId = data.userId; // userId 할당
        // console.log("User ID:", userId);

        // iframe의 src에 userId 추가
        listFrame.src = `/post/list?category=taxi&userId=${userId}`;
    } else {
        console.error("Failed to fetch userId:", data.message);
    }
} catch (error) {
    console.error("Error fetching userId:", error);
}
})

// 메뉴 클릭 이벤트
menuItems.forEach((item) => {
    item.addEventListener('click', async () => {
        // 메뉴 활성화 표시
        menuItems.forEach((btn) => btn.classList.remove('active'));
        item.classList.add('active');

        // 카테고리 가져오기
        const category = item.getAttribute('data-category');

        listFrame.src = `/post/list?category=${category}&userId=${userId}`;
    });
});
