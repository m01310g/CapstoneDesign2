const modifyFrm = document.querySelector("#modifyFrm");
const categoryBtn = document.querySelector(".category-btn");
const subBtn = document.querySelector(".sub-btn");
const deptInput = document.querySelector("#departure");
const destInput = document.querySelector("#destination");
const subjectInput = document.querySelector("input[name='subject']");
const contentTextarea = document.querySelector("textarea[name='content']");
const locationInput = document.querySelector("#location");
const priceInput = document.querySelector("#price");
const locationContainer = document.querySelector("#location-map");
const taxiMapContainer = document.querySelector("#map");

const subDropDown = document.querySelector(".sub-dropdown");
const categoryItems = document.querySelectorAll(".category-member li");
const subItems = document.querySelector(".sub-member");
const taxiSearch = document.querySelector('.taxi-search');
const maxCapacity = document.querySelector("#capacity");

const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("index"));

const backIcon = document.querySelector("#back-icon");

const subCategories = {
    '택배': ['건강식품', '문구ㆍ도서', '반려동물용품', '생활용품', '식품', '의류', '화장품'],
    '배달': ['다이어트식', '분식', '야식', '양식', '일식', '중식', '한식']
};

const HIDDEN_CLASS_NAME = "hidden";
const ON_CLASS_NAME = "on";

backIcon.addEventListener("click", () => {
    window.history.back();
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
        } else {
            taxiSearch.classList.add(HIDDEN_CLASS_NAME); // 택시 검색 필드 숨기기
            updateSubCategories(selectedCategory);
            subDropDown.classList.remove(HIDDEN_CLASS_NAME); // 소분류 드롭다운 보이기
        }

        // 모든 카테고리 항목의 'on' 클래스 제거
        categoryItems.forEach(i => i.classList.remove(ON_CLASS_NAME));
        item.classList.add(ON_CLASS_NAME); // 클릭한 항목에 'on' 클래스 추가
    
        // 소분류 버튼 텍스트 초기화
        subBtn.innerText = '소분류 선택';
    });
});

subItems.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        selectedSubCategory = event.target.textContent;
        subBtn.innerText = selectedSubCategory;
        subBtn.classList.remove(ON_CLASS_NAME); // 소분류 목록 숨기기
    }
});

