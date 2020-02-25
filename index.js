/**
 * reference: Teacher a
 */
/**
 * mysql config
 */
let mysqlconfig=require("./mysqlconfig")
// init database
mysqlconfig();
let fs=require("fs")
var dir='./tmp'
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    
}
console.log("tmp ok")
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
