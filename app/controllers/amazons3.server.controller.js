var config = require('../../config/config');
var constants = require('../../config/constants');
var fs = require('fs');
var S3FS = require('s3fs');
var s3fsConf = new S3FS(config.amazonS3.bucketName, {
    accessKeyId: config.amazonS3.accessKeyId,
    secretAccessKey: config.amazonS3.secretAccessKey
});

/* Upload new */
exports.uploadNewToS3 = function (req, callback) {
    // Create new directory by each task ID
    s3fsConf.mkdirp(req.body.taskId).then(function () {
        console.log(constants.DIR_HAS_BEEN_CREATED);
    }, function (reason) {
        console.error(constants.SOMETHING_ERR);
    });

    // New instance of new directory
    var s3fsImpl = new S3FS(config.amazonS3.bucketName + '/' + req.body.taskId, {
        accessKeyId: config.amazonS3.accessKeyId,
        secretAccessKey: config.amazonS3.secretAccessKey
    });

    var file = [];
    var tmpFilesList = [];
    var fileInfo = null;

    // If fileupload is object or json type, push to array variable
    if (req.files.fileupload.constructor  === constants.OBJ_CONSTRUCTOR) {
        file.push(req.files.fileupload);
    } 
    // If fileupload is array, set to array variable
    else if (req.files.fileupload.constructor  === constants.ARR_CONSTRUCTOR) {
        file = req.files.fileupload;
    }   

    // Loop write file to S3
    for (var i = 0; i < file.length; i++) {
        // Get real path of file
        var stream = fs.createReadStream(file[i].path);
        // Gen new file name by timestamp
        var newFileName = new Date().getTime() + '.' + file[i].originalFilename.split('.').pop();
        // Upload to S3
        s3fsImpl.writeFile(newFileName, stream).then(function () {
            console.log(constants.FILE_HAS_BEEN_UPLOAD);
        }, function (reason) {
            console.error(reason);
        });

        // Keep file name and link
        tmpFilesList[i] = {
            fileName: newFileName,
            link: 'https://s3-ap-southeast-1.amazonaws.com/' + config.amazonS3.bucketName + '/' + req.body.taskId + '/' + newFileName
        }
    }

    // Prepare file info before pass with callback
    fileInfo = {
        taskId: req.body.taskId,
        path: config.amazonS3.bucketName + '/' + req.body.taskId,
        files: tmpFilesList
    }

    callback(fileInfo);
};