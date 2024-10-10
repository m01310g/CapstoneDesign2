const taxiMap = document.querySelector("#map");    // 지도 표시 div
// let map, marker;
let departureMap, destinationMap, locationMap;
let departureMarker, destinationMarker, locationMarker;
let selectedField = ""; // 출발지/도착지 필드 선택 여부 확인

const departureInput = document.querySelector("#departure");
const destinationInput = document.querySelector("#destination");
const locationValue = document.querySelector("#location");
const locationMapConatainer = document.querySelector("#location-map");

const taxiConfirm = document.querySelector("#confirm-btn");

let isDragging = false;

const HIDDEN_CLASS_NAME_MAP = "hidden";

const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

window.onload = function() {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=8ad1ff2123df52c86b9eb96675331a8b&libraries=services&autoload=false`;
    script.type = "text/javascript";
    document.head.append(script);

    
    script.onload = function() {
        console.log("Kakao Maps SDK loaded successfully");

        window.kakao.maps.load(() => {
            if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
                console.error("Kakao Maps SDK is not loaded properly");
                return;
            }

            getCurrentPosition()
            .then(position => {
                const latlng = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                initMap(latlng, taxiMap);
                initMap(latlng, locationMapConatainer, true);
            })
            .catch(err => {
                console.error("Unable to retrieve your location: ", err);
                // 기본 위치로 초기화(서울 중심)
                const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
                initMap(defualtLatLng, taxiMap);
                initMap(defualtLatLng, locationMapConatainer, true);
            });
        });
    }
}

// 지도 초기화
function initMap(latlng, container, isLocationMap = false) {
    if (!latlng) {
        console.error("Latitude and Longitude must be provided.");
        return;
    }

    const options = {
        center: latlng, // 현재 위치를 중심으로 설정
        level: 2
    };

    const mapInstance = new kakao.maps.Map(container, options);
    const markerInstance = new kakao.maps.Marker({
        position: latlng,
        map: mapInstance
    });

    mapInstance.relayout();

    if (container === taxiMap) {
        departureMap = mapInstance;
        departureMarker = markerInstance;
    } else if (container === locatoinMapContainer) {
        locationMap = mapInstance;
        locationMarker = markerInstance;
    } else {
        destinationMap = mapInstance;
        destinationMarker = markerInstance;
    }

    // // 만약 map이 정의되지 않았다면 초기화하지 않음
    // if (map) {
    //     console.error("Map is not initialized yet.");
    //     return;
    // }    

    // map = new kakao.maps.Map(container, options);

    // map.relayout();

    // marker = new kakao.maps.Marker({
    //     position: latlng,
    //     map: container
    // });

    const center = mapInstance.getCenter();
    markerInstance.setPosition(center);

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(mapInstance, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        markerInstance.setPosition(latlng);
    });

    kakao.maps.event.addListener(mapInstance, "drag", () => {
        const center = mapInstance.getCenter();
        markerInstance.setPosition(center);
    });

    kakao.maps.event.addListener(mapInstance, "dragstart", () => {
        isDragging = true;
        taxiConfirm.classList.add(HIDDEN_CLASS_NAME_MAP);
    });

    kakao.maps.event.addListener(mapInstance, "dragend", () => {
        isDragging = false;
        taxiConfirm.classList.remove(HIDDEN_CLASS_NAME_MAP);
    })

    taxiConfirm.addEventListener("click", () => {
        const position = markerInstance.getPosition();
        // 좌표 -> 주소 변환 및 input에 주소 삽입
        searchAddress(position);

        const lat = position.getLat();
        const lng = position.getLng();

        const coords = JSON.stringify({ lat, lng });

        if (selectedField === "departure") {
            localStorage.setItem("departureCoords", coords);
        } else if (selectedField === "destination") {
            localStorage.setItem("destinationCoords", coords);
        } else if (selectedField === "location") {
            localStorage.setItem("locationCoords", coords);
        }
    });
}

// 좌표 -> 주소 변환 함수
function searchAddress(latlng) {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            console.log(result);
            const address = result[0].road_address ? result[0].road_address.building_name : result[0].address.address_name;

            console.log(address);
            // 선택한 input 필드에 주소 입력
            if (selectedField === "departure") {
                departureInput.value = address;
            } else if (selectedField === "destination") {
                destinationInput.value = address;
            } else if (selectedField === "location") {
                locationValue.value = address;
            }

            // 주소 선택 후 지도 숨기기
            taxiMap.classList.add(HIDDEN_CLASS_NAME_MAP);
            locationMapConatainer.classList.add(HIDDEN_CLASS_NAME_MAP);
            taxiConfirm.classList.add(HIDDEN_CLASS_NAME_MAP);
        } else {
            console.error("주소 변환 실패: ", status);
        }
    });
}

// 출발지 input 클릭 시 지도 표시
departureInput.addEventListener("click", () => {
    selectedField = "departure";
    taxiConfirm.innerText = "출발지 선택"
    taxiMap.classList.toggle(HIDDEN_CLASS_NAME_MAP);   // 지도 표시
    taxiConfirm.classList.toggle(HIDDEN_CLASS_NAME_MAP);

    taxiConfirm.style.top = "30%";

    if (!departureMap) {
        // map이 초기화되지 않으면 기본 위치로 초기화
        const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
        initMap(defualtLatLng, taxiMap);
    } else {
        departureMap.relayout();
    }
});

// 도착지 input 클릭 시 지도 표시
destinationInput.addEventListener("click", () => {
    selectedField = "destination";
    taxiConfirm.innerText = "도착지 선택"
    taxiMap.classList.toggle(HIDDEN_CLASS_NAME_MAP);   // 지도 표시
    taxiConfirm.classList.toggle(HIDDEN_CLASS_NAME_MAP);

    taxiConfirm.style.top = "30%"

    if (!destinationMap) {
        // map이 초기화되지 않으면 기본 위치로 초기화
        const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
        initMap(defualtLatLng, taxiMap);
    } else {
        destinationMap.relayout();
    }
});

locationValue.addEventListener("click", () => {
    selectedField = "location";
    taxiConfirm.innerText = "수령지 선택";
    locationMapConatainer.classList.toggle(HIDDEN_CLASS_NAME_MAP);
    taxiConfirm.classList.toggle(HIDDEN_CLASS_NAME_MAP);

    taxiConfirm.style.top = "35%"

    if (!locationMap) {
        // map이 초기화되지 않으면 기본 위치로 초기화
        const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
        initMap(defualtLatLng, locationMapConatainer, true);
    } else {
        locationMap.relayout();
    }
})