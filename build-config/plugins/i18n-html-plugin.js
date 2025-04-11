const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const ejs = require('ejs');

class I18nHtmlPlugin {
    constructor(options) {
        this.options = options;
        this.translations = {};
        this.root = options.root || path.resolve(__dirname, '../../src');
    }

    loadTranslations(lang) {
        const translationsPath = path.resolve(__dirname, '../../src/locales', lang);
        console.log(`Loading translations from: ${translationsPath}`);
        
        if (!fs.existsSync(translationsPath)) {
            console.warn(`No translations found for language: ${lang} at path: ${translationsPath}`);
            return;
        }

        const files = fs.readdirSync(translationsPath);
        this.translations[lang] = {};
        
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(path.join(translationsPath, file), 'utf8');
                    const key = file.replace('.json', '');
                    this.translations[lang][key] = JSON.parse(content);
                    console.log(`Loaded translation: ${key} for language: ${lang}`);
                } catch (error) {
                    console.error(`Error loading translation file ${file} for language ${lang}:`, error);
                }
            }
        });

        // Проверяем, что переводы загружены корректно
        console.log(`Translations for ${lang}:`, JSON.stringify(this.translations[lang], null, 2));
    }

    getTranslationValue(path, translations) {
        try {
            const cleanPath = path.replace(/^\[[^\]]+\]/, '');
            const keys = cleanPath.split('.');
            let value = translations;
            
            for (const key of keys) {
                if (value && typeof value === 'object') {
                    value = value[key];
                } else {
                    console.warn(`Translation not found for path: ${cleanPath}`);
                    return null;
                }
            }
            
            if (typeof value === 'string') {
                return value;
            }
            
            console.warn(`Translation value is not a string for path: ${cleanPath}`);
            return null;
        } catch (error) {
            console.error(`Error getting translation for path ${path}:`, error);
            return null;
        }
    }

    async processTemplate(templatePath, lang) {
        let content = fs.readFileSync(templatePath, 'utf8');
        
        // Сначала обрабатываем EJS шаблоны
        content = await ejs.render(content, {
            include: (file) => {
                // Получаем директорию текущего файла
                const currentDir = path.dirname(templatePath);
                // Строим абсолютный путь к включаемому файлу
                const includePath = path.resolve(currentDir, file);
                console.log(`Including file: ${includePath}`);
                return fs.readFileSync(includePath, 'utf8');
            }
        }, {
            async: true,
            root: this.root,
            filename: templatePath
        });

        // Затем обрабатываем атрибуты i18n
        content = content.replace(/(<[^>]+?)\s+data-i18n="([^"]+?)"\s*([^>]*>)/g, (match, startTag, path, endTag) => {
            const value = this.getTranslationValue(path, this.translations[lang]);
            if (value) {
                return `${startTag}${endTag}${value}`;
            }
            console.warn(`Translation not found for path: ${path} in language: ${lang}`);
            return match;
        });

        content = content.replace(/(<[^>]+?)\s+data-i18n-attr="\[([^\]]+?)\]([^"]+?)"\s*([^>]*>)/g, (match, startTag, attrName, key, endTag) => {
            const translationKey = key.trim();
            const translation = this.getTranslationValue(translationKey, this.translations[lang]);
            if (translation) {
                return `${startTag}${attrName}="${translation}"${endTag}`;
            }
            console.warn(`Missing translation for attribute ${translationKey} in language: ${lang}`);
            return match;
        });

        return content;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('I18nHtmlPlugin', (compilation) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: 'I18nHtmlPlugin',
                    stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                async () => {
                    const { languages, pages } = this.options;
                    
                    // Загрузка переводов для всех языков
                    for (const lang of languages) {
                        this.loadTranslations(lang);
                    }

                    // Создание директории dist, если она не существует
                    const distPath = path.resolve(__dirname, '../../dist');
                    if (!fs.existsSync(distPath)) {
                        await mkdir(distPath, { recursive: true });
                    }

                    // Обработка каждой страницы для каждого языка
                    for (const page of pages) {
                        const templatePath = path.resolve(__dirname, `../../src/${page}`);
                        
                        if (!fs.existsSync(templatePath)) {
                            console.warn(`Template not found: ${templatePath}`);
                            continue;
                        }

                        for (const lang of languages) {
                            // Сохраняем структуру директорий из src
                            const relativePath = path.dirname(page);
                            const outputFilename = path.basename(page, '.ejs') + '.html';
                            const outputPath = path.join(distPath, lang, relativePath, outputFilename);
                            
                            // Создаем все необходимые поддиректории
                            const outputDir = path.dirname(outputPath);
                            if (!fs.existsSync(outputDir)) {
                                await mkdir(outputDir, { recursive: true });
                                console.log(`Created directory: ${outputDir}`);
                            }

                            const processedContent = await this.processTemplate(templatePath, lang);
                            
                            // Добавляем файл в компиляцию Webpack
                            const assetPath = path.join(lang, relativePath, outputFilename).replace(/\\/g, '/');
                            compilation.emitAsset(assetPath, {
                                source: () => processedContent,
                                size: () => processedContent.length
                            });
                            
                            console.log(`Generated: ${assetPath}`);
                        }
                    }
                }
            );
        });
    }
}

module.exports = I18nHtmlPlugin; 