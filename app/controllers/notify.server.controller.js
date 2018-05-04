var config = require('../../config/config');
var constants = require('../../config/constants');
var querystring = require('querystring');
var request = require('request');

exports.notifyAdmin = function (requestor, telephone, description, location) {
    var msg = constants.NOTIFY_ADMIN_MSG.replace('@requestor', requestor).replace('@telephone', telephone).replace('@description', description).replace('@location', location);
    var form = {
        message: msg
    };
    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': config.line.adminGroupToken
        },
        uri: 'https://notify-api.line.me/api/notify',
        body: formData,
        method: 'POST'
    }, function (err, res, body) {
        if (err) {
            console.log('cannot send message, error : ' + err);
        }
    });
};

exports.notifyVolunteer = function (requestor, telephone, description, status, helpBy, location) {
    var msg = constants.NOTIFY_VOLUNTEER_MSG.replace('@requestor', requestor).replace('@telephone', telephone).replace('@description', description).replace('@status', status).replace('@helpBy', helpBy).replace('@location', location);
    var form = {
        message: msg
    };
    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': config.line.volunteerGroupToken
        },
        uri: 'https://notify-api.line.me/api/notify',
        body: formData,
        method: 'POST'
    }, function (err, res, body) {
        if (err) {
            console.log('cannot send message, error : ' + err);
        }
    });
};