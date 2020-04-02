var AWS = require('aws-sdk');
// Set region
AWS.config.update({region: process.env.AWSregion || 'us-east-1'});
const logger=require("../log/logcontroller")
const query=require('../services/service');

const publishTopic=function(Message){
    var params = {
        Message: JSON.stringify(Message), /* required */
        TopicArn: process.env.SNSTopicARN
    };
    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    publishTextPromise.then(
        function(data) {
            logger.info("publish a topic")
        }).catch(
          function(err) {
            logger.error(err)
    });
}
exports.PublisSNS=function(owner_id,xday,email){ 
    
    query(`SELECT * FROM Bill WHERE owner_id='${owner_id}' AND to_days(NOW()) - TO_DAYS(due_date) >=-${xday} AND to_days(NOW()) - TO_DAYS(due_date)<=0`).then(function (data) {
        var bills=[]
        
        data.rows.forEach(element => {
            let bill=process.env.AWSProfile+"meepo.me/v1/bill/"
            bill+=element.id
            logger.debug(bill)
            bills.push(bill)
            logger.debug(bills)
                                    // element.categories=csvToJsonList(element.categories)
                                    // console.log(element.categories)
        });
        var params={
            email:email,
            bills: bills,
            token:"not used"
        }
        logger.debug(params)
        publishTopic(params)
    })
}
