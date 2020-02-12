/**
 * endpoint route definitions.
 */
'use strict';
module.exports = function (app) {
    const controller = require('../controllers/controller');
    //  Routes for search and create.
    app.route('/v1/user/self')
        .get(controller.userGet)
        .put(controller.userUpdate)
        .post(controller.userCreate)    
    app.route('/v1/bills')
        .get(controller.getBills)
    app.route('/v1/bill')
        .post(controller.createBill)
    app.route('/v1/bill/:id')
        .get(controller.getBill)
        .put(controller.putBill)
        .delete(controller.deleteBill)
    app.route('/v1/bill/:id/file')
        .post(controller.postAttachment)
    app.route('/v1/bill/:billid/file/:fileid')
        .get(controller.getBillAttachment)
        .delete(controller.deleteBillAttachment)
    // app.route('/test')
    //     .post(controller.postAttachment)
    // Routes for get, update.
};