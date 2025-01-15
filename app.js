// Подключение необходимых модулей
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Подключение маршрутов
var indexRouter = require('./public/routes/index');
var holidaysRouter = require('./public/routes/holidays');
var holidayDetailsRouter = require('./public/routes/holidayMain');
var holidayByDateRouter = require('./public/routes/holidaysByDate');
var holidaysByCategoryRouter = require('./public/routes/holidaysByCategory');

// Создание приложения Express
var app = express();

// Подключение библиотек для авторизации
var passport = require('passport');
var session = require('express-session');
var GitHubStrategy = require('passport-github2').Strategy;

// Настройки с использованием вашего Client ID и Client Secret для GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID, // Используется переменная окружения для безопасного хранения данных
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback' // URL для перенаправления после успешной авторизации
}, function(accessToken, refreshToken, profile, done) {
    // Добавляем аватар пользователя в профиль
    profile.avatar_url = profile.photos[0].value;
    return done(null, profile); // Завершаем процесс аутентификации
}));

// Сериализация пользователя (сохранение пользователя в сессии)
passport.serializeUser(function(user, done) {
    done(null, user);
});

// Десериализация пользователя (извлечение пользователя из сессии)
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Настройка сессий с использованием секретного ключа
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey', // Использование переменной окружения для безопасности
    resave: false,
    saveUninitialized: true
}));

// Инициализация и использование passport.js для сессий
app.use(passport.initialize());
app.use(passport.session());

// Роуты для авторизации через GitHub
app.get('/auth/github', passport.authenticate('github')); // Старт процесса аутентификации

// Обработчик для возвращения пользователя после успешной аутентификации
app.get('/auth/github/callback', function(req, res, next) {
    passport.authenticate('github', { failureRedirect: '/' }, function(err, user, info) {
        if (err) {
            return next(err); // Ошибка аутентификации
        }
        if (!user) {
            return res.redirect('/'); // Перенаправление, если пользователь не найден
        }
        req.login(user, function(err) {
            if (err) {
                return next(err); // Ошибка при логине
            }
            res.redirect('/'); // Перенаправление на главную после успешного входа
        });
    })(req, res, next);
});

// Роут для выхода из системы
app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err); // Ошибка при выходе
        }
        res.redirect('/'); // Перенаправление на главную после выхода
    });
});

// Настройка middlewares для обработки запросов
app.use(logger('dev')); // Логирование запросов
app.use(express.json()); // Для обработки JSON тела запроса
app.use(express.urlencoded({ extended: false })); // Для обработки URL-кодированных данных
app.use(cookieParser()); // Для парсинга cookie
app.use(express.static(path.join(__dirname, 'public'))); // Статические файлы

// Подключение маршрутов
app.use('/', indexRouter);
app.use('/holidays', holidaysRouter);
app.use('/holiday-details', holidayDetailsRouter);
app.use('/holidays-by-date', holidayByDateRouter);
app.use('/holidays-by-category', holidaysByCategoryRouter);

// Маршрут для получения данных о текущем пользователе
app.get('/user', function(req, res) {
    if (req.user) {
        res.json({
            username: req.user.username, // Отправляем имя пользователя
            avatar_url: req.user.avatar_url // Отправляем URL аватарки
        });
    } else {
        res.json({ username: null, avatar_url: null }); // Если пользователь не авторизован, возвращаем null
    }
});

// Обработчик для всех несуществующих маршрутов (404)
app.use(function(req, res, next) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'pages/404.html')); // Страница 404
});

// Экспорт приложения
module.exports = app;
