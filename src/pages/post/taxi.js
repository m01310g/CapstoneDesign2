const dept = document.querySelector("#departure");
const dest = document.querySelector("#destination");

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
    const departureValue = dept.value;
    
    dept.innerHTML = `<option value="none" selected disabled hidden>출발지 선택</option>`;

    options.departure.forEach(option => {
        const optElement = document.createElement("option");
        optElement.value = option.value;
        optElement.text = option.text;
        dept.appendChild(optElement);
    });

    if (departureValue) {
        dept.value = departureValue;
    }

    dest.innerHTML = `<option value="none" selected disabled hidden>도착지 선택</option>`;

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

dept.addEventListener("change", updateOptions);
updateOptions();