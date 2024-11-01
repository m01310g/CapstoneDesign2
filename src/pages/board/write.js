const subDropDown = document.querySelector('.sub-dropdown');
const categoryItems = document.querySelectorAll('.category-member li'); // 각 li 선택
const subItems = document.querySelector('.sub-member'); // 전체 목록 선택 (ul)

const categoryBtn = document.querySelector('.category-btn');
const subBtn = document.querySelector('.sub-btn');
const taxiSearch = document.querySelector('.taxi-search');
const locationInput = document.querySelector("#location");
const locationContainer = document.querySelector("#location-map");
const taxiMapContainer = document.querySelector("#map");

const taxiDeparture = document.querySelector("#departure");
const taxiDestination = document.querySelector("#destination");

const backIcon = document.querySelector("#back-icon");

const confirmBtn = document.querySelector("#confirm-btn");

let selectedCategory = '';
let selectedSubCategory = '';

const ON_CLASS_NAME = "on";
const HIDDEN_CLASS_NAME = "hidden";

const subCategories = {
    '택배': ['건강식품', '문구ㆍ도서', '반려동물용품', '생활용품', '식품', '의류', '화장품'],
    '배달': ['다이어트식', '분식', '야식', '양식', '일식', '중식', '한식']
};

// 이전 페이지로 돌아가기
backIcon.addEventListener("click", () => {
    window.history.back();
})

// 카테고리 버튼 클릭 이벤트
categoryItems.forEach(item => {
    item.addEventListener('click', (event) => {
        selectedCategory = event.target.getAttribute('data-category');
        categoryBtn.innerText = selectedCategory; // 선택된 카테고리 표시
        categoryBtn.classList.remove(ON_CLASS_NAME);

        // 택시 선택 시 출발지/목적지 검색 필드 표시
        if (selectedCategory === '택시') {
            taxiSearch.classList.remove(HIDDEN_CLASS_NAME);
            subDropDown.classList.add(HIDDEN_CLASS_NAME); // 소분류 숨기기
            locationInput.classList.add(HIDDEN_CLASS_NAME);
            taxiMapContainer.classList.add(HIDDEN_CLASS_NAME);
            confirmBtn.classList.add(HIDDEN_CLASS_NAME);
            locationContainer.classList.add(HIDDEN_CLASS_NAME);
        } else {
            taxiSearch.classList.add(HIDDEN_CLASS_NAME); // 택시 검색 필드 숨기기
            updateSubCategories(selectedCategory);
            subDropDown.classList.remove(HIDDEN_CLASS_NAME); // 소분류 드롭다운 보이기
            locationInput.classList.remove(HIDDEN_CLASS_NAME);
            taxiMapContainer.classList.add(HIDDEN_CLASS_NAME);
            confirmBtn.classList.add(HIDDEN_CLASS_NAME);
            locationContainer.classList.add(HIDDEN_CLASS_NAME);
        }

        // 모든 카테고리 항목의 'on' 클래스 제거
        categoryItems.forEach(i => i.classList.remove(ON_CLASS_NAME));
        item.classList.add(ON_CLASS_NAME); // 클릭한 항목에 'on' 클래스 추가
    
        // 소분류 버튼 텍스트 초기화
        subBtn.innerText = '소분류 선택';
    });
});

// 카테고리 선택 드롭다운 클릭 시 카테고리 목록 보여짐
categoryBtn.addEventListener("click", () => {
    categoryBtn.classList.toggle(ON_CLASS_NAME);
});

const updateSubCategories = (category) => {
    const items = subCategories[category];
    subItems.innerHTML = ''; // 이전 항목 초기화

    // 새로운 소분류 목록 생성
    items.forEach(subcategory => {
        const li = document.createElement('li');
        li.textContent = subcategory;
        subItems.appendChild(li);
    });
};

// 이벤트 위임: 두 번째 드롭다운 항목 클릭 시 이벤트 처리
subItems.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        selectedSubCategory = event.target.textContent;
        subBtn.innerText = selectedSubCategory;
        subBtn.classList.remove(ON_CLASS_NAME); // 소분류 목록 숨기기
    }
});

// 두 번째 드롭다운 버튼 클릭 시 소분류 목록 표시
subBtn.addEventListener('click', () => {
    subBtn.classList.toggle(ON_CLASS_NAME);
});

// 하나의 드롭다운만 선택될 수 있도록 설정
categoryBtn.addEventListener('click', () => {
    if (subBtn.classList.contains(ON_CLASS_NAME)) {
        subBtn.classList.remove(ON_CLASS_NAME)
    }
});

