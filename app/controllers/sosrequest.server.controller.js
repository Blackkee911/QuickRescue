var config = require('../../config/config');

exports.renderForm = function (req, res) {
    res.render('sosrequest', {
        title: 'Smart Emergency Alerts System',
        username: req.user ? req.user.username : '',
        messages: req.flash('msg'),
        googleApikey: config.googleApis.apiKey
    });
};