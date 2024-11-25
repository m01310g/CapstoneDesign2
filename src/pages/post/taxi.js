const dept = document.querySelector("#departure");
const dest = document.querySelector("#destination");
const iframe = document.querySelector("iframe");

window.onload = () => {
    updateOptions();
    updateIframeSrc();
};

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
};

const updateIframeSrc = () => {
    let iframeSrc = `/post/list?category=taxi&subCategory=${encodeURIComponent("전체")}`;
    if (dept.value !== "none") {
        iframeSrc = iframeSrc + `&departure=${encodeURIComponent(dept.value)}`;
    }
    if (dest.value !== "none") {
        iframeSrc = iframeSrc + `&destination=${encodeURIComponent(dest.value)}`;
    }
    iframe.src = iframeSrc;
};

const updateOptions = () => {
    const departureValue = dept.value;
    
    dept.innerHTML = `<option value="none" selected>출발지 전체</option>`;

    options.departure.forEach(option => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.text = option.text;
        dept.appendChild(optElement);
    });

    if (departureValue) {
        dept.value = departureValue;
    }

    dest.innerHTML = `<option value="none" selected>도착지 전체</option>`;

    if (departureValue === "기흥역") {
        options.destination.forEach(option => {
            if (option.value !== "기흥역") {
                const optElement = document.createElement("option");
                optElement.value = option.value;
                optElement.text = option.text;
                dest.appendChild(optElement);
            }
        });
    } else if (["3공학관", "기숙사", "채플관"].includes(departureValue)) {
        const optElement = document.createElement("option");
        optElement.value = "기흥역";
        optElement.text = "기흥역";
        optElement.selected = true;
        dest.appendChild(optElement);
    } else {
        options.departure.forEach(option => {
            const optElement = document.createElement("option");
            optElement.value = option.value;
            optElement.text = option.text;
            dest.appendChild(optElement);
        });
    }
};

document.querySelector('.btn-close').addEventListener('click', () => {
    document.querySelector('.announcement').classList.add('hidden');
});

dept.addEventListener("change", updateOptions);
dept.addEventListener("change", updateIframeSrc);
dest.addEventListener("change", updateIframeSrc);