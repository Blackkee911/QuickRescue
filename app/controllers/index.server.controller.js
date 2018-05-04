exports.render = function (req, res) {
    res.render('index', {
        title: 'Index',
        username: req.user ? req.user.username : '',
        messages: req.flash('msg')
    });
};