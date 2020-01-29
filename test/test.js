var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server=require("../index");
let should = chai.should();
chai.use(chaiHttp);
describe ("CRUD OPERATIONS", function(){
    var users = [
        {"first_name":"jun",
        "last_name":"ma",
        "email_address":"test@test.com",
        "password":"QWERty1234!"},//success
        {"first_name":"jun",
        "last_name":"ma",
        "email_address":"test@test.com",
        "password":"QWERty1234!"},//due to dul email
        {"first_name":"jun",
        "last_name":"ma",
        "email_address":"test@test1.com",
        "password":"QWERty1234"}//due to password
    ]
    it("Should add Users in DB", (done) => {
        
        chai.request(server)
            .post("/v1/user/self")
            .send(users[0])
            .end((err, res) => {
                res.should.have.status(201);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
    it("Shouldn't add Users in DB since dul email", (done) => {
        
        chai.request(server)
            .post("/v1/user/self")
            .send(users[1])
            .end((err, res) => {
                res.should.have.status(400);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
    it("Shouldn't add Users in DB since password is too weak", (done) => {        
        chai.request(server)
            .post("/v1/user/self")
            .send(users[2])
            .end((err, res) => {
                res.should.have.status(400);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
    it("Should get User in DB", (done) => {        
        chai.request(server)
            .get("/v1/user/self")
            .auth('test@test.com', 'QWERty1234!')
            .end((err, res) => {
                res.should.have.status(200);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
    it("Shouldn't get User in DB since wrong password", (done) => {        
        chai.request(server)
            .get("/v1/user/self")
            .auth('test@test.com', 'qwer1234!')
            .end((err, res) => {
                res.should.have.status(401);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
    it("Should update User in DB", (done) => {        
        chai.request(server)
            .put("/v1/user/self")
            .auth('test@test.com', 'QWERty1234!')
            .send({"first_name":"jun1",
                "last_name":"ma1",
                "password":"QWERty1234!"
            })
            .end((err, res) => {
                res.should.have.status(204);
                console.log("Response Body:", res.body);   
                done()             
            })       
    })
})

