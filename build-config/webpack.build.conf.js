const { merge } = require('webpack-merge'); 
const baseWebpackConfig = require('./webpack.base.conf');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const buildWebpackConfig = merge(baseWebpackConfig, {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    compress: {
                        drop_console: true,
                    },
                },
                extractComments: false,
            }),
            new ImageMinimizerPlugin({ 
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        plugins: [
                            ['imagemin-gifsicle', { interlaced: true }],
                            ['imagemin-mozjpeg', { quality: 60 }],
                            ['imagemin-optipng', { optimizationLevel: 5 }],
                            ['imagemin-webp', { quality: 70 }]
                        ]
                    }
                }
            })
        ],
    },
    
    plugins: []
});

module.exports = buildWebpackConfig; 
