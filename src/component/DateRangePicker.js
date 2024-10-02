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
        class selectedDates {
            constructor(indexNum, startDate, endDate) {
                this.index = indexNum;
                this.startDate = startDate;
                this.endDate = endDate;
            }
        }

        try {
            const startDate = start.format("YYYY년 MM월 DD일 HH시 mm분");
            const endDate = end.format("YYYY년 MM월 DD일 HH시 mm분");

            const selectedDatesObj = localStorage.getItem("selectedDates") ? JSON.parse(localStorage.getItem("selectedDates")) : [];
            const index = selectedDatesObj.length;

            let instance = new selectedDates(
                index,
                startDate,
                endDate
            );

            selectedDatesObj.push(instance);

            localStorage.setItem("selectedDates", JSON.stringify(selectedDatesObj));
        } catch(err) {
            alert(err.message);
            console.log(err);
        }
    });
});