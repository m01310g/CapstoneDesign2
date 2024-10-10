const modifyFrm = document.querySelector("#modifyFrm");
const categoryBtn = document.querySelector(".category-btn");
const subBtn = document.querySelector(".sub-btn");
const departureInput = document.querySelector("#departure");
const destinationInput = document.querySelector("#destination");
const subjectInput = document.querySelector("input[name='subject']");
const contentTextarea = document.querySelector("textarea[name='content']");

const subDropDown = document.querySelector(".sub-dropdown");
const categoryItems = document.querySelectorAll(".category-member li");
const subItems = document.querySelector(".sub-member");
const taxiSearch = document.querySelector('.taxi-search');
const maxCapacity = document.querySelector("#capacity");

const idxObj = location.search;
const index = location.search.split("=")[1];

const boardsObj = JSON.parse(localStorage.getItem("boards"));
const board = boardsObj[index];

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


window.onload = function() {
    categoryBtn.innerText = board.category;
    console.log(board);

    if (board.category === "택시") {
        departureInput.value = board.departure.address;
        destinationInput.value = board.destination.address;
        subDropDown.classList.add(HIDDEN_CLASS_NAME);
        document.querySelector(".taxi-search").classList.remove(HIDDEN_CLASS_NAME);
    } else {
        updateSubCategories(board.category);
        subBtn.innerText = board.subCategory || "소분류 선택";
    }

    subjectInput.value = board.subject;
    contentTextarea.value = board.content;
    maxCapacity.value = board.maxCapacity;

    $("#date-picker").daterangepicker({
        startDate: board.startDate,
        endDate: board.endDate,
        timePicker: true,
        locale: {
            format: "YYYY년 MM월 DD일 HH시 mm분"
        }
    });
}

const handleModify = (event) => {
    event.preventDefault();

    try {
        const subject = event.target.subject.value;
        const content = event.target.content.value;
        let departure = "";
        let destination = "";

        if (board.category === "택시") {
            departure = event.target.departure.value;
            destination = event.target.destination.value;

            if (!departure || !destination) {
                alert("출발지와 도착지를 입력해주세요.");
                return;
            }
        }

        const dateRange = $("#date-picker").data("daterangepicker");
        const startDate = dateRange.startDate.format("YYYY년 MM월 DD일 HH시 mm분");
        const endDate = dateRange.endDate.format("YYYY년 MM월 DD일 HH시 mm분");
        const subCategory = document.querySelector(".sub-btn").innerText;
        const category = document.querySelector(".category-btn");
        const maxCapacity = event.target.capacity.value;
        let selectedCategory = "";

        if (category.innerText === "택시") {
            selectedCategory = "taxi";
        } else if (category.innerText === "택배") {
            selectedCategory = "package";
        } else if (category.innerText === "배달") {
            selectedCategory = "delibery";
        }

        board.subject = subject;
        board.content = content;
        board.startDate = startDate;
        board.endDate = endDate;
        board.category = category.innerText;
        board.subCategory = subCategory;
        board.maxCapacity = maxCapacity;

        if (board.category === "택시") {
            board.departure = departure;
            board.destination = destination;
        }

        boardsObj[index] = board;
        localStorage.setItem("boards", JSON.stringify(boardsObj));

        location.href = "./view.html?index=" + index + "&category=" + selectedCategory + "&subCategory=" + subCategory;
    } catch(err) {
        alert(err.message);
        console.error(err);
    }
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