document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', sendRequest);
})

async function sendRequest() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const url = `http://5.165.236.244:9999/api/login`;
    // const headers = {
    //   'Contetnt-Type': 'application/json',
    //   Set
    // }

    let request = await axios.post(url,
        {
          username: emailField.value,
          password: passwordField.value,
        }
      )
      .then(function (response) {
        // обработка успешного запроса
        //showMessage(response.data.message); 
        
        //console.log(document.cookie);
        window.location.replace(`./index.html?session_id=${encodeURIComponent(response.data.session_id)}`);
      })
      .catch(function (error) {
        // обработка ошибки
        showMessage(error.response.data.message);
        emailField.classList.toggle('is-invalid', true);
        passwordField.classList.toggle('is-invalid', true);
      });
    //console.log(request)
}

function showMessage(message) {
    console.log(message);
}