/**
 * reference: Teacher a
 */
/**
 * mysql config
 */
let mysqlconfig=require("./mysqlconfig")
const logger=require("./src/log/logcontroller")
//log all used env
const systemenv={
    DBhost: process.env.DBHost,
    DBuser: process.env.DBUser ,
    DBpassword: process.env.DBPassword ,
    DBport: process.env.DBPort,
    DBdatabase:process.env.DBDatabase ,
    BUCKET : process.env.S3BucketName ,
    region:process.env.AWSregion ,
    UserProfile:process.env.AWSProfile,
    queueURL: process.env.QueueURL,
    TopicArn: process.env.SNSTopicARN
}


logger.debug(systemenv)
// init database
mysqlconfig();
let fs=require("fs")
var dir='./tmp'
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);    
}
logger.debug("tmp ok")
let express = require('express'),
app = express(),
port = process.env.APPPort || 3000,
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


logger.debug('server started on: ' + port);
try{
    module.exports = app.listen(port);
}
catch(err){
    logger.error(err)
}
