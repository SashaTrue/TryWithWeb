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
function initializeSlider() {
    const sliderImages = document.getElementById('sliderImages'); // Находим контейнер с изображениями
    const images = sliderImages.querySelectorAll('img'); // Получаем все изображения
    let currentImage = 0; // Индекс текущего изображения

    // Создаем и добавляем изображения в слайдер
    images.forEach(image => {
        const src = typeof image === 'object' ? image.url : image; // Определяем источник изображения
        const img = document.createElement('img');
        img.src = src; // Устанавливаем источник
        img.alt = 'Holiday Image'; // Альтернативный текст для изображения
        img.style.width = '100%'; // Задаем ширину изображения
        img.style.flexShrink = '0'; // Не допускаем сжатия изображения
        sliderImages.appendChild(img); // Добавляем изображение в контейнер
    });

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
}

// Инициализация слайдера при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeSlider);
