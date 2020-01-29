/**
 * endpoint route definitions.
 */
'use strict';
module.exports = function (app) {
    const controller = require('../controllers/controller');
    //  Routes for search and create.
    app.route('/v1/user/self')
        .get(controller.get)
        .put(controller.update)
        .post(controller.create)     
    // Routes for get, update.
};