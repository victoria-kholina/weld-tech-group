const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const I18nHtmlPlugin = require('./plugins/i18n-html-plugin');
const fs = require('fs');
const isProduction = process.env.NODE_ENV === 'production';

// Base paths configuration
const PATHS = {
    src: path.resolve(__dirname, '../src'),
    dist: path.resolve(__dirname, '../dist'),
    styles: 'css/',
    assets: 'assets/',
    services: 'services',
    projects: 'projects'
};

// Find all EJS template files
function findEjsFiles(dir) {
    const files = fs.readdirSync(dir);
    let ejsFiles = [];

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            ejsFiles = ejsFiles.concat(findEjsFiles(fullPath));
        } else if (file.endsWith('.ejs')) {
            if (isProduction) {
                ejsFiles.push(path.relative(PATHS.src, fullPath));
            } else {
                if (!fullPath.includes(path.sep + 'templates' + path.sep)) {
                    ejsFiles.push(path.relative(PATHS.src, fullPath));
                }
            }
        }
    });
    return ejsFiles;
}

const pages = findEjsFiles(PATHS.src);

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
            // JSON files loader
            {
                test: /\.json$/,
                type: 'asset/source',
                generator: {
                    filename: '[path][name][ext]'
                }
            },
            // EJS templates loader
            { 
                test: /\.ejs$/i, 
                use: [
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
            // CSS and SCSS loader
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            // Images loader
            {
                test: /\.(png|jpe?g|gif|webp|svg)$/i,
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}img/[name][ext]` }
            },
            // Fonts loader
            {
                test: /\.(woff(2)?|ttf|eot)$/i,
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}fonts/[name][ext]` }
            },
            // Video files loader
            {
                test: /\.(mp4|webm|ogg)$/, 
                type: 'asset/resource',
                generator: { filename: `${PATHS.assets}img/[name][ext]` }
            }
        ]
    },
    plugins: [
        // HTML generation with i18n support
        new I18nHtmlPlugin({
            root: PATHS.src,
            pages: pages,
            languages: ['pl', 'en', 'lt', 'de', 'uk', 'ru', 'cs', 'es'],
            data: {
                websiteUrl: 'https://weld-techgroup.com/'
            }
        }),
        // CSS extraction
        new MiniCssExtractPlugin({ 
            filename: 'assets/css/main.css'
        }),
        // Static files copying
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(PATHS.src, 'assets'),
                    to: path.join(PATHS.dist, 'assets'),
                    globOptions: {
                        ignore: [
                            '**/js/**',
                            '**/css/**',
                            '**/scss/**'
                        ]
                    }
                },
                {
                    from: path.join(PATHS.src, 'favicon'),
                    to: path.join(PATHS.dist, 'favicon')
                },
                {
                    from: path.join(PATHS.src, 'sitemap-images.xml'),
                    to: path.join(PATHS.dist, 'sitemap-images.xml')
                },
                {
                    from: path.join(PATHS.src, 'video-sitemap.xml'),
                    to: path.join(PATHS.dist, 'video-sitemap.xml')
                },
                {
                    from: path.join(PATHS.src, 'sitemap.xml'),
                    to: path.join(PATHS.dist, 'sitemap.xml')
                },
                {
                    from: path.join(PATHS.src, 'robots.txt'),
                    to: path.join(PATHS.dist, 'robots.txt')
                }
            ]
        })
    ]
};
