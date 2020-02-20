/**
 * reference: Teacher a
 */
let default_user="debian-sys-maint"
let default_pass=process.argv[2]
let query_file=process.argv[3]
/**
 * init database
 */
var mysql = require('mysql');


var con = mysql.createConnection({
  host: "localhost",
  user: default_user,
  password: default_pass
});
var exec=require('child_process').exec
exec(`mkdir tmp`)
exec(`mkdir upload`)
exec(`mysql -u ${default_user} -p${default_pass} < ${query_file}`,function(err,stdout,stderr){
    if(err) throw err
    
    console.log("finish init")
      
    let express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');


    app.use(express.static(__dirname));//use dir
    //Adding body parser for handling request and response objects.
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    //Enabling CORS
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    //Initialize app
    let initApp = require('./src/app');
    initApp(app);


    console.log('server started on: ' + port);

    module.exports = app.listen(port);

})
