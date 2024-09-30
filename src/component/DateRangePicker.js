$(function() {
    $('#date-picker').daterangepicker({
        "locale": {
            "format": "YYYY년 MM월 DD일 HH시 mm분",
            "separator": " ~ ",
            "applyLabel": "확인",
            "cancelLabel": "취소",
            "fromLabel": "",
            "toLabel": "",
            "customRangeLabel": "Custom",
            "weekLabel": "W",
            "daysOfWeek": ["일", "월", "화", "수", "목", "금", "토"],
            "monthNames": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월","10월", "11월", "12월"],
            "firstDay": 1
        },
        "startDate": new Date(),
        "endDate": new Date(),
        "minDate": new Date(),
        "drops": "auto",
        timePicker: true
    }, function(start, end) {
        localStorage.setItem('startDate', start.format('YYYY년 MM월 DD일 HH시 mm분'));
        localStorage.setItem('endDate', end.format('YYYY년 MM월 DD일 HH시 mm분'));
    });
});