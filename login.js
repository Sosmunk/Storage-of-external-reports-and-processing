document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', sendRequest);
})

async function sendRequest() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const url = `http://5.165.236.244:9999/api/login`

    let request = await axios.post('http://5.165.236.244:9999/api/login',
        {
          username: 'admin1',
          password: '123456'
        }
      )
      .then(function (response) {
        // обработка успешного запроса
        showMessage(response.data.message);
      })
      .catch(function (error) {
        // обработка ошибки
        showMessage(error.response.data.message);
      });
}


function showMessage(message) {
    console.log(message)
    if (message === 'Отсутствует логин или пароль') {
        const feedbackLabel = document.getElementById('feedback-label');
        feedbackLabel.textContent = message;
    }
}