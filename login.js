document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', sendRequest);
})

async function sendRequest() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const url = `http://5.165.236.244:9999/api/login`

    let request = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            "username": "admin",
            "password": "123456",
        }
    });
    let response = await request.json();
    showMessage(response.message);
}


function showMessage(message) {
    console.log(message)
    if (message === 'Отсутствует логин или пароль') {
        const feedbackLabel = document.getElementById('feedback-label');
        feedbackLabel.textContent = message;
    }
}