const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const I18nHtmlPlugin = require('./plugins/i18n-html-plugin');
const fs = require('fs');

const PATHS = {
    src: path.resolve(__dirname, '../src'),
    dist: path.resolve(__dirname, '../dist'),
    styles: 'css/',
    assets: 'assets/',
    services: 'services',
    projects: 'projects'
};

// Функция для поиска всех EJS файлов
function findEjsFiles(dir) {
    const files = fs.readdirSync(dir);
    let ejsFiles = [];

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Рекурсивно ищем в поддиректориях
            ejsFiles = ejsFiles.concat(findEjsFiles(fullPath));
        } else if (file.endsWith('.ejs')) {
            // Добавляем относительный путь к файлу, если он не находится в папке templates
            if (!fullPath.includes(path.sep + 'templates' + path.sep)) {
                ejsFiles.push(path.relative(PATHS.src, fullPath));
            }
        }
    });

    return ejsFiles;
}

// Находим все EJS файлы
const pages = findEjsFiles(PATHS.src);
console.log('Found EJS pages:', pages);

module.exports = {
    externals: { paths: PATHS },
    entry: {
        main: './src/index.js'
    },
    output: {
        filename: 'assets/js/main.js',
        publicPath: '/',
        path: PATHS.dist,
        clean: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.json$/,
                type: 'asset/source',
                generator: {
                    filename: '[path][name][ext]'
                }
            },
            { 
                test: /\.ejs$/i, 
                use: [
                    {
                        loader: 'html-loader'
                    },
                    {
                        loader: 'template-ejs-loader',
                        options: {
                            root: PATHS.src,
                            data: {
                                include: (file) => {
                                    return fs.readFileSync(path.join(PATHS.src, 'templates', file), 'utf8');
                                },
                                lang: '<%= lang %>'
                            }
                        }
                    }
                ]
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif|webp|svg)$/i,
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}img/[name][ext]` }
            },
            {
                test: /\.(woff(2)?|ttf|eot)$/i,
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}fonts/[name][ext]` }
            },
            {
                test: /\.(mp4|webm|ogg)$/, 
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}img/[name][ext]` }
            }
        ]
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        plugins: [
                            ['imagemin-gifsicle', { interlaced: true }],
                            ['imagemin-mozjpeg', { quality: 60 }],
                            ['imagemin-optipng', { optimizationLevel: 5 }]
                        ]
                    }
                }
            }),
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: { plugins: [['imagemin-webp', { quality: 80 }]] }
                }
            })
        ]
    },
    plugins: [
        new I18nHtmlPlugin({
            root: PATHS.src,
            pages: pages,
            languages: ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es']
        }),
        new MiniCssExtractPlugin({ 
            filename: 'assets/css/main.css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(PATHS.src, 'assets'),
                    to: path.join(PATHS.dist, 'assets'),
                    globOptions: {
                        ignore: ['**/js/**', '**/css/**', '**/scss/**']
                    }
                },
                {
                    from: path.join(PATHS.src, 'favicon.ico'),
                    to: path.join(PATHS.dist, 'favicon.ico')
                }
            ]
        })
    ]
};
