var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: process.env.AWSregion || 'us-east-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
AWS.config.accessKeyId= process.env.AWSAccessKey || ""
AWS.config.secretAccessKey= process.env.AWSAccessKeyId || ""
const logger=require("../log/logcontroller")
const SNS=require("./SNSService")
exports.sendMessage=function(params){
    sqs.sendMessage(params, function(err, data) {
        if (err) {
            logger.error(err)
        } else {
            logger.debug("Success", data.MessageId)
        }
    });
}