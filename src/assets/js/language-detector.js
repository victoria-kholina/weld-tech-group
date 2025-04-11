// Список поддерживаемых языков
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'ua', 'ru', 'cz', 'es'];

// Функция для определения предпочтительного языка
function getPreferredLanguage() {
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

// Функция для перенаправления на соответствующую версию
function redirectToLanguage() {
    // Проверяем, не находимся ли мы уже на языковой версии
    const currentPath = window.location.pathname;
    const isAlreadyOnLanguageVersion = supportedLanguages.some(lang => 
        currentPath.startsWith(`/${lang}/`) || currentPath === `/${lang}`
    );
    
    if (!isAlreadyOnLanguageVersion) {
        const preferredLanguage = getPreferredLanguage();
        window.location.href = `/${preferredLanguage}/`;
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', redirectToLanguage); 