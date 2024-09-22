const chargeBtn = document.querySelector("#charge");
const exchangeBtn = document.querySelector("#exchange");

const HIDDEN_CLASSNAME = "hidden";

const taxiBtn = document.querySelector("#taxi");
const packageBtn = document.querySelector("#package");
const deliberyBtn = document.querySelector("#delibery");
const calculatorBtn = document.querySelector("#calculator");

function handleTaxi(event) {
    window.location.href = "./taxi/taxi.js";
}

function handlePackage(event) {
    window.location.href = "./package/package.js";
}

function handleDelibery(event) {
    window.location.href = "./delibery/delibery.js";
}

function handleChange(event) {
    console.log("충전 클릭");
}

function handleExchange(event) {
    console.log("환전 클릭");
}

chargeBtn.addEventListener("click", handleChange);
exchangeBtn.addEventListener("click", handleExchange);
taxiBtn.addEventListener("click", handleTaxi)
packageBtn.addEventListener("click", handlePackage);
deliberyBtn.addEventListener("click", handleDelibery);