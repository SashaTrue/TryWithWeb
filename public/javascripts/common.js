// Функция для получения данных пользователя
async function getUserData() {
    const response = await fetch('/user'); // Запрос на получение данных пользователя
    const data = await response.json(); // Преобразуем ответ в JSON

    const authBtn = document.getElementById('auth-btn'); // Находим кнопку аутентификации
    if (data.username) {
        // Если пользователь авторизован, отображаем никнейм и аватарку
        authBtn.innerHTML = `
      <img src="${data.avatar_url}" alt="Avatar" class="avatar">
      ${data.username} (Выход)
    `;
        authBtn.href = '/logout'; // Ссылка для выхода
    } else {
        // Если не авторизован, показываем кнопку для входа
        authBtn.textContent = 'Войти через GitHub';
        authBtn.href = '/auth/github'; // Ссылка для авторизации
    }
}

// Вызов функции при загрузке страницы
document.addEventListener('DOMContentLoaded', getUserData);

// Функция для отображения подробной информации о празднике
function showHolidayDetails(holidayId) {
    window.location.href = `/holiday-details?id=${holidayId}`; // Перенаправляем на страницу с деталями праздника
}

// Функция для инициализации слайдера изображений
// Функция для инициализации слайдера изображений
function initializeSlider() {
    const sliderImages = document.getElementById('sliderImages'); // Находим контейнер с изображениями
    const images = sliderImages.querySelectorAll('img'); // Получаем все изображения
    let currentImage = 0; // Индекс текущего изображения

    // Настройка стилей контейнера слайдера
    sliderImages.style.display = 'flex';
    sliderImages.style.transition = 'transform 0.3s ease'; // Плавное перемещение

    // Функция для обновления слайдера
    function updateSlider() {
        sliderImages.style.transform = `translateX(-${currentImage * 100}%)`; // Перемещаем слайдер
    }

    // Обработчик для стрелки влево
    document.querySelector('.slider-arrow.left').addEventListener('click', () => {
        currentImage = (currentImage - 1 + images.length) % images.length; // Переход к предыдущему изображению
        updateSlider(); // Обновляем слайдер
    });

    // Обработчик для стрелки вправо
    document.querySelector('.slider-arrow.right').addEventListener('click', () => {
        currentImage = (currentImage + 1) % images.length; // Переход к следующему изображению
        updateSlider(); // Обновляем слайдер
    });

    // Изначально отобразим первое изображение
    updateSlider();
}

// Инициализация слайдера при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeSlider);

// Инициализация слайдера при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeSlider);

async function submitForm(event) {
    event.preventDefault();

    const form = document.getElementById('addHolidayForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/add-holiday', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Праздник успешно добавлен!');
                window.location.href = '/';
            } else {
                alert(`Ошибка при сохранении: ${result.message}`);
            }
        } else {
            const error = await response.json();
            alert(`Ошибка при сохранении: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при сохранении праздника');
    }
}
