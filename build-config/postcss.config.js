// postcss.config.js

module.exports = {
    plugins: [
        require('autoprefixer')({
            overrideBrowserslist: ['>1%', 'last 3 versions'],
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
        })
    ]
};