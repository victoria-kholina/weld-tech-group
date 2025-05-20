// Language detector

// List of supported languages
const supportedLanguages = ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es'];

// Function to get the current language from the URL
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    const pathLang = currentPath.split('/')[1];
    return supportedLanguages.includes(pathLang) ? pathLang : 'en';
}

// Function to get the current path without the language prefix
function getPathWithoutLang() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const hasLangPrefix = supportedLanguages.includes(pathParts[1]);
    
    if (hasLangPrefix) {
        return '/' + pathParts.slice(2).join('/');
    }
    return currentPath;
}

// Function to update the active language in the switcher
function updateLanguageSwitcher() {
    const currentLang = getCurrentLanguage();

    document.querySelectorAll('.language-switcher').forEach(switcher => {
        let mainSwitcher = switcher.querySelector('.active-switcher');
        let activeLang = mainSwitcher.querySelector('.active-switcher-lang');
        activeLang.textContent = currentLang.toUpperCase();
        
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

        const svg = mainSwitcher.querySelector('.active-switcher-icon');
        const use = svg.querySelector('use');
        use.setAttribute('xlink:href', `#${countryMap[currentLang]}`);
    
        const submenuLinks = switcher.querySelectorAll('.submenu .language-switcher__link');
        submenuLinks.forEach(link => {
            const lang = link.textContent.trim().toLowerCase();
            const pathWithoutLang = getPathWithoutLang();
            
            if (lang === 'en') {
                link.href = pathWithoutLang;
            } else {
                link.href = `/${lang}${pathWithoutLang}`;
            }
            
            if (lang === currentLang) {
                link.parentElement.style.display = 'none';
            } else {
                link.parentElement.style.display = '';
            }
        });
    });
}


// Click handler for the language switcher
function handleLanguageSwitch(event) {
    const link = event.target.closest('.language-switcher__link');
    if (!link) return;
    
    const selectedLang = link.textContent.trim().toLowerCase();
    
    localStorage.setItem('preferredLanguage', selectedLang);
    
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

// Export functions
export { getCurrentLanguage, updateLanguageSwitcher };

// Call the function when the page loads and when the URL changes
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageSwitcher()
    document.querySelectorAll('.language-switcher').forEach(switcher => {
        switcher.addEventListener('click', handleLanguageSwitch);
    });
}); 