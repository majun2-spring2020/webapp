var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: process.env.AWSregion || 'us-east-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = process.env.Queue
const logger=require("../log/logcontroller")
exports.sendMessage=function(params){
    sqs.sendMessage(params, function(err, data) {
        if (err) {
            logger.error(err)
        } else {
            logger.debug("Success", data.MessageId)
        }
    });
}