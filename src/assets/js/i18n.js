import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Список поддерживаемых языков
const supportedLngs = ['pl', 'en', 'lt', 'de', 'ua', 'ru', 'cz', 'es'];

// Функция для определения языка браузера
function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  // Проверяем, поддерживается ли язык браузера
  const lang = browserLang.split('-')[0];
  return supportedLngs.includes(lang) ? lang : 'pl';
}

// Список пространств имен
const namespaces = [
  'common',
  'about',
  'industry-solutions',
  'features',
  'contacts',
  'footer',
  'capacitive-equipment',
  'certificates',
  'form',
  'gallery',
  'know-more',
  'metal-structures',
  'our-equipment',
  'pipelines',
  'stuff',
  'work-stages',
  'about-us',
  'header',
  'equipment',
  'home',
  'projects',
  'services'
];

// Инициализация i18next
const initI18n = async () => {
  try {
    await i18next
      .use(Backend)
      .use(LanguageDetector)
      .init({
        lng: getBrowserLanguage(),
        fallbackLng: 'pl',
        supportedLngs,
        debug: true,
        ns: namespaces,
        defaultNS: 'common',
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
          parse: function(data) {
            try {
              return JSON.parse(data);
            } catch (e) {
              console.error('Error parsing JSON:', e);
              return data;
            }
          },
          stringify: function(data) {
            try {
              return JSON.stringify(data, null, 2);
            } catch (e) {
              console.error('Error stringifying JSON:', e);
              return data;
            }
          },
          requestOptions: {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json; charset=utf-8'
            }
          },
          allowMultiLoading: true,
          reloadInterval: false
        },
        detection: {
          order: ['navigator'],
          caches: ['localStorage'],
          lookupLocalStorage: 'i18nextLng'
        },
        interpolation: {
          escapeValue: false,
          format: function(value, format, lng) {
            if (format === 'html') {
              return value.replace(/\|\|/g, '<br>');
            }
            return value;
          }
        },
        returnObjects: true,
        returnedObjectHandler: function(key, value, options) {
          return value;
        },
        parseHtml: true,
        react: {
          transSupportBasicHtmlNodes: false
        },
        parseMissingKeyHandler: function(key) {
          console.warn('Missing translation for key:', key);
          return key;
        },
        postProcess: ['html'],
        postProcess: ['attr'],
        attr: {
          list: ['data-i18n-attr'],
          extensions: ['html', 'ejs'],
          format: function(value, format, lng) {
            if (format === 'attr') {
              // Извлекаем только путь к переводу после [attr]
              const match = value.match(/\[(.*?)\](.*)/);
              return match ? match[2] : value;
            }
            return value;
          }
        }
      });

    // Загружаем все пространства имен
    for (const ns of namespaces) {
      try {
        await i18next.loadNamespaces(ns);
        console.log(`Successfully loaded namespace: ${ns}`);
      } catch (err) {
        console.warn(`Failed to load namespace ${ns}:`, err);
      }
    }

    return i18next;
  } catch (err) {
    console.error('Error initializing i18next:', err);
    throw err;
  }
};

// Обработка ошибок загрузки файлов
i18next.on('failedLoading', (lng, ns, msg) => {
  console.error(`Failed to load translation file for ${lng}/${ns}: ${msg}`);
});

export { initI18n };
export default i18next; 