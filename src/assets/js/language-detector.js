// Список поддерживаемых языков
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es'];

// Функция для определения предпочтительного языка
function getPreferredLanguage() {
    // Проверяем, есть ли сохраненный язык в localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
    }

    // Проверяем основной язык браузера
    const browserLanguage = navigator.language;
    if (browserLanguage) {
        const languageCode = browserLanguage.split('-')[0].toLowerCase();
        if (supportedLanguages.includes(languageCode)) {
            return languageCode;
        }
    }

    // Проверяем все языки из navigator.languages
    if (navigator.languages) {
        for (const lang of navigator.languages) {
            const languageCode = lang.split('-')[0].toLowerCase();
            if (supportedLanguages.includes(languageCode)) {
                return languageCode;
            }
        }
    }
    
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
    const currentPath = window.location.pathname;
    
    // Обновляем все переключатели языка
    document.querySelectorAll('.language-switcher').forEach(switcher => {
        // Обновляем активный язык в основном переключателе
        const mainLink = switcher.querySelector('.language-switcher__link:not(.submenu .language-switcher__link)');
        if (mainLink) {
            mainLink.textContent = currentLang.toUpperCase();
            mainLink.classList.add('active');
            
            // Обновляем иконку
            const icon = mainLink.querySelector('.icon use');
            if (icon) {
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
                icon.setAttribute('xlink:href', `#${countryMap[currentLang]}`);
            }
        }

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
    
    // Если мы на корневой странице и нет сохраненного языка, делаем редирект на язык браузера
    if (isRootPath && !localStorage.getItem('preferredLanguage')) {
        const preferredLanguage = getPreferredLanguage();
        
        // Определяем путь для перенаправления
        let redirectPath = preferredLanguage === 'pl' ? '/' : `/${preferredLanguage}`;
        
        if (preferredLanguage !== 'pl') {
            redirectPath += '/index.html';
        }
        
        // Сохраняем выбранный язык
        localStorage.setItem('preferredLanguage', preferredLanguage);
        
        // Выполняем редирект
        window.location.href = redirectPath;
    } else {
        updateLanguageSwitcher();
    }
}

// Обработчик клика по языковому переключателю
function handleLanguageSwitch(event) {
    const link = event.target.closest('.language-switcher__link');
    if (!link) return;
    
    // Получаем выбранный язык из текста ссылки
    const selectedLang = link.textContent.trim().toLowerCase();
    
    // Сохраняем выбранный язык
    localStorage.setItem('preferredLanguage', selectedLang);
    
    // Определяем путь для перехода
    const pathWithoutLang = getPathWithoutLang();
    const newPath = selectedLang === 'pl' ? pathWithoutLang : `/${selectedLang}${pathWithoutLang}`;
    
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