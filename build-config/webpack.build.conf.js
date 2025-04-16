const { merge } = require('webpack-merge'); 
const baseWebpackConfig = require('./webpack.base.conf');
const TerserPlugin = require('terser-webpack-plugin');

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
        ],
    },
    plugins: []
});

module.exports = buildWebpackConfig; 
