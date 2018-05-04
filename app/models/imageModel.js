var mongoose = require('mongoose');
var constants = require('../../config/constants')
var Schema = mongoose.Schema;

// Create task schema
var ImageSchema = new Schema({
    taskId: {
        type: String,
        required: constants.TASK_CLT_REQ_TASKID
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    files: [{
        fileName: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        }
    }],
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Image', ImageSchema);