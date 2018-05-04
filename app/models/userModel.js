var mongoose = require('mongoose');
var crypto = require('crypto');
var constants = require('../../config/constants')
var Schema = mongoose.Schema;

// Create user schema
var UserSchema = new Schema({
    firstName: {
        type: String,
        required: constants.USER_CLT_REQ_FIRSTNAME
    },
    lastName: String,
    username: {
        type: String,
        unique: true,
        trim: true,
        required: constants.USER_CLT_REQ_USERNAME
    },
    email: {
        type: String,
        index: true,
        match: [/.+\@.+\.+/, constants.USER_CLT_EMAIL_NOT_VALID]
    },
    password: {
        type: String,
        validate: [
            function (password) {
                return password && password.length >= 8;
            },
            constants.USER_CLT_PWD_ATLEAST
        ]
    },
    Privileges: {
        type: String,
        default: constants.USER_CLT_DF_PRIVILEGES
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: constants.USER_CLT_REQ_PROVIDER
    },
    providerId: String,
    providerData: {},
    created: {
        type: Date,
        default: Date.now
    }
});

// Random with BASE64
UserSchema.pre('save', function (next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

// Hash password
UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha1').toString('base64');
};

// Check raw password with hashed password
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

// Find user
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');
    _this.findOne({
        username: possibleUsername
    }, function (err, user) {
        if (!err) {
            if (!user) callback(possibleUsername);
            else return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
        } else {
            callback(null);
        }
    });
};

mongoose.model('User', UserSchema);