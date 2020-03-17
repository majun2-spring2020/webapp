var aws = require('aws-sdk');
const fs = require("fs")
var BUCKET = process.env.S3BucketName || "";
aws.config.accessKeyId= process.env.AWSAccessKey || ""
aws.config.secretAccessKey= process.env.AWSAccessKeyId || ""
var s3 = new aws.S3();
const logger=require("../log/logcontroller")
exports.delete=function(filename){
    var start=new Date().getTime();
    var params = {
        Bucket: BUCKET, 
        Delete: { // required
          Objects: [ // required
            {
              Key: filename // required
            }
          ],
        },
    }
    re=s3.deleteObjects(params, function(err, data) {
        if (err) {
          logger.error(err)
          return false
        } // an error occurred
        else    
            return true           // successful response
    });
    var total=new Date().getTime()-start;
    client.timing('S3DeleteCall', total);
    return re
}

exports.upload=function(filetmppath,filename){
    var start=new Date().getTime();
    var params = {
        Bucket: BUCKET,
        Body : fs.createReadStream(filetmppath),
        Key : filename
    };
    re=s3.upload(params, function (err, data) {
        //handle error
        if (err) {
          logger.error(err)
          return false
        }        
        //success
        return true    
    })
    var total=new Date().getTime()-start;
    client.timing('S3UploadCall', total);
    return re

}

// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');

// //configuring the AWS environment
// AWS.config.update({
//     accessKeyId: "<Access Key Here>",
//     secretAccessKey: "<Secret Access Key Here>"
//   });

// var s3 = new AWS.S3();
// var filePath = "./data/file.txt";

// //configuring parameters
// var params = {
//   Bucket: '<Bucket Name Here>',
//   Body : fs.createReadStream(filePath),
//   Key : "folder/"+Date.now()+"_"+path.basename(filePath)
// };

// s3.upload(params, function (err, data) {
//   //handle error
//   if (err) {
//     console.log("Error", err);
//   }

//   //success
//   if (data) {
//     console.log("Uploaded in:", data.Location);
//   }
// });