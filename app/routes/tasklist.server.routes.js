var task = require('../controllers/task.server.controller');

module.exports = function (app) {
    app.route('/tasklist').get(task.renderTasklist);
    app.route('/searchtasklist').post(task.searchTasklist);
    app.route('/notifyvolunteer').post(task.sendNotifyVolunteer);
    app.route('/viewimages').post(task.renderGallery);
    app.route('/updatetask').post(task.renderUpdateTask);
    app.route('/savetask').post(task.updateTask);
    app.route('/deletetask').post(task.deleteTask);
    app.route('/dashboard').get(task.renderDashboard);
    app.route('/sumdeadinjuredbymonth').get(task.sumDeadInjuredByMonth);
    app.route('/sumtaskbystatus').get(task.sumTaskByStatus);
    app.route('/statofweek').get(task.statOfWeek);
}