let originalStartDate, originalEndDate;
let selectedCategory, selectedSubCategory;
let originalDepartureCoords, originalDestinationCoords, originalLocationCoords;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`/api/post/view/${index}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        categoryBtn.innerText = data.category;
        subjectInput.value = data.title;
        contentTextarea.innerText = data.content;
        maxCapacity.value = data.max_capacity;
        priceInput.value = parseInt(data.price, 10).toLocaleString();

        originalStartDate = data.start_date;
        originalEndDate = data.end_date;

        selectedCategory = data.category;
        selectedSubCategory = data.sub_category;    

        if (selectedCategory === "택시") {
            deptInput.classList.remove(HIDDEN_CLASS_NAME);
            destInput.classList.remove(HIDDEN_CLASS_NAME);
            locationInput.classList.add(HIDDEN_CLASS_NAME);
            deptInput.value = data.departure.replace(/"/g,"");
            destInput.value = data.destination.replace(/"/g,"");
            subDropDown.classList.add(HIDDEN_CLASS_NAME);
            document.querySelector(".taxi-search").classList.remove(HIDDEN_CLASS_NAME);
        } else if (selectedCategory === "배달" || data.category === "택배") {
            updateSubCategories(data.category);
            subDropDown.classList.remove(HIDDEN_CLASS_NAME);
            subBtn.innerText = data.sub_category || "소분류 선택";
            deptInput.classList.add(HIDDEN_CLASS_NAME);
            destInput.classList.add(HIDDEN_CLASS_NAME);
            locationInput.classList.remove(HIDDEN_CLASS_NAME);
            locationInput.value = data.location.replace(/"/g,"");
        }

        $("#date-picker").daterangepicker({
            startDate: data.start_date,
            endDate: data.end_date,
            timePicker: true,
            locale: {
                format: "YYYY년 MM월 DD일 HH시 mm분"
            }
        });
    } catch (error) {
        console.error("Fetch Error: ", error);
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

const options = {
    "departure": [
        { value: "3공학관",  text: "3공학관"},
        { value: "기숙사", text: "기숙사"},
        { value: "기흥역", text: "기흥역" },
        { value: "채플관", text: "채플관" },
    ],
    "destination": [
        { value: "3공학관",  text: "3공학관"},
        { value: "기숙사", text: "기숙사"},
        { value: "기흥역", text: "기흥역" },
        { value: "채플관", text: "채플관" },
    ]
}

const updateOptions = () => {
    const departureValue = deptInput.value;
    
    deptInput.innerHTML = `<option value="none" selected disabled hidden>출발지 선택</option>`;

    options.departure.forEach(option => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.text = option.text;
        deptInput.appendChild(optElement);
    });

    if (departureValue) {
        deptInput.value = departureValue;
    }

    destInput.innerHTML = `<option value="none" selected disabled hidden>도착지 선택</option>`;

    if (departureValue === "기흥역") {
        options.destination.forEach(option => {
            if (option.value !== "기흥역") {
                const optElement = document.createElement("option");
                optElement.value = option.value;
                optElement.text = option.text;
                destInput.appendChild(optElement);
            }
        });
    } else if (["3공학관", "기숙사", "채플관"].includes(departureValue)) {
        const optElement = document.createElement("option");
        optElement.value = "기흥역";
        optElement.text = "기흥역";
        optElement.selected = true;
        destInput.appendChild(optElement);
    } else {
        options.departure.forEach(option => {
            const optElement = document.createElement("option");
            optElement.value = option.value;
            optElement.text = option.text;
            destInput.appendChild(optElement);
        });
    }
};

deptInput.addEventListener("change", updateOptions);
updateOptions();

// 페이지 새로고침 시 localStorage 비우기
window.addEventListener("beforeunload", () => {
    localStorage.clear();
});

// 게시물 정보 로드
const loadCurrentCapacity = async (postId) => {
    const response = await fetch(`/api/post/view/${postId}`);
    const data = await response.json();

    if (data) {
        return data.current_capacity;
    } else {
        alert(data.message || "데이터를 불러오는 데 실패했습니다.");
        return null;
    }
};

// 수정 폼 제출 이벤트 함수
const handleModify = async (event) => {
    event.preventDefault();

    const userInfo = await fetchUserInfo();
    if (!userInfo) {
        alert('로그인 정보가 없습니다. 로그인 해주세요.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const postId = parseInt(params.get("index"));
    const currentCapacity = await loadCurrentCapacity(postId);

    const subject = event.target.subject.value;
    const content = event.target.content.value;
    const maxCapacity = event.target.capacity.value;
    const price = parseInt(event.target.price.value.replace(/,/g, ''), 10);

    // localStorage에 저장된 날짜가 있는지 확인 -> 없을 경우 데이터베이스에서 불러온 값 사용
    const selectedDatesStr = localStorage.getItem("selectedDates");
    const selectedDates = selectedDatesStr ? JSON.parse(selectedDatesStr) || [] : null;

    const startDate = selectedDates ? selectedDates[selectedDates.length - 1].startDate : originalStartDate;
    const endDate = selectedDates ? selectedDates[selectedDates.length - 1].endDate : originalEndDate;

    const departure = selectedCategory === "택시" ? event.target.departure.value : null;
    const destination = selectedCategory === "택시" ? event.target.destination.value : null;
    const loc = selectedCategory !== "택시" ? event.target.location.value : null;
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
        if (departure === "none" || destination === "none") {
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

    if (currentCapacity > maxCapacity) {
        alert("현재 인원이 모집 인원보다 많을 수 없습니다. 다시 입력해주세요.");
        return;
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
        maxCapacity,
        user_id: loggedInUserId
    };

    try {
        const response = await fetch(`/api/post/modify/${index}`,{
            method: 'PUT',
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

modifyFrm.addEventListener("submit", handleModify);

categoryBtn.addEventListener("click", () => {
    categoryBtn.classList.toggle(ON_CLASS_NAME);
});

subBtn.addEventListener("click", () => {
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