var aws = require('aws-sdk');
const fs = require("fs")
var BUCKET = process.argv[7];
aws.config.accessKeyId= process.argv[8]
aws.config.secretAccessKey= process.argv[9]
var s3 = new aws.S3();
exports.delete=function(filename){
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
            return false
        } // an error occurred
        else    
            return true           // successful response
    });
    return re
}

exports.upload=function(filetmppath,filename){
    var params = {
        Bucket: BUCKET,
        Body : fs.createReadStream(filetmppath),
        Key : filename
    };
    re=s3.upload(params, function (err, data) {
        //handle error
        if (err) {
          return false
        }        
        //success
        return true    
    })
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