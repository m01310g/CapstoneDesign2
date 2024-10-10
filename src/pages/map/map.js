const mapContainer = document.querySelector("#map");    // 지도 표시 div
let map, marker;
const departureInput = document.querySelector("#departure");
const destinationInput = document.querySelector("#destination");
const taxiPost = document.querySelector("iframe");

const confirmBtn = document.querySelector("#confirm-btn");

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
}

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
}
