import { initI18n } from './i18n';
import i18next from 'i18next';

// Функция для перевода элементов с атрибутом data-i18n
function translateElements() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      // Разделяем ключ на пространство имен и сам ключ
      const [namespace, ...keyParts] = key.split('.');
      const fullKey = keyParts.join('.');
      
      // Обрабатываем HTML пространства имен
      const actualNamespace = namespace.replace('[html]', '');
      const format = namespace.includes('[html]') ? 'html' : undefined;
      
      const translation = i18next.t(fullKey, { 
        ns: actualNamespace,
        format: format
      });
      
      if (translation !== fullKey) { // Проверяем, что перевод существует
        if (format === 'html') {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    }
  });
}

// Функция для перевода атрибутов
function translateAttributes() {
  const elements = document.querySelectorAll('[data-i18n-attr]');
  elements.forEach(element => {
    const attributes = JSON.parse(element.getAttribute('data-i18n-attr'));
    Object.entries(attributes).forEach(([attr, key]) => {
      // Разделяем ключ на пространство имен и сам ключ
      const [namespace, ...keyParts] = key.split('.');
      const fullKey = keyParts.join('.');
      
      // Обрабатываем HTML пространства имен
      const actualNamespace = namespace.replace('[html]', '');
      const format = namespace.includes('[html]') ? 'html' : undefined;
      
      const translation = i18next.t(fullKey, { 
        ns: actualNamespace,
        format: format
      });
      
      if (translation !== fullKey) { // Проверяем, что перевод существует
        element.setAttribute(attr, translation);
      }
    });
  });
}

// Функция для обновления активной кнопки языка
function updateActiveLanguageButton() {
  const currentLang = i18next.language;
  const languageButtons = document.querySelectorAll('.language-btn');
  
  languageButtons.forEach(button => {
    if (button.getAttribute('data-lang') === currentLang) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Инициализация приложения
async function initializeApp() {
  try {
    // Инициализируем i18next и ждем загрузки всех переводов
    await initI18n();
    
    // Переводим элементы после инициализации
    translateElements();
    translateAttributes();
    updateActiveLanguageButton();

    // Обработчик переключения языка
    document.querySelectorAll('.language-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const lang = button.getAttribute('data-lang');
        await i18next.changeLanguage(lang);
        translateElements();
        translateAttributes();
        updateActiveLanguageButton();
      });
    });

    // Слушаем изменение языка
    i18next.on('languageChanged', () => {
      translateElements();
      translateAttributes();
      updateActiveLanguageButton();
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Запускаем инициализацию при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp); 