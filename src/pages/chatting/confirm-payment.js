// const socket = io();

// socket.on('showPaymentConfirmation', ({ roomId }) => {
//     const confirmButton = document.createElement('button');
//     confirmButton.innerText = '확인';
//     confirmButton.classList.add('confirm-payment-btn');
//     confirmButton.addEventListener('click', () => {
//         socket.emit('confirmPayment', { roomId });
//         confirmButton.disabled = true;
//     });
//     document.querySelector('.bottom-menu').appendChild(confirmButton);
// });

// socket.on('tradeCompleted', ({ roomId }) => {
//     const systemMessage = document.createElement('div');
//     systemMessage.classList.add('message', 'system-message');
//     systemMessage.innerText = '모든 참여자가 결제 내역을 확인했습니다.';
//     document.querySelector('.chat-area').appendChild(systemMessage);
//     document.querySelector('.chat-area').scrollTop = document.querySelector('.chat-area').scrollHeight;
// });

const confirmPayment = async () => {
    const confirmButton = document.createElement('button');
    confirmButton.innerText = '확인';
    confirmButton.classList.add('confirm-btn');
    confirmButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/chat/confirm-payment',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, userId })
            });

            if (response.ok) {
                alert('결제 확인을 완료했습니다.');
            } else {
                alert('결제 확인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error confirming payment: ', error);
        }
    });
    document.querySelector('.bottom-menu').appendChild(confirmButton);
};
