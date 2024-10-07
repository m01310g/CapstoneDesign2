// Wait for the DOM to load before running the script
document.addEventListener('DOMContentLoaded', function () {
    const calculatorScreen = document.querySelector('.calculator-screen');
    const keys = document.querySelectorAll('.calculator-key');
    
    let firstOperand = '';
    let secondOperand = '';
    let operator = '';
    let shouldResetScreen = false;

    // Function to update the calculator screen
    function updateScreen(value) {
        calculatorScreen.value = value;
    }

    // Function to handle digit and decimal point inputs
    function handleNumberInput(number) {
        if (shouldResetScreen) {
            updateScreen(number);
            shouldResetScreen = false;
        } else {
            calculatorScreen.value === '0'
                ? updateScreen(number)
                : updateScreen(calculatorScreen.value + number);
        }
    }

    // Function to handle operator input
    function handleOperatorInput(selectedOperator) {
        if (operator) calculate(); // Perform the calculation if operator already exists
        firstOperand = calculatorScreen.value;
        operator = selectedOperator;
        shouldResetScreen = true;
    }

    // Function to perform calculations
    function calculate() {
        if (operator === '' || shouldResetScreen) return;
        secondOperand = calculatorScreen.value;
        let result;
        switch (operator) {
            case '+':
                result = parseFloat(firstOperand) + parseFloat(secondOperand);
                break;
            case '-':
                result = parseFloat(firstOperand) - parseFloat(secondOperand);
                break;
            case '×':
                result = parseFloat(firstOperand) * parseFloat(secondOperand);
                break;
            case '÷':
                result = parseFloat(secondOperand) !== 0 ? parseFloat(firstOperand) / parseFloat(secondOperand) : 'Error';
                break;
            default:
                return;
        }
        updateScreen(result);
        operator = '';
        shouldResetScreen = true;
    }

    // Function to clear the calculator screen and reset values
    function clearCalculator() {
        firstOperand = '';
        secondOperand = '';
        operator = '';
        shouldResetScreen = false;
        updateScreen('0');
    }

    // Add event listeners to each calculator button
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.textContent;
            if (!isNaN(keyValue) || keyValue === '.' || keyValue === '00' || keyValue === '000') {
                handleNumberInput(keyValue);
            } else if (keyValue === '=') {
                calculate();
            } else if (keyValue === 'C') {
                clearCalculator();
            } else {
                handleOperatorInput(keyValue);
            }
        });
    });

    // Initialize the calculator with a zero on the screen
    updateScreen('0');
});
