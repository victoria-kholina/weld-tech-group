const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const I18nHtmlPlugin = require('./plugins/i18n-html-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const PATHS = {
    src: path.resolve(__dirname, '../src'),
    dist: path.resolve(__dirname, '../dist')
};

// Функция для поиска всех EJS файлов, исключая templates
function findEjsFiles(dir, ignoreDirs = ['templates']) {
    const files = fs.readdirSync(dir);
    let ejsFiles = [];

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                ejsFiles = ejsFiles.concat(findEjsFiles(fullPath, ignoreDirs));
            }
        } else if (file.endsWith('.ejs')) {
            ejsFiles.push(path.relative(PATHS.src, fullPath));
        }
    });

    return ejsFiles;
}

// Находим все EJS файлы
const pages = findEjsFiles(PATHS.src);
console.log('Found EJS pages:', pages);

module.exports = {
    mode: 'production',
    entry: './src/assets/js/main.js',
    output: {
        path: PATHS.dist,
        filename: 'assets/js/[name].[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.ejs$/,
                use: [
                    {
                        loader: 'template-ejs-loader',
                        options: {
                            root: PATHS.src,
                            include: (file) => {
                                const fullPath = path.join(PATHS.src, file);
                                return fs.readFileSync(fullPath, 'utf8');
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new I18nHtmlPlugin({
            root: PATHS.src,
            pages: pages,
            languages: ['pl', 'en', 'lt', 'de', 'ua', 'ru', 'cz', 'es']
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(PATHS.src, 'assets'),
                    to: 'assets',
                    globOptions: {
                        ignore: ['**/js/**']
                    }
                },
                {
                    from: path.resolve(PATHS.src, 'favicon.ico'),
                    to: 'favicon.ico'
                }
            ]
        })
    ]
}; 