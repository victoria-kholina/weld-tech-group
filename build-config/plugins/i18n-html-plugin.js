const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const ejs = require('ejs');
const minify = require('html-minifier').minify;

class I18nHtmlPlugin {
    constructor(options) {
        this.options = options;
        this.translations = {};
        this.root = options.root || path.resolve(__dirname, '../../src');
    }

    async loadTranslations(lang) {
        const translationsPath = path.resolve(__dirname, '../../src/locales', lang);
        
        if (!fs.existsSync(translationsPath)) {
            console.warn(`No translations found for language: ${lang} at path: ${translationsPath}`);
            return;
        }

        const files = fs.readdirSync(translationsPath).filter(file => file.endsWith('.json'));
        this.translations[lang] = {};
        
        await Promise.all(files.map(async file => {
            try {
                const content = await fs.promises.readFile(path.join(translationsPath, file), 'utf8');
                const key = file.replace('.json', '');
                this.translations[lang][key] = JSON.parse(content);
            } catch (error) {
                console.error(`Error loading translation file ${file} for language ${lang}:`, error);
            }
        }));
    }

    getTranslationValue(path, translations) {
        return path.split('.').reduce((obj, key) => obj?.[key], translations) || '';
    }

    async processTemplate(templatePath, lang) {
        let content = fs.readFileSync(templatePath, 'utf8');
        
        // Получаем относительный путь к файлу шаблона
        const relativePath = path.relative(this.root, templatePath).replace(/\\/g, '/');

        // Формируем URL страницы
        let pageUrl;
        if (lang === 'en') {
            pageUrl = `${this.options.data?.websiteUrl || ''}${relativePath.replace(/index\.ejs$/, '').replace(/\.ejs$/, '.html')}`;
        } else {
            pageUrl = `${this.options.data?.websiteUrl || ''}${lang}/${relativePath.replace(/index\.ejs$/, '').replace(/\.ejs$/, '.html')}`;
        }

        // Добавляем массив поддерживаемых языков
        const supportedLangs = this.options.languages;

        // First process EJS templates
        content = await ejs.render(content, {
            include: (file) => {
                const currentDir = path.dirname(templatePath);
                const includePath = path.resolve(currentDir, file);
                const content = fs.readFileSync(includePath, 'utf8');
                return ejs.render(content, { 
                    lang,
                    websiteUrl: this.options.data?.websiteUrl || '',
                    translations: this.translations[lang],
                    path: (file) => lang === 'en' ? `/${file}` : `/${lang}/${file}`,
                    pageUrl,
                    relativePath,
                    supportedLangs
                }, {
                    async: false,
                    root: this.root,
                    filename: includePath
                });
            },
            lang,
            websiteUrl: this.options.data?.websiteUrl || '',
            translations: this.translations[lang],
            path: (file) => lang === 'en' ? `/${file}` : `/${lang}/${file}`,
            pageUrl,
            relativePath,
            supportedLangs
        }, {
            async: true,
            root: this.root,
            filename: templatePath
        });

        // Process i18n attributes
        const processI18nAttributes = (content) => {
            return content
                .replace(/(<[^>]+?)\s+data-i18n="([^"]+?)"\s*([^>]*>)/g, (match, startTag, path, endTag) => {
                    const value = this.getTranslationValue(path, this.translations[lang]);
                    return value ? `${startTag}${endTag}${value}` : match;
                })
                .replace(/(<[^>]+?)\s+data-i18n-attr="\[([^\]]+?)\]([^"]+?)"\s*([^>]*>)/g, (match, startTag, attrName, key, endTag) => {
                    const translation = this.getTranslationValue(key.trim(), this.translations[lang]);
                    return translation ? `${startTag}${attrName}="${translation}"${endTag}` : match;
                });
        };

        content = processI18nAttributes(content);

        // Add scripts and styles
        const scripts = `<script src="/assets/js/main.js"></script>`;
        const styles = `<link rel="stylesheet" href="/assets/css/main.css">`;

        // Insert scripts and styles
        content = content
            .replace(/<\/body>/, `${scripts}\n</body>`)
            .replace(/<\/head>/, `${styles}\n</head>`);

        // Minify HTML
        return minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
        });
    }

    apply(compiler) {
        // Add EJS files to dependencies
        compiler.hooks.compilation.tap('I18nHtmlPlugin', (compilation) => {
            const { pages } = this.options;
            
            pages.forEach(page => {
                const templatePath = path.resolve(__dirname, `../../src/${page}`);
                if (fs.existsSync(templatePath)) {
                    compilation.fileDependencies.add(templatePath);
                }
            });
        });

        compiler.hooks.thisCompilation.tap('I18nHtmlPlugin', (compilation) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: 'I18nHtmlPlugin',
                    stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                async () => {
                    const { languages, pages } = this.options;
                    
                    // Load translations for all languages
                    for (const lang of languages) {
                        await this.loadTranslations(lang);
                    }

                    // Create dist directory if it doesn't exist
                    const distPath = path.resolve(__dirname, '../../dist');
                    if (!fs.existsSync(distPath)) {
                        await mkdir(distPath, { recursive: true });
                    }

                    // Process each page for each language
                    for (const page of pages) {
                        const templatePath = path.resolve(__dirname, `../../src/${page}`);
                        
                        if (!fs.existsSync(templatePath)) {
                            console.warn(`Template not found: ${templatePath}`);
                            continue;
                        }

                        for (const lang of languages) {
                            // Save directory structure from src
                            const relativePath = path.dirname(page);
                            const outputFilename = path.basename(page, '.ejs') + '.html';
                            
                            // For English version save to root dist
                            const outputPath = lang === 'en' 
                                ? path.join(distPath, relativePath, outputFilename)
                                : path.join(distPath, lang, relativePath, outputFilename);
                            
                            // Create all necessary subdirectories
                            const outputDir = path.dirname(outputPath);
                            if (!fs.existsSync(outputDir)) {
                                await mkdir(outputDir, { recursive: true });
                                console.log(`Created directory: ${outputDir}`);
                            }

                            const processedContent = await this.processTemplate(templatePath, lang);
                            
                            // Add file to Webpack compilation
                            const assetPath = lang === 'en'
                                ? path.join(relativePath, outputFilename).replace(/\\/g, '/')
                                : path.join(lang, relativePath, outputFilename).replace(/\\/g, '/');
                            
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