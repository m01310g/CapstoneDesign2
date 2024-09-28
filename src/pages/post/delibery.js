const posts = [
    { id: 1, title: "다이어트식 게시글", category: "다이어트식" },
    { id: 2, title: "야식 게시글", category: "야식" },
    { id: 3, title: "중식 게시글", category: "중식" },
    { id: 4, title: "양식 게시글", category: "양식" },
    { id: 5, title: "분식 게시글", category: "분식" },
    { id: 6, title: "일식 게시글", category: "일식" },
    { id: 7, title: "한식 게시글", category: "한식" },
];

const postContainer = document.getElementById('post-container');
const listItems = document.querySelectorAll('.list-member li');
const btnSelect = document.querySelector('.btn-select');

const ON_CLASS_NAME = "on";

// 게시글 필터링 함수
function filterPosts(category) {
    postContainer.innerHTML = ''; // 기존 게시글 제거
    const filteredPosts = category === "전체" 
        ? posts 
        : posts.filter(post => post.category === category);

    if (filteredPosts.length === 0) {
        postContainer.innerHTML = '<div class="delibery-post">해당 카테고리의 게시글이 없습니다.</div>';
    } else {
        filteredPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'delibery-post';
            postElement.innerText = post.title;
            postContainer.appendChild(postElement);
        });
    }
}

// 처음 페이지 로드 시 전체 게시글 보여주기
filterPosts('전체');

// 카테고리 버튼 클릭 이벤트
listItems.forEach(item => {
    item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        btnSelect.innerText = category; // 선택된 카테고리 표시
        filterPosts(category); // 게시글 필터링
        btnSelect.classList.remove(ON_CLASS_NAME);
    });
});