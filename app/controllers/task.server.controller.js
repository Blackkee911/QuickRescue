var Task = require('mongoose').model('Task');
var Image = require('mongoose').model('Image');
var notify = require('./notify.server.controller');
var amazons3 = require('./amazons3.server.controller');
var constants = require('../../config/constants');
var config = require('../../config/config');

/* SOS send event */
exports.sosadd = function (req, res, next) {
    // Generate taskId
    req.body.taskId = timestamp(new Date(Date.now()));

    // If have input files, perform upload files to S3 and insert info to Image collection
    if (req.files.fileupload.originalFilename != '') {
        // Upload files and keep result to Image collection
        amazons3.uploadNewToS3(req, function (fileInfo) {
            if (fileInfo != null) {
                // Insert image info to Image collection
                Image.create(fileInfo, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    }

    // Insert task information
    var task = prepareData(req);
    task.save(function (err) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('msg', message);
            return res.redirect('/sosrequest');
        } else {
            notify.notifyAdmin(task.requestor,
                task.telephone,
                task.description,
                'http://maps.google.com/maps?q=' + task.location.lat + ',' + task.location.lng
            );
            req.flash('msg', constants.SEND_SOS_COMPLETED);
            return res.redirect('/');
        }
    });

};

/* Render tasklist to page */
exports.renderTasklist = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        Task.find({}).sort({ taskId: -1 }).exec(function (err, tasks) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                res.render('tasklist', {
                    title: 'Task list',
                    username: req.user ? req.user.username : '',
                    taskslist: tasks,
                    messages: req.flash('msg')
                });
            }
        });
    }
};

/* Search tasklist to page */
exports.searchTasklist = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var startdate = new Date(req.body.startdate);
        var enddate = new Date(req.body.enddate);
        enddate.setDate(enddate.getDate() + 1);
        Task.find({
            receiptDate: {
                '$gte': new Date(startdate),
                '$lt': new Date(enddate)
            }
        }).sort({ taskId: -1 }).exec(function (err, tasks) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                res.render('tasklist', {
                    title: 'Task list',
                    username: req.user ? req.user.username : '',
                    taskslist: tasks,
                    messages: req.flash('msg')
                });
            }
        });
    }
};

/* Render gallery to update page */
exports.renderGallery = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var taskkey = req.body.imagestaskkey;
        Task.findOne({
            _id: taskkey
        }).select('taskId -_id').exec(function (err, task) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                Image.findOne({
                    taskId: task.taskId
                }, function (err, image) {
                    if (err) {
                        var message = getErrorMessage(err);
                        req.flash('msg', message);
                        return res.redirect('/tasklist');
                    } else {
                        if (image) {
                            res.render('gallery', {
                                title: 'Images Gallery',
                                username: req.user ? req.user.username : '',
                                imageinfo: image,
                                messages: req.flash('msg')
                            });
                        } else {
                            req.flash('msg', constants.TASK_IS_NOT_UP_IMG_YET.replace('@taskId', task.taskId));
                            return res.redirect('/tasklist');
                        }
                        
                    }
                });
            }
        });
    }
};

/* Render task to update page */
exports.renderUpdateTask = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var taskkey = req.body.updatetaskkey;
        Task.findOne({
            _id: taskkey
        }, function (err, task) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                res.render('updatetask', {
                    title: 'Update Task',
                    username: req.user ? req.user.username : '',
                    tasks: task,
                    messages: req.flash('msg'),
                    googleApikey: config.googleApis.apiKey
                });
            }
        });
    }
};

/* Delete task */
exports.deleteTask = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var taskkey = req.body.deletetaskkey;
        Task.findByIdAndRemove(taskkey).exec(function (err) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                req.flash('msg', constants.DEL_TASK_COMPLETED);
                return res.redirect('/tasklist');
            }
        });
    }
};

/* Update task */
exports.updateTask = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var task = new Task(req.body);
        task.location.lat = req.body.latitude;
        task.location.lng = req.body.longitude;

        Task.findByIdAndUpdate(task._id, {
            requestor: task.requestor,
            description: task.description,
            requestType: task.requestType,
            location: { lat: task.location.lat, lng: task.location.lng },
            address: task.address,
            telephone: task.telephone,
            status: task.status,
            helpBy: task.helpBy,
            dead: task.dead,
            injured: task.injured,
            conclusion: task.conclusion
        }, { new: true }, function (err, task) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/updatetask');
            } else {
                req.flash('msg', constants.UPD_TASK_COMPLETED.replace('@taskId', task.taskId));
                return res.redirect('/tasklist');
            }
        });
    }
};

/* Notify Volunteer */
exports.sendNotifyVolunteer = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        var taskkey = req.body.notifytaskkey;
        Task.findOne({
            _id: taskkey
        }, function (err, task) {
            if (err) {
                var message = getErrorMessage(err);
                req.flash('msg', message);
                return res.redirect('/tasklist');
            } else {
                notify.notifyVolunteer(task.requestor,
                    task.telephone,
                    task.description,
                    task.status,
                    task.helpBy,
                    'http://maps.google.com/maps?q=' + task.location.lat + ',' + task.location.lng
                );
                req.flash('msg', constants.SEND_LINE_NOTIFY_COMPLETED);
                return res.redirect('/tasklist');
            }
        });
    }
};