subBtn.addEventListener('click', () => {
    if (categoryBtn.classList.contains(ON_CLASS_NAME)) {
        categoryBtn.classList.remove(ON_CLASS_NAME);
    }
});

// 예상 총액 input 쉼표 추가
document.querySelector("#price").addEventListener("input", (event) => {
    const value = event.target.value.replace(/,/g, '');

    // input 창 비어 있는지 확인
    if (value === '') {
        event.target.value = '';
        return;
    }

    if (!isNaN(value)) {
        event.target.value = parseInt(value, 10).toLocaleString();
    }
});

const fetchUserInfo = async () => {
    try {
        const response = await fetch('/api/session/user-id');
        if (!response.ok) {
            console.error("Response not OK: ", response)
            alert("로그인 되어 있지 않습니다.");
            return null;
        }
        const userInfo = await response.json();
        return userInfo;
    } catch (error) {
        console.error('Error fetching user info: ', error);
        window.location.href = '/';
        return null;
    }
};

const writeFrm = document.querySelector("#writeFrm");

const handleSubmit = async (event) => {
    event.preventDefault();

    const userInfo = await fetchUserInfo();
    if (!userInfo) {
        alert('로그인 정보가 없습니다. 로그인 해주세요.');
        return;
    }

    const subject = event.target.subject.value;
    const content = event.target.content.value;
    const maxCapacity = event.target.capacity.value;
    const price = parseInt(event.target.price.value.replace(/,/g, ''), 10);
    const selectedDatesStr = localStorage.getItem("selectedDates");
    const selectedDates = JSON.parse(selectedDatesStr) || [];
    
    if (selectedDates.length === 0) {
        alert("모집 기한을 선택헤주세요.");
        return;
    }

    const startDate = selectedDates[selectedDates.length - 1].startDate;
    const endDate = selectedDates[selectedDates.length - 1].endDate;
    const currentCapacity = 1;
    const departureCoords = selectedCategory === "택시" ? JSON.parse(JSON.parse(localStorage.getItem("departureCoords"))) : null;
    const destinationCoords = selectedCategory === "택시" ? JSON.parse(JSON.parse(localStorage.getItem("destinationCoords"))) : null;
    const locationCoords = selectedCategory !== "택시" ? JSON.parse(localStorage.getItem("locationCoords")) : null;
    const departure = selectedCategory === "택시" ? JSON.stringify({ address: event.target.departure.value, ...departureCoords }) : null;
    const destination = selectedCategory === "택시" ? JSON.stringify({ address: event.target.destination.value, ...destinationCoords }) : null;
    const loc = selectedCategory !== "택시" ? JSON.stringify({ address: event.target.location.value, ...locationCoords }) : null;
    const loggedInUserId = userInfo.userId;

    if (!subject) {
        alert("제목을 작성해 주세요");
        return;
    } else if (!selectedCategory) {
        alert("대분류를 선택해 주세요.");
        return;
    } else if (!maxCapacity) {
        alert("모집 인원을 입력해 주세요.");
        return;
    } else if (!price) {
        alert("예상 총액을 입력해 주세요.");
        return;
    } else if (!content) {
        alert("내용을 입력해 주세요.");
        return;
    }

    // 대분류가 택시일 경우 출발지와 도착지 정보 가져오기
    if (selectedCategory === '택시') {
        if (!departure || !destination) {
            alert("출발지와 도착지를 선택해 주세요.");
            return;
        }
    }

    if (selectedCategory === '택배' || selectedCategory === "배달") {
        if ((selectedCategory === '택배' || selectedCategory === '배달') && !selectedSubCategory) {
            alert("소분류를 선택해 주세요.");
            return;
        } else if (!loc) {
            alert("수령지를 선택해 주세요");
            return;
        }
    }

    const postData = {
        subject,
        content,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        departure,
        destination,
        loc,
        price,
        startDate,
        endDate,
        currentCapacity,
        maxCapacity,
        user_id: loggedInUserId
    };

    // console.log(postData);

    try {
        const response = await fetch('/api/post',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success) {
                window.location.href = selectedCategory === "택시"
                ? `/post/view?index=${result.postId - 1}&category=${selectedCategory}&subCategory=전체`
                : `/post/view?index=${result.postId - 1}&category=${selectedCategory}&subCategory=${selectedSubCategory}`;
            } else {
                alert("게시물 작성 중 오류가 발생했습니다." + result.error);
            }
        } else {
            alert("서버 오류: " + response.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("네트워크 오류가 발생했습니다.");
    }
    
    localStorage.clear();
};

writeFrm.addEventListener("submit", handleSubmit);