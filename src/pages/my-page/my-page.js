// URL의 쿼리 파라미터에서 메시지 가져오기
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');

// 회원 정보 변경 성공 시
if (message) {
  alert(message);

  // URL에서 'message' 파라미터 제거
  urlParams.delete('message');
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  
  // 브라우저의 URL을 변경 (페이지 리로드 없음)
  window.history.replaceState({}, '', newUrl);
}

// 페이지 로드 시 세션 데이터를 요청
window.onload = function() {
  fetch('/api/session/user-info') // API 엔드포인트에 요청
    .then(response => response.json())
    .then(data => {
      // 받은 데이터로 HTML 내용 변경
      document.getElementById('user-nickname').textContent = `${data.userNickname}님 안녕하세요!`;
      document.getElementById('user-email').textContent = `${data.userEmail}`;
      document.getElementById('user-point').textContent = `${data.userPoint.toLocaleString()}${" 포인트"}`;
      // document.getElementById('penalty-count').textContent = data.userPenalty;
    })
    .catch(error => console.error('Error fetching session data:', error));
};

document.querySelector(".expand-icon").addEventListener("click", () => {
  const expandedAnchor = document.querySelector("#expanded-point-anchor");
  const expandIcon = document.querySelector(".expand-icon");

  // 목록이 숨겨져 있으면 펼치고, 펼쳐져 있으면 숨기기
  if (expandedAnchor.classList.contains("hidden")) {
    expandedAnchor.classList.remove("hidden");
    
    // 아이콘 변경
    expandIcon.src = "/img/arrow-up.png";
    
    // 애니메이션 시작 (서서히 나타나게)
    expandedAnchor.style.opacity = "1";  // opacity를 1로 설정하여 나타나게 함
    expandedAnchor.style.maxHeight = "500px";  // max-height를 늘려서 높이를 확장
  } else {
    // 애니메이션 효과로 접기 (서서히 사라지게)
    expandedAnchor.style.opacity = "0";  // opacity를 0으로 설정하여 사라지게 함
    expandedAnchor.style.maxHeight = "0";  // max-height를 0으로 설정하여 목록을 접음
    
    // 아이콘 변경
    expandIcon.src = "/img/arrow-down.png";
    
    // 애니메이션 끝나고 hidden 클래스를 추가하여 목록을 완전히 숨기기
    setTimeout(() => {
      expandedAnchor.classList.add("hidden");
    }, 300);  // 0.3초 후에 hidden 클래스를 추가
  }
});
