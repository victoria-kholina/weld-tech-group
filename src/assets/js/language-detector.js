// Список поддерживаемых языков
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es'];



// Функция для определения предпочтительного языка
function getPreferredLanguage() {
    // Проверяем, есть ли сохраненный язык в localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
    }

    // Если сохраненного языка нет, определяем язык браузера
    const browserLanguage = navigator.language;
    if (browserLanguage) {
        const languageCode = browserLanguage.split('-')[0].toLowerCase();
        if (supportedLanguages.includes(languageCode)) {
            // Сохраняем язык браузера в localStorage
            localStorage.setItem('preferredLanguage', languageCode);
            return languageCode;
        }
    }

    // Если язык браузера не поддерживается, проверяем все языки из navigator.languages
    if (navigator.languages) {
        for (const lang of navigator.languages) {
            const languageCode = lang.split('-')[0].toLowerCase();
            if (supportedLanguages.includes(languageCode)) {
                // Сохраняем первый поддерживаемый язык из списка
                localStorage.setItem('preferredLanguage', languageCode);
                return languageCode;
            }
        }
    }
    
    // Если ничего не найдено, используем польский язык по умолчанию
    localStorage.setItem('preferredLanguage', 'pl');
    return 'pl';
}

// Функция для получения текущего языка из URL
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    const pathLang = currentPath.split('/')[1];
    return supportedLanguages.includes(pathLang) ? pathLang : 'pl';
}

// Функция для получения текущего пути без языкового префикса
function getPathWithoutLang() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const hasLangPrefix = supportedLanguages.includes(pathParts[1]);
    
    if (hasLangPrefix) {
        return '/' + pathParts.slice(2).join('/');
    }
    return currentPath;
}

// Функция для обновления активного языка в переключателе
function updateLanguageSwitcher() {
    const currentLang = getCurrentLanguage();

    // Обновляем все переключатели языка
    document.querySelectorAll('.language-switcher').forEach(switcher => {

        // Обновляем активный язык в основном переключателе
        let mainSwitcher = switcher.querySelector('.active-switcher');
        let activeLang = mainSwitcher.querySelector('.active-switcher-lang');
        // Обновляем текст
        activeLang.textContent = currentLang.toUpperCase();
        
        // Обновляем иконку
        const countryMap = {
            'pl': 'Poland',
            'en': 'United-Kingdom',
            'lt': 'Lithuania',
            'de': 'Germany',
            'uk': 'Ukraine',
            'ru': 'Russia',
            'cs': 'Czech-Republic',
            'es': 'Spain'
        };

        // Находим существующий SVG элемент
        const svg = mainSwitcher.querySelector('.active-switcher-icon');
        const use = svg.querySelector('use');
        use.setAttribute('xlink:href', `#${countryMap[currentLang]}`);
    

        // Обновляем ссылки в подменю
        const submenuLinks = switcher.querySelectorAll('.submenu .language-switcher__link');
        submenuLinks.forEach(link => {
            const lang = link.textContent.trim().toLowerCase();
            const pathWithoutLang = getPathWithoutLang();
            
            // Обновляем href для каждой ссылки
            if (lang === 'pl') {
                link.href = pathWithoutLang;
            } else {
                link.href = `/${lang}${pathWithoutLang}`;
            }
            
            // Скрываем текущий язык в подменю
            if (lang === currentLang) {
                link.parentElement.style.display = 'none';
            } else {
                link.parentElement.style.display = '';
            }
        });
    });
}

// Функция для перенаправления на соответствующую версию
function redirectToLanguage() {
    // Получаем текущий путь
    const currentPath = window.location.pathname;
    
    // Проверяем, находимся ли мы на корневой странице или на странице без указания языка
    const isRootPath = currentPath === '/' || currentPath === '/index.html';
    const hasLanguagePrefix = supportedLanguages.some(lang => 
        currentPath.startsWith(`/${lang}/`) || currentPath === `/${lang}`
    );
    
    // Если мы уже на странице с указанным языком, просто обновляем переключатель
    if (!isRootPath && hasLanguagePrefix) {
        updateLanguageSwitcher();
        return;
    }
    
    // Получаем предпочтительный язык
    const preferredLanguage = getPreferredLanguage();
    
    // Если предпочтительный язык - польский, просто обновляем переключатель
    if (preferredLanguage === 'pl') {
        updateLanguageSwitcher();
        return;
    }
    
    // Определяем путь для перенаправления
    let redirectPath = `/${preferredLanguage}`;
    
    // Если мы на корневой странице, добавляем index.html
    if (isRootPath) {
        redirectPath += '/index.html';
    }
    
    // Выполняем редирект
    window.location.href = redirectPath;
}

// Обработчик клика по языковому переключателю
function handleLanguageSwitch(event) {
    const link = event.target.closest('.language-switcher__link');
    if (!link) return;
    
    // Получаем выбранный язык из текста ссылки
    const selectedLang = link.textContent.trim().toLowerCase();
    
    // Сохраняем выбранный язык в localStorage
    localStorage.setItem('preferredLanguage', selectedLang);
    
    // Определяем путь для перехода
    const pathWithoutLang = getPathWithoutLang();
    let newPath;
    
    if (selectedLang === 'pl') {
        // Для польского языка проверяем, находимся ли мы на корневой странице
        if (pathWithoutLang === '/' || pathWithoutLang === '/index.html') {
            newPath = '/';
        } else {
            newPath = pathWithoutLang;
        }
    } else {
        newPath = `/${selectedLang}${pathWithoutLang}`;
    }
    
    // Переходим на новую страницу
    window.location.href = newPath;
}

// Экспортируем функции
export { getPreferredLanguage, getCurrentLanguage, redirectToLanguage };

// Вызываем функцию при загрузке страницы и при изменении URL
document.addEventListener('DOMContentLoaded', () => {
    redirectToLanguage();
    
    // Добавляем обработчик для изменений URL
    window.addEventListener('popstate', redirectToLanguage);
    
    // Добавляем обработчик клика по языковому переключателю
    document.querySelectorAll('.language-switcher').forEach(switcher => {
        switcher.addEventListener('click', handleLanguageSwitch);
    });
}); 