/* Render delvelopers to page */
exports.renderDevelopers = function (req, res, next) {
    res.render('developers', {
        title: 'Developers',
        username: req.user ? req.user.username : '',
        messages: req.flash('msg')
    });
};