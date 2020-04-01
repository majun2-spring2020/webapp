const sqs=require("./src/services/SQSService")
const params = {
    AttributeNames: [
       "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
       "Title","Author","WeeksOn"
    ],
    QueueUrl: process.env.Queue,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0
   };
while(1){
    sleep(1)
    sqs.receiveMessage()
}