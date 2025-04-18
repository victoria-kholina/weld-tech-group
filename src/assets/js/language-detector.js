// Список поддерживаемых языков
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es'];

// Функция для получения текущего языка из URL
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    const pathLang = currentPath.split('/')[1];
    return supportedLanguages.includes(pathLang) ? pathLang : 'en';
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
            if (lang === 'en') {
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
    
    if (selectedLang === 'en') {
        if (pathWithoutLang === '/' || pathWithoutLang === '/index.html') {
            newPath = '/';
        } else {
            newPath = pathWithoutLang;
        }
    } else {
        newPath = `/${selectedLang}${pathWithoutLang}`;
    }
    
    window.location.href = newPath;
}

// Экспортируем функции
export { getCurrentLanguage, updateLanguageSwitcher };

// Вызываем функцию при загрузке страницы и при изменении URL
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageSwitcher()
    // Добавляем обработчик клика по языковому переключателю
    document.querySelectorAll('.language-switcher').forEach(switcher => {
        switcher.addEventListener('click', handleLanguageSwitch);
    });
}); 