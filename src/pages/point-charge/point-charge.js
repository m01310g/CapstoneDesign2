const display = document.querySelector('#display');
const amountBtns = document.querySelectorAll('.amount');
const inputField = document.querySelector('#inputField');
const selfBtn = document.querySelector('#self');

// Function to format numbers with commas
const formatNumberWithCommas = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = btn.innerText.replace(/,/g, ''); // Remove commas from the button text if any
        const formattedAmount = formatNumberWithCommas(amount); // Format the amount with commas
        display.textContent = `충전할 금액: ${formattedAmount}원`; // Update display with formatted amount
        inputField.style.display = 'none'; // Hide input field
        selfBtn.style.display = 'block'; // Show self-input button
    });
});

selfBtn.addEventListener('click', () => {
    inputField.style.display = 'block'; // Show input field
    selfBtn.style.display = 'none'; // Hide self-input button
    display.textContent = ''; // Clear display
    inputField.focus(); // Focus on the input field
});

inputField.addEventListener('input', () => {
    const amount = inputField.value.replace(/,/g, ''); // Remove commas from the input field value if any
    const formattedAmount = formatNumberWithCommas(amount); // Format the amount with commas
    display.textContent = `충전할 금액: ${formattedAmount}원`; // Update display with formatted amount
});
