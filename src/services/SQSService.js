var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: process.env.AWSregion || 'us-east-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const logger=require("../log/logcontroller")
const SNS=require("./SNSService")
exports.send=function(params){
    logger.debug("sqs"+params)
    sqs.sendMessage(params, function(err, data) {
        if (err) {
            logger.error(err)
        } else {
            logger.debug("Success", data.MessageId)
        }
    });
}
exports.receive=function(params){
    
    sqs.receiveMessage(params, function(err, data) {       
        if (err) {
            logger.error("Receive Error", err);
        } 
        else if (data.Messages) {
            logger.debug("a data from sqs")
            for(let i in data.Messages){
                
                var deleteParams = {
                    QueueUrl: process.env.QueueURL,
                    ReceiptHandle: data.Messages[i].ReceiptHandle
                };
                var email=data.Messages[i].MessageAttributes.email.StringValue
                var owner_id=data.Messages[i].MessageAttributes.owner_id.StringValue
                var xdays=data.Messages[i].MessageAttributes.xday.StringValue
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

