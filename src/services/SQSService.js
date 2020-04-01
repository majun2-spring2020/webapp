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
exports.receiveMessage=function(params){
    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            logger.error("Receive Error", err);
        } 
        else if (data.Messages) {
            for(let message in data.Messages){
                var deleteParams = {
                    QueueUrl: process.env.QueueURL,
                    ReceiptHandle: message.ReceiptHandle
                };
                var email=message.MessageAttributes.email.StringValue
                var owner_id=message.MessageAttributes.owner_id.StringValue
                var xdays=message.MessageAttributes.xday.StringValue
                SNS.PublisSNS(owner_id,xdays,email)
                sqs.deleteMessage(deleteParams, function(err, data) {
                    if (err) {
                    logger.error("Delete Error", err);
                    } else {
                    logger.debug("Message Deleted", data);
                    }
                });
            }
        
        }
    });
}

