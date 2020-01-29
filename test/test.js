// var assert = require("assert");
// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server=require("../index");
// let should = chai.should();
// chai.use(chaiHttp);
// describe ("CRUD OPERATIONS", function(){
//     var expected=0;
//     var actually=0;
//     var users = [
//         {"first_name":"jun",
//         "last_name":"ma",
//         "email_address":"test@test.com",
//         "password":"QWERty1234!"},//success
//         {"first_name":"jun",
//         "last_name":"ma",
//         "email_address":"test@test.com",
//         "password":"QWERty1234!"},//due to dul email
//         {"first_name":"jun",
//         "last_name":"ma",
//         "email_address":"test@test1.com",
//         "password":"QWERty1234"}//due to password
//     ]
//     it("Should add Users in DB", (done) => {
//         actually++;
//         chai.request(server)
//             .post("/v1/user/self")
//             .send(users[0])
//             .end((err, res) => {
//                 res.should.have.status(201);

//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     //123
//     it("Shouldn't add Users in DB since dul email", (done) => {
//         actually++;
//         chai.request(server)
//             .post("/v1/user/self")
//             .send(users[1])
//             .end((err, res) => {
//                 res.should.have.status(400);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     it("Shouldn't add Users in DB since password is too weak", (done) => {        
//         actually++;
//         chai.request(server)
//             .post("/v1/user/self")
//             .send(users[2])
//             .end((err, res) => {
//                 res.should.have.status(400);
//                 console.log("Response Body:", res.body);  
//                 expected++; 
//                 done()             
//             })       
//     })
//     it("Should get User in DB", (done) => { 
//         actually++;       
//         chai.request(server)
//             .get("/v1/user/self")
//             .auth('test@test.com', 'QWERty1234!')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     it("Shouldn't get User in DB since wrong password", (done) => {        
//         actually++;
//         chai.request(server)
//             .get("/v1/user/self")
//             .auth('test@test.com', 'qwer1234!')
//             .end((err, res) => {
//                 res.should.have.status(401);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     it("Should update User in DB", (done) => {   
//         actually++;     
//         chai.request(server)
//             .put("/v1/user/self")
//             .auth('test@test.com', 'QWERty1234!')
//             .send({"first_name":"jun1",
//                 "last_name":"ma1",
//                 "password":"QWERty1234!"
//             })
//             .end((err, res) => {
//                 res.should.have.status(204);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
    
//     it("Should add bill in DB", (done) => {   
//         actually++;     
//         chai.request(server)
//             .post("/v1/bill")
//             .auth('test@test.com', 'QWERty1234!')
//             .send({
//                 "owner_id": "a460a1ef-6d54-4b01-90e6-d7017sad851",
//                 "vendor": "Northeastern University",
//                 "bill_date": "2020-01-06",
//                 "due_date": "2020-01-12",
//                 "amount_due": 7000.51,
//                 "categories": [
//                   "college",
//                   "tuition",
//                   "spring2020"
//                 ],
//                 "paymentStatus": "no_payment_required"
//               })
//             .end((err, res) => {
//                 res.should.have.status(201);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     it("Should get Users bill in DB", (done) => { 
//         actually++;       
//         chai.request(server)
//             .get("/v1/bills")
//             .auth('test@test.com', 'QWERty1234!')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 console.log("Response Body:", res.body);   
//                 expected++;
//                 done()             
//             })       
//     })
//     after(() => { console.log(actually-expected);process.exit(actually-expected);  })
// })

