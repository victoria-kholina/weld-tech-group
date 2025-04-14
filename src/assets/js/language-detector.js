// Список поддерживаемых языков
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'ua', 'ru', 'cz', 'es'];

// Функция для определения предпочтительного языка
function getPreferredLanguage() {
    // Проверяем, есть ли сохраненный язык в localStorage
    
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
    }

    // Получаем язык из navigator.language или navigator.languages
    const browserLanguage = navigator.language || navigator.languages[0];
    
    // Оставляем только код языка (без региона)
    const languageCode = browserLanguage.split('-')[0].toLowerCase();
    
    // Проверяем, поддерживается ли язык
    if (supportedLanguages.includes(languageCode)) {
        return languageCode;
    }
    
    // Если язык не поддерживается, возвращаем язык по умолчанию (польский)
    return 'pl';
}

// Функция для получения текущего языка из URL
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    const pathLang = currentPath.split('/')[1];
    return supportedLanguages.includes(pathLang) ? pathLang : getPreferredLanguage();
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
    
    if (isRootPath || !hasLanguagePrefix) {
        const preferredLanguage = getPreferredLanguage();
        // Сохраняем выбранный язык
        localStorage.setItem('preferredLanguage', preferredLanguage);
        
        // Определяем путь для перенаправления
        let redirectPath = `/${preferredLanguage}`;
        if (currentPath !== '/' && currentPath !== '/index.html') {
            // Если мы не на корневой странице, сохраняем текущий путь
            redirectPath += currentPath;
        } else {
            // Если на корневой странице, добавляем index.html
            redirectPath += '/index.html';
        }
        
        // Перенаправляем на соответствующую страницу
        window.location.href = redirectPath;
    }
}

// Экспортируем функции для использования в других модулях
export { getPreferredLanguage, getCurrentLanguage, redirectToLanguage };

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', redirectToLanguage); 