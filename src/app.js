'use strict';
module.exports = function (app) {
    //Initialize routes
    let Routes = require('./routes/route');
    Routes(app);
};