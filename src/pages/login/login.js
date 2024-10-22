  // URL의 쿼리 파라미터에서 메시지 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const faultMessage = urlParams.get('fault_message');

  // 메시지가 있으면 alert 표시
  if (message) {
    alert(message);
  }

  // 로그인 실패 시
  if (faultMessage) {
    alert(faultMessage);
  }
