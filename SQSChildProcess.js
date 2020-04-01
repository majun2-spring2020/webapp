const sqs=require("./src/services/SQSService")
const sleep = require('sleep');
const params = {
    AttributeNames: [
       "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
       "email","xday","owner_id"
    ],
    QueueUrl: process.env.Queue,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
};
while(1){
    sleep.sleep(1)
    sqs.receiveMessage(params)
}