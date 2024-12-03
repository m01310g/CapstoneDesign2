const submitInquiryForm = document.getElementById('inquiry-form');
submitInquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // 폼 제출 기본 동작을 막습니다.

    const content = document.getElementById('inquiry-text').value.trim();

    // 빈 내용 제출 방지
    if (!content) {
        alert('문의 내용을 작성해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/user/submit-inquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        const result = await response.json();

        if (result.success) {
            alert("문의 사항을 제출했습니다.")
            // 리다이렉트 URL로 이동
            window.location.href = result.redirectUrl;
        } else {
            alert('문의 사항 제출에 실패했습니다: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        alert('서버 오류가 발생했습니다.');
    }
});
