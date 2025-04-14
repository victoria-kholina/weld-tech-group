const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const path = require('path');

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        open: true,
        hot: true,
        liveReload: true,
        static: {
            directory: path.resolve(__dirname, '../dist'),
            serveIndex: true,
            watch: {
                ignored: /node_modules/,
                usePolling: true
            },
            staticOptions: {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
                }
            }
        },
        watchFiles: {
            paths: ['src/**/*.ejs', 'src/**/*.js', 'src/**/*.css', 'src/**/*.json', 'src/**/*.scss'],
            options: {
                ignored: /node_modules/,
                usePolling: true
            }
        },
        client: {
            overlay: {
                errors: true,
                warnings: false
            },
            progress: true
        }
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map' 
        })
    ]
});

module.exports = devWebpackConfig