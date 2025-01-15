// updateAuthButton.js

async function getUserData() {
    const response = await fetch('/user');
    const data = await response.json();

    const authBtn = document.getElementById('auth-btn');
    if (data.username) {
        // Меняем кнопку на никнейм и аватарку
        authBtn.innerHTML = `
      <img src="${data.avatar_url}" alt="Avatar" class="avatar">
      ${data.username} (Выход)
    `;
        authBtn.href = '/logout'; // Меняем ссылку на выход
    } else {
        authBtn.textContent = 'Войти через GitHub'; // Если не авторизован
        authBtn.href = '/auth/github'; // Ссылка на вход
    }
}

// Вызов функции при загрузке страницы
document.addEventListener('DOMContentLoaded', getUserData);

// Обработчик клика на мероприятие
function showHolidayDetails(holidayId) {
    window.location.href = `/holiday-details?id=${holidayId}`;
}