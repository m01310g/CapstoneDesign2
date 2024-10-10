const subDropDown = document.querySelector('.sub-dropdown');
const categoryItems = document.querySelectorAll('.category-member li'); // 각 li 선택
const subItems = document.querySelector('.sub-member'); // 전체 목록 선택 (ul)

const categoryBtn = document.querySelector('.category-btn');
const subBtn = document.querySelector('.sub-btn');
const taxiSearch = document.querySelector('.taxi-search');
const locationInput = document.querySelector("#location");
const locatoinMapContainer = document.querySelector("#location-map");
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
            locatoinMapContainer.classList.add(HIDDEN_CLASS_NAME);
        } else {
            taxiSearch.classList.add(HIDDEN_CLASS_NAME); // 택시 검색 필드 숨기기
            updateSubCategories(selectedCategory);
            subDropDown.classList.remove(HIDDEN_CLASS_NAME); // 소분류 드롭다운 보이기
            locationInput.classList.remove(HIDDEN_CLASS_NAME);
            taxiMapContainer.classList.add(HIDDEN_CLASS_NAME);
            confirmBtn.classList.add(HIDDEN_CLASS_NAME);
            locatoinMapContainer.classList.add(HIDDEN_CLASS_NAME);

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

// 작성일 반환 함수
const recordDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = (month > 9 ? "" : 0) + month;
    day = (day > 9 ? "" : 0) + day;

    return `${year}년 ${month}월 ${day}일`;
};

class Board {
    constructor(indexNum, subjectStr, contentStr, category, subCategory, departure, destination, startDate, endDate, currentCapacity, maxCapacity, price, location) {
        this.index = indexNum;
        this.Subject = subjectStr;
        this.Content = contentStr;
        this.Category = category;
        this.SubCategory = subCategory;
        this.Departure = departure;
        this.Destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currentCapacity = currentCapacity;
        this.maxCapacity = maxCapacity;
        this.price = price;
        this.location = location;
        this.date = recordDate();
    }

    set Subject(value) {
        if (value.length === 0) throw new Error("제목을 입력해주세요.");
        this.subject = value;
    }

    set Content(value) {
        if (value.length === 0) throw new Error("내용을 입력해주세요.");
        this.content = value;
    }

    set Category(value) {
        this.category = value;
    }

    set SubCategory(value) {
        this.subCategory = value;
    }

    set Departure(value) {
        this.departure = value;
    }

    set Destination(value) {
        this.destination = value;
    }
}

const writeFrm = document.querySelector("#writeFrm");

const handleSubmit = (event) => {
    event.preventDefault();

    const subject = event.target.subject.value;
    const content = event.target.content.value;

    let departure = '';
    let destination = '';
    let loc = '';

    if (selectedCategory === '택배' || selectedCategory === "배달") {
        if (!selectedCategory) {
            alert("대분류를 선택해주세요.");
            return;
        }

        if ((selectedCategory === '택배' || selectedCategory === '배달') && !selectedSubCategory) {
            alert("소분류를 선택해주세요.");
            return;
        }
    }
    
    const selectedDatesStr = localStorage.getItem("selectedDates");
    const selectedDates = JSON.parse(selectedDatesStr) || [];
    const boardsObj = JSON.parse(localStorage.getItem("boards")) || [];
    const index = boardsObj.length;

    if (selectedDates.length === 0 || !selectedDates[index] || !selectedDates[index].startDate || !selectedDates[index].endDate) {
        alert("모집 기한을 선택헤주세요.");
        return;
    }
    
    const startDate = selectedDates[index].startDate;
    const endDate = selectedDates[index].endDate;
    const maxCapacity = event.target.capacity.value;
    const currentCapacity = 1;
    const price = event.target.price.value;

    try {
        let instance;

        // 대분류가 택시일 경우 출발지와 도착지 정보 가져오기
        if (selectedCategory === '택시') {
            if (event.target.departure && event.target.destination) {
                departure = event.target.departure.value;
                destination = event.target.destination.value;
            }

            const departureCoords = JSON.parse(localStorage.getItem("departureCoords"));
            const destinationCoords = JSON.parse(localStorage.getItem("destinationCoords"));

            if (!departure || !destination) {
                alert("출발지와 도착지를 입력해주세요.");
                return;
            }

            instance = new Board(
                boardsObj.length,
                subject,
                content,
                selectedCategory,
                "",
                { address: departure, ...departureCoords },
                { address: destination, ...destinationCoords},
                startDate,
                endDate,
                currentCapacity,
                maxCapacity,
                price
            );
        } else {
            const locationCoords = JSON.parse(localStorage.getItem("locationCoords"));

            if (event.target.location) {
                loc = event.target.location.value;
            }

            if (!loc) {
                alert("수령지를 입력해주세요.");
                return;
            }

            instance = new Board(
                boardsObj.length,
                subject,
                content,
                selectedCategory,
                selectedSubCategory,
                "",
                "",
                startDate,
                endDate,
                currentCapacity,
                maxCapacity,
                price,
                { address: loc, ...locationCoords }
            );
        }

        boardsObj.push(instance);

        // boards 저장
        const boardsStr = JSON.stringify(boardsObj);
        localStorage.setItem("boards", boardsStr);
        localStorage.removeItem("departureCoords");
        localStorage.removeItem("destinationCoords");

        if (selectedCategory === "택시") {
            location.href = `./view.html?index=${index}&category=${selectedCategory}`;
        } else {
            location.href = `./view.html?index=${index}&category=${selectedCategory}&subCategory=${selectedSubCategory}`;
        }

    } catch (err) {
        // 예외 발생 시 처리
        alert(err.message);
        console.error(err);
    }
};

writeFrm.addEventListener("submit", handleSubmit);