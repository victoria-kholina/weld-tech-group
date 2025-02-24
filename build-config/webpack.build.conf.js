const { merge } = require('webpack-merge'); 
const baseWebpackConfig = require('./webpack.abs.conf');

const buildWebpackConfig = merge(baseWebpackConfig, {
    mode: 'production', 
    plugins: []
});

module.exports = buildWebpackConfig; 
