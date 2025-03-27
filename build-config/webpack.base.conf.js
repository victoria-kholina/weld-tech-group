const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const fs = require('fs');

const PATHS = {
    src: path.resolve(__dirname, '../src'),
    dist: path.resolve(__dirname, '../docs'),
    styles: 'css/',
    assets: 'assets/',
    services: 'services',
    projects: 'projects'
};

const getEjsFiles = (dir) => fs.readdirSync(dir).filter(file => file.endsWith('.ejs'));

const generateHtmlPlugins = (directory, subDir = '') => {
    return getEjsFiles(path.join(PATHS.src, subDir)).map(file => new HtmlWebpackPlugin({
        template: path.join(PATHS.src, subDir, file),
        filename: path.join(subDir, file.replace('.ejs', '.html')),
        favicon: path.join(PATHS.dist, 'favicon.ico')
    }));
};

module.exports = {
    externals: { paths: PATHS },
    entry: PATHS.src,
    output: {
        filename: 'js/[name].js',
        publicPath: '/',
        path: PATHS.dist,
        clean: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            { 
                test: /\.ejs$/i, 
                use: [
                    {
                        loader: 'html-loader'
                    },
                    {
                        loader: 'template-ejs-loader',
                        options: {
                            root: PATHS.src
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
                    options: { plugins: [['imagemin-webp', { quality: 60 }]] }
                }
            })
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: `${PATHS.styles}[name].css` }),
        ...generateHtmlPlugins(PATHS.src),
        ...generateHtmlPlugins(PATHS.src, PATHS.services),
        ...generateHtmlPlugins(PATHS.src, PATHS.projects),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(PATHS.src, 'favicon.ico'), to: path.join(PATHS.dist, 'favicon.ico') },
                { from: path.join(PATHS.src, PATHS.assets, 'css'), to: path.join(PATHS.dist, PATHS.assets, 'css') },
                { from: path.join(PATHS.src, PATHS.assets, 'img'), to: path.join(PATHS.dist, PATHS.assets, 'img') },
                { from: path.join(PATHS.src, PATHS.assets, 'fonts'), to: path.join(PATHS.dist, PATHS.assets, 'fonts') }
            ]
        })
        
    ]
};