/* Render dashboard to page */
exports.renderDashboard = function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    } else {
        Task.aggregate(
            {
                $group: {
                    _id: '$helpBy',
                    total: { $sum: 1 }
                }
            }
        ).exec(
            function (err, sum) {
                if (err) {
                    return next(err);
                } else {
                    res.render('dashboard', {
                        title: 'Dashboard',
                        username: req.user ? req.user.username : '',
                        sumtasks: sum,
                        messages: req.flash('msg')
                    });
                }
            }
        );
    }
};

/* Get sum dead and injured of each month */
exports.sumDeadInjuredByMonth = function (req, res, next) {
    Task.aggregate(
        {
            $group: {
                _id: { $substr: ['$taskId', 0, 6] },
                totaldead: { $sum: '$dead' },
                totalinjured: { $sum: '$injured' }
            }
        }
    ).exec(
        function (err, sum) {
            if (err) {
                return next(err);
            } else {
                res.json(sum);
                /*res.render('dashboard', {
                    title: 'Dashboard',
                    username: req.user ? req.user.username : '',
                    sumdeadinjured: sum,
                    messages: req.flash('msg')
                });*/
            }
        }
    );
};

/* Get sum of each task status */
exports.sumTaskByStatus = function (req, res, next) {
    Task.aggregate(
        {
            $group: {
                _id: '$status',
                total: { $sum: 1 }
            }
        }
    ).exec(
        function (err, sum) {
            if (err) {
                return next(err);
            } else {
                res.json(sum);
                /*res.render('dashboard', {
                    title: 'Dashboard',
                    username: req.user ? req.user.username : '',
                    sumstatus: sum,
                    messages: req.flash('msg')
                });*/
            }
        }
    );
};

exports.statOfWeek = function (req, res, next) {
    var dateRange = getDateRangeOfWeek(new Date());
    var startDate = new Date(dateRange.start);
    var endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() + 1);

    Task.aggregate(
        {
            $match: {
                receiptDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totaldead: { $sum: '$dead' },
                totalinjured: { $sum: '$injured' }
            }
        }
    ).exec(
        function (err, sum) {
            if (err) {
                return next(err);
            } else {
                res.json(sum);

                /*res.render('dashboard', {
                    title: 'Dashboard',
                    username: req.user ? req.user.username : '',
                    sumdeadinjured: sum,
                    messages: req.flash('msg')
                });*/
            }
        }
    );
}

/* Get timestamp (YYYYMMDDHHMMSSsss)*/
var timestamp = function (date) {
    var d = new Date(date),
        year = date.getFullYear(),
        month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        hour = '' + date.getHours(),
        minute = '' + date.getMinutes(),
        seconds = '' + date.getSeconds(),
        milliseconds = '' + date.getMilliseconds();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;
    if (seconds.length < 2) seconds = '0' + seconds;
    if (milliseconds.length < 2) milliseconds = '00' + milliseconds;
    else if (milliseconds.length < 3) milliseconds = '0' + milliseconds;

    return year + month + day + hour + minute + seconds + milliseconds;
}

/* Prepare data before add to database */
var prepareData = function (req) {
    // If value is '', delete from req to use default from taskModel
    if (req.body.requestor == '') {
        delete req.body.requestor;
    }
    if (req.body.telephone == '') {
        delete req.body.telephone;
    }
    if (req.body.description == '') {
        delete req.body.description;
    }
    if (req.body.requestType == '') {
        delete req.body.requestType;
    }

    req.body.location = {
        lat: req.body.latitude,
        lng: req.body.longitude
    }

    var task = new Task(req.body);
    return task;
}

/* Set date format to YYYYMMDD */
var setFormattedDate = function (date) {
    var m = ("0" + (date.getMonth() + 1)).slice(-2); // in javascript month start from 0.
    var d = ("0" + date.getDate()).slice(-2); // add leading zero 
    var y = date.getFullYear();
    return y + '-' + m + '-' + d;
}

/* Get date range of week */
var getDateRangeOfWeek = function (dateOfWeek) {
    // Get current date, day, diff from Sunday
    var day = dateOfWeek.getDay();
    var diff = dateOfWeek.getDate() - day + (day == 0 ? -6 : 1); // 0 for sunday

    // Get start date of current week (Monday)
    var weekStartTstmp = dateOfWeek.setDate(diff);
    var weekStart = new Date(weekStartTstmp);
    var weekStartDate = setFormattedDate(weekStart);

    // Get end date of current week (Sunday)
    var weekEnd = new Date(weekStartTstmp);  // first day of week
    weekEnd = new Date(weekEnd.setDate(weekEnd.getDate() + 6));
    var weekEndDate = setFormattedDate(weekEnd);

    return {
        start: weekStartDate,
        end: weekEndDate
    }
}

/* Catch and throws error */
var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = constants.TASK_CLT_DUP_INDEX;
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