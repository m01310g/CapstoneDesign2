  // URL의 쿼리 파라미터에서 메시지 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const faultMessage = urlParams.get('fault_message');

  // 회원 정보 변경 실패 시
  if (faultMessage) {
    alert(faultMessage);
  }



// 유저가 전화번호 입력시 자동적으로 '-'를 삽입. ex) 0101 => 010-1, 010-12345 => 010-1234-5
const insertHyphen = (t) => {
  t.value = t.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
    .replace(/(\-{1,2})$/g, "");
};

function execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function(data) {
      var addr = '';
      var extraAddr = '';

      if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
      } else {
          addr = data.jibunAddress;
      }

      if(data.userSelectedType === 'R'){
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraAddr += data.bname;
          }

          if(data.buildingName !== '' && data.apartment === 'Y'){
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }

          if(extraAddr !== ''){
              extraAddr = ' (' + extraAddr + ')';
          }
          document.getElementById("user-extra-address").value = extraAddr;
        
      } else {
          document.getElementById("user-extra-address").value = '';
      }

      document.getElementById('user-postcode').value = data.zonecode;
      document.getElementById("user-address").value = addr;
      document.getElementById("user-detail-address").focus();
    }
  }).open();
}