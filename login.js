document.addEventListener('DOMContentLoaded', function() {
  const submitButton = document.getElementById('submitButton');
  submitButton.addEventListener('click', sendRequest);
})

async function sendRequest() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const url = `http://5.165.236.244:9999/api/login`;

    let request = await axios.post(url,
        {
          username: emailField.value,
          password: passwordField.value,
        }
      )
      .then(function (response) {
        // обработка успешного запроса
        document.cookie = `username=${response.data.user.username};`;
        document.cookie = `real_name=${response.data.user.real_name};`;
        document.cookie = `role_id=${response.data.user.role_id};`
        document.cookie = `id=${response.data.user.id};`
        document.cookie = 'path=/';
        window.location.replace(`./index.html?session_id=${encodeURIComponent(response.data.session_id)}`);
      })
      .catch(function (error) {
        // обработка ошибки
        emailField.classList.toggle('is-invalid', true);
        passwordField.classList.toggle('is-invalid', true);
      });
    //console.log(request)
}
