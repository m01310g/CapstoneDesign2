const mapContainer = document.querySelector("#map");    // 지도 표시 div
let map, marker;
let selectedField = ""; // 출발지/도착지 필드 선택 여부 확인
const departureInput = document.querySelector("#departure");
const destinationInput = document.querySelector("#destination");
const taxiPost = document.querySelector(".list-frame");

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

window.onload = async function() {
    let KAKAO_MAP_API_KEY;
    try {
        const response = await fetch("/api/kakao-map-key");
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        KAKAO_MAP_API_KEY = data.KAKAO_MAP_API_KEY;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
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
                    initMap(latlng);
                })
                .catch(err => {
                    console.error("Unable to retrieve your location: ", err);
                    // 기본 위치로 초기화(서울 중심)
                    const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
                    initMap(defualtLatLng);
                });
            });
        }
    } catch (error) {
        console.error('There was a problem with fetching API key: ', error);
    }
};

// 지도 초기화
function initMap(latlng) {
    if (!latlng) {
        console.error("Latitude and Longitude must be provided.");
        return;
    }

    const options = {
        center: latlng, // 현재 위치를 중심으로 설정
        level: 2
    };

    // 만약 map이 정의되지 않았다면 초기화하지 않음
    if (map) {
        console.error("Map is not initialized yet.");
        return;
    }    

    map = new kakao.maps.Map(mapContainer, options);

    map.relayout();

    marker = new kakao.maps.Marker({
        position: latlng,
        map: map
    });

    const center = map.getCenter();
    marker.setPosition(center);

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(map, "click", function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
    });

    kakao.maps.event.addListener(map, "drag", function() {
        const center = map.getCenter();
        marker.setPosition(center);
    });

    kakao.maps.event.addListener(map, "dragstart", () => {
        isDragging = true;
        taxiConfirm.classList.add(HIDDEN_CLASS_NAME_MAP);
    });

    kakao.maps.event.addListener(map, "dragend", () => {
        isDragging = false;
        taxiConfirm.classList.remove(HIDDEN_CLASS_NAME_MAP);
    })

    taxiConfirm.addEventListener("click", () => {
        const position = marker.getPosition();
        // 좌표 -> 주소 변환 및 input에 주소 삽입
        searchAddress(position);

        const lat = position.getLat();
        const lng = position.getLng();

        if (selectedField === "departure") {
            localStorage.setItem("departureCoords", JSON.stringify({ lat, lng }));
        } else if (selectedField === "destination") {
            localStorage.setItem("destinationCoords", JSON.stringify({ lat, lng }));
        }
    });
}

// 좌표 -> 주소 변환 함수
function searchAddress(latlng) {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].road_address ? result[0].road_address.building_name : result[0].address.address_name;

            // 선택한 input 필드에 주소 입력
            if (selectedField === "departure") {
                departureInput.value = address;
            } else if (selectedField === "destination") {
                destinationInput.value = address;
            }

            // 주소 선택 후 지도 숨기기
            mapContainer.classList.add(HIDDEN_CLASS_NAME_MAP);
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
    mapContainer.classList.toggle(HIDDEN_CLASS_NAME_MAP);   // 지도 표시
    taxiConfirm.classList.toggle(HIDDEN_CLASS_NAME_MAP);
    // taxiPost.classList.add(HIDDEN_CLASS_NAME_MAP);
    if (taxiPost.classList.contains(HIDDEN_CLASS_NAME_MAP)) {
        taxiPost.classList.remove(HIDDEN_CLASS_NAME_MAP);
    } else {
        taxiPost.classList.add(HIDDEN_CLASS_NAME_MAP);
    }


    if (!map) {
        // map이 초기화되지 않으면 기본 위치로 초기화
        const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
        initMap(defualtLatLng);
    } else {
        map.relayout();
    }
});

// 도착지 input 클릭 시 지도 표시
destinationInput.addEventListener("click", () => {
    selectedField = "destination";
    taxiConfirm.innerText = "도착지 선택"
    mapContainer.classList.toggle(HIDDEN_CLASS_NAME_MAP);   // 지도 표시
    taxiConfirm.classList.toggle(HIDDEN_CLASS_NAME_MAP);
    // taxiPost.classList.add(HIDDEN_CLASS_NAME_MAP);
    if (taxiPost.classList.contains(HIDDEN_CLASS_NAME_MAP)) {
        taxiPost.classList.remove(HIDDEN_CLASS_NAME_MAP);
    } else {
        taxiPost.classList.add(HIDDEN_CLASS_NAME_MAP);
    }

    if (!map) {
        // map이 초기화되지 않으면 기본 위치로 초기화
        const defualtLatLng = new kakao.maps.LatLng(37.5665, 126.9780);
        initMap(defualtLatLng);
    } else {
        map.relayout();
    }
});

taxiConfirm.addEventListener("click", () => {
    taxiPost.classList.remove(HIDDEN_CLASS_NAME_MAP);
});