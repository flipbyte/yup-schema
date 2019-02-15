module.exports = {
    type: 'web-app',
    npm: {
        esModules: true,
        umd: {
            global: 'YupSchema',
            externals: {
                yup: 'Yup',
            }
        }
    },
    karma: {
        frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon-chai'],
        plugins: [
            require('karma-chai-plugins')
        ]
    }
}
