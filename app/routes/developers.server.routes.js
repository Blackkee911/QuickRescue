var developers = require('../controllers/developers.server.controller');

module.exports = function (app) {
    app.route('/developers').get(developers.renderDevelopers);
}