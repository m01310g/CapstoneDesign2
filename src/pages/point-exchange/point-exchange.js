const exchangeButton = document.getElementById('exchangeButton');
const inputField = document.getElementById('inputField');

const formatNumberWithCommas = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

exchangeButton.addEventListener('click', () => {
    // Check if the input field is currently hidden
    if (inputField.style.display === 'none' || inputField.style.display === '') {
        inputField.style.display = 'block'; // Show the input field
        inputField.focus(); // Set focus to the input field for better user experience
        exchangeButton.textContent = '확인'; // Change button text to '확인'
    } else {
        const amount = inputField.value.replace(/,/g, '');
        if (amount) {
            const formattedAmount = formatNumberWithCommas(amount); 
            alert(`환전할 금액: ${formattedAmount}원`); 
            location.reload(); // Reload the page
        } else {
            alert('환전할 금액을 입력하세요.');
        }
    }
});
