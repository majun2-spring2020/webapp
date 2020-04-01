/**
 * endpoint route definitions.
 */
'use strict';
const logger=require("../log/logcontroller")
module.exports = function (app) {
    const controller = require('../controllers/controller');
    app.route('')
        .get( function (request, response) {
            logger.debug("test connect")
            response.status=200
            response.json()
        })
    //  Routes for search and create.
    app.route('/v1/user/self')
    .get(controller.userGet)
    .put(controller.userUpdate)
    .post(controller.userCreate)   
    app.route('/v2/user/self')
        .get(controller.userGet)
        .put(controller.userUpdate)
        .post(controller.userCreate)    
        
    app.route('/v1/bills')
        .get(controller.getBills)
    app.route('/v4/bills')
        .get(controller.getBills)
    // app.route('/v2/bills')
    //     .get(controller.getBills)
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
    app.route('/v1/bills/due/:x')
        .get(controller.getByDue)
    // app.route('/test')
    //     .post(controller.postAttachment)
    // Routes for get, update.
};