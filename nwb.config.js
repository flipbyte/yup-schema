module.exports = {
    type: 'web-app',
    karma: {
        frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon-chai'],
        plugins: [
            require('karma-chai-plugins')
        ]
    }
}
