var mongoose = require('mongoose');
var constants = require('../../config/constants')
var Schema = mongoose.Schema;

// Create task schema
var TaskSchema = new Schema({
    taskId: {
        type: String,
        unique: true,
        required: constants.TASK_CLT_REQ_TASKID
    },
    requestor: {
        type: String,
        default: constants.TASK_CLT_DF_REQUESTOR
    },
    requestType: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    location: {
        lng: Number,
        lat: Number
    },
    address: String,
    telephone: {
        type: String,
        required: 'you must be input telephone number'
    },
    receiptDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: constants.TASK_CLT_DF_STATUS
    },
    helpBy: {
        type: String,
        default: ''
    },
    dead: {
        type: Number,
        default: 0
    },
    injured: {
        type: Number,
        default: 0
    },
    conclusion: {
        type: String,
        default: ''
    }
});

mongoose.model('Task', TaskSchema);