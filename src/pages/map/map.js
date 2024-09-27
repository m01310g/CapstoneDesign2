function initMap() {
    var map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.3595704, 127.105399), // 기본 위치
        zoom: 10
    });

    // Geolocation API 사용
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;

            var userLocation = new naver.maps.LatLng(lat, lng);
            map.setCenter(userLocation);

            // 마커 추가
            new naver.maps.Marker({
                position: userLocation,
                map: map
            });
        }, function(error) {
            console.error('Error occurred. Error code: ' + error.code);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// 페이지가 로드될 때 initMap 함수 호출
window.onload = initMap;