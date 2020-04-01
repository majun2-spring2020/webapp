var AWS = require('aws-sdk');
// Set region
AWS.config.update({region: process.env.AWSregion || 'us-east-1'});
AWS.config.accessKeyId= process.env.AWSAccessKey || ""
AWS.config.secretAccessKey= process.env.AWSAccessKeyId || ""
var logger=require("../log/logcontroller")
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
    query(`SELECT * FROM Bill WHERE owner_id='${owner_id}'AND to_days(NOW()) - TO_DAYS(due_date) <= ${xday}`).then(function (data) {
        var bills=[]
        data.rows.forEach(element => {
            let bill=process.env.AWSProfile || "prod.meepo.me"
            bill+="v1/bill/"
            bill+=element.id
            bills.push(bill)
                                    // element.categories=csvToJsonList(element.categories)
                                    // console.log(element.categories)
        });
        var total=new Date().getTime()-start;
        var params={
            email:email,
            bills: bills,
            token:"not used"
        }
        publishTopic(params)
    })
}
