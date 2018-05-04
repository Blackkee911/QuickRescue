var User = require('mongoose').model('User');
var constants = require('../../config/constants')

// Create new user
exports.create = function (req, res, next) {
    var user = new User(req.body);

    user.save(function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(user);
        }
    });
};

// Get user data
exports.list = function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return next(err);
        } else {
            res.json(users);
        }
    });
};

// Get user data
exports.read = function (req, res) {
    res.json(req.user);
};

// Get user data by Username
exports.userByUsername = function (req, res, next, username) {
    User.findOne({
        username: username
    }, function (err, user) {
        if (err) {
            return next(err);
        } else {
            req.user = user;
            next();
        }
    });
};

// Update user data
exports.update = function (req, res, next) {
    User.findOneAndUpdate({ username: req.user.username },
        function (err, user) {
            if (err) {
                return next(err);
            } else {
                res.json(user);
            }
        });
};

// Delete user
exports.delete = function (req, res, next) {
    req.user.remove(function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.user);
        }
    });
};

// Render signup page
exports.renderSignup = function (req, res) {
    if (!req.user) {
        res.render('signup', {
            title: 'Signup',
            messages: req.flash('error')
        });
    } else {
        return res.redirect('/');
    }
};

// Signup event
exports.signup = function (req, res, next) {
    if (!req.user) {
        var user = new User(req.body);
        user.provider = 'local';

        user.save(function (err) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('error', message);
                return res.redirect('/signup');
            }

            req.login(user, function (err) {
                if (err) return next(err);
                return res.redirect('/');
            });
        });
    } else {
        return res.redirect('/');
    }
};

// Logout event
exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

// Render login page
exports.renderLogin = function (req, res) {
    if (!req.user) {
        res.render('login', {
            title: 'Log in',
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        return res.redirect('/');
    }
};

// Save profile from Provider data
exports.saveOAuthUserProfile = function (req, profile, done) {
    User.findOne({
        provider: profile.provider,
        providerId: profile.id
    }, function (err, user) {
        if (err) return done(err);
        else {
            if (!user) {
                var possibleUsername = profile.username || (profile.email ? profile.email.split('@')[0] : '');
                User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                    profile.username = availableUsername;
                    user = User(profile);
                    user.save(function (err) {
                        if (err) {
                            var message = getErrorMessage(err);
                            req.flash('error', message);
                            return resizeBy.redirect('/signup');
                        }
                        return done(err, user);
                    });
                });
            } else {
                return done(err, user);
            }
        }
    });
};

// Catch and throws error
var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = constants.USER_CLT_DUP_INDEX;
                break;
            default:
                message = constants.DB_ERR;
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message;
            }
        }
    }
    return message;
};