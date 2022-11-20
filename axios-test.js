async function postTest(){
    axios.post('http://5.165.236.244:9999/api/login',
        {
          username: 'admin',
          password: '123456'
        }
      )
      .then(function (response) {
        // обработка успешного запроса
        console.log(response);
      })
      .catch(function (error) {
        // обработка ошибки
        console.log(error);
      });
}

document.addEventListener('DOMContentLoaded', (event) => {
  console.log('1');
  event.preventDefault();
  const submitButton = document.getElementById('submit');
  submitButton.addEventListener('click', postTest)
});