var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./public/routes/index');
var holidaysRouter = require('./public/routes/holidays');
var holidayDetailsRouter = require('./public/routes/holidayMain');
var holidayByDateRouter = require('./public/routes/holidaysByDate');
var holidaysByCategoryRouter = require('./public/routes/holidaysByCategory');

var app = express();

var passport = require('passport');
var session = require('express-session');
var GitHubStrategy = require('passport-github2').Strategy;

// Настройки с использованием вашего Client ID и Client Secret
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
    // Добавляем аватар в профиль пользователя
    profile.avatar_url = profile.photos[0].value;
    return done(null, profile);
}));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Безопасный секрет для сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey', // Сделал секрет сессии более безопасным
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Роуты для авторизации через GitHub
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', function(req, res, next) {
    passport.authenticate('github', { failureRedirect: '/' }, function(err, user, info) {
        if (err) {
            return next(err); // Обработка ошибок аутентификации
        }
        if (!user) {
            return res.redirect('/'); // Если пользователь не найден, редирект на главную
        }
        req.login(user, function(err) {
            if (err) {
                return next(err); // Обработка ошибок при логине
            }
            res.redirect('/'); // После успешного логина редирект на главную
        });
    })(req, res, next);
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err); // Обработка ошибок при выходе
        }
        res.redirect('/'); // Редирект на главную после выхода
    });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/holidays', holidaysRouter);
app.use('/holiday-details', holidayDetailsRouter);
app.use('/holidays-by-date', holidayByDateRouter);
app.use('/holidays-by-category', holidaysByCategoryRouter);

// Маршрут для получения информации о текущем пользователе
app.get('/user', function(req, res) {
    if (req.user) {
        res.json({
            username: req.user.username,
            avatar_url: req.user.avatar_url // Отправляем URL аватарки
        });
    } else {
        res.json({ username: null, avatar_url: null });
    }
});

// Обработчик для всех несуществующих маршрутов (404)
app.use(function(req, res, next) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'pages/404.html'));
});

module.exports = app;
