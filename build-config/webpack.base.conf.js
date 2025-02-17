const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const fs = require('fs');

const PATHS = {
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
    styles: 'css/',
    assets: 'assets/',
    services: 'services'
};


const ejsFiles = fs.readdirSync(`${PATHS.src}`).filter(file => file.endsWith('.ejs'));

const htmlPlugins = ejsFiles.map(file => {
    return new HtmlWebpackPlugin({
        template: path.join(PATHS.src, file),
        filename: file.replace('.ejs', '.html')
        // favicon: `${PATHS.dist}/favicon.ico`
    });
});

// const ejsFilesServices = fs.readdirSync(`${PATHS.src}/${PATHS.services}`).filter(file => file.endsWith('.ejs'));

// const htmlPluginsServices = ejsFilesServices.map(file => {
//     return new HtmlWebpackPlugin({
//         template: path.join(PATHS.src, PATHS.services, file),
//         filename: `${PATHS.services}/${file.replace('.ejs', '.html')}`,
//         favicon: `${PATHS.dist}/favicon.ico`
//     });
// });

module.exports = {
    externals: {
        paths: PATHS
    },
    entry: PATHS.src,
    output: {
        filename: `js/[name].js`,
        path: PATHS.dist,
        clean: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ejs$/i,
                use: ['html-loader', 'template-ejs-loader'],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'postcss-loader',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true }
                    },
                    {
                        loader: 'postcss-loader',
                        options: { 
                            sourceMap: true,
                            postcssOptions: {
                                plugins: [
                                    require('autoprefixer')({
                                        grid: 'autoplace'
                                    }),
                                    require('postcss-sort-media-queries')({
                                        sort: 'mobile-first', 
                                    }),
                                    require('cssnano')({
                                        preset: [
                                            'default',
                                            {
                                                discardComments: {
                                                    removeAll: true
                                                }
                                            }
                                        ]
                                    }),
                                ]
                            }
                         }
                    },
                    {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    },
                ]
            },
            {
                test: /\.(png|jpe?g|gif|webp|svg)$/i,
                type: 'asset',
                generator: {
                    filename: `${PATHS.assets}img/[name][ext]`
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot)$/i,
                type: 'asset/resource',
                generator: {
                    filename: `${PATHS.assets}fonts/[name][ext]`
                }
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
                        ],
                    },
                }, 
            }),
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ['imagemin-webp', { quality: 60 }],
                        ],
                    },
                },
            }),
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `${PATHS.styles}[name].css`
        }),
        ...htmlPlugins,
        // ...htmlPluginsServices,
        new CopyWebpackPlugin({
            patterns: [
                { from: `${PATHS.src}/favicon.ico`, to: `${PATHS.dist}/favicon.ico` },
                { from: `${PATHS.src}/${PATHS.assets}css`, to: `${PATHS.dist}/${PATHS.assets}css` },
                { from: `${PATHS.src}/${PATHS.assets}img`, to: `${PATHS.dist}/${PATHS.assets}img` },
                { from: `${PATHS.src}/${PATHS.assets}fonts`, to: `${PATHS.dist}/${PATHS.assets}fonts` }
            ]
        }),
        
    ],
};
