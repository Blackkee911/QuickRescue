var task = require('../controllers/task.server.controller');
var sosrequest = require('../controllers/sosrequest.server.controller');
var s3api = require('../controllers/amazons3.server.controller');
var multer = require('multer');
var fs = require('fs');

module.exports = function (app) {
    app.route('/sosrequest')
        .get(sosrequest.renderForm)
        //.post(upload.any(), task.sosadd);
        .post(task.sosadd);
    
    app.route('/testupload').post(s3api.uploadNewToS3);
}

/*//var prefix = 1;

var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            //req.taskId = timestamp(new Date(Date.now()));
            //var dir = './public/img/' + req.taskId;
            var dir = './public/img/';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            //file.originalname = taskId + (prefix < 10 ? '0' + prefix : prefix) + '.' + file.originalname.split('.').pop();
            //file.originalname = (prefix < 10 ? '0' + prefix : prefix) + '.' + file.originalname.split('.').pop();
            file.originalname = Date.now() + '.' + file.originalname.split('.').pop();
            cb(null, file.originalname);
            //prefix++;
        }
    })
});*/