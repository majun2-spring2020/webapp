/**
 * 
 */

'use strict';
const bcrypt = require('bcrypt');
const query=require('../services/service');
var auth = require('basic-auth')
/**
 * Creates a new member 
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 * response
 */
exports.userCreate = function (request, response) {
    var email=request.body.email_address;
    //regular check for email address
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String(email).toLowerCase()))
    {
        response.status(400);
        response.json();
        return 
    }
    //password check
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if(!strongRegex.test(String(request.body.password)))
    {
        response.status(400);
        response.json();
        return
    }
    //encodeing the password
    var password = bcrypt.hashSync(request.body.password, 10); 
    //seperate the request body and get the information we need   
    var first_name=request.body.first_name;
    var last_name=request.body.last_name; 
    //if successfully query, return is here       
    

    const sql=`INSERT INTO \`user\` (\`ID\`,\`first_name\`, \`last_name\`, \`password\`, \`email_address\`) VALUES (UUID(),'${first_name}', '${last_name}', '${password}', '${email}');`
    console.log(sql)
    //find the email existance here
    query(`SELECT * FROM user WHERE email_address='${email}'`).then(function (data) {
        if(data.rows[0]!=undefined)
        {
            //exist, return 400
            response.status(400)
            response.json();
            return;
        }
        //not exist,then create
        query(sql).then(function (data){
            query(`SELECT * FROM \`user\` WHERE email_address='${email}'`).then(function (data){
                response.status(201)
                delete data.rows[0]['password']
                response.json(data.rows[0]);
            })
        })
    }).catch(renderErrorResponse(response));
};

/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.userGet = function (request, response) {
    
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        response.status(200)
                        delete data.rows[0]['password'] //delete the password
                        response.json(data.rows[0])                        
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a things object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.userUpdate = function (request, response) {
    //seperate parameters
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if(!strongRegex.test(String(request.body.password)))
    {
        response.status(400);
        response.json();
    }
    //encodeing the password
    var password = bcrypt.hashSync(request.body.password, 10);    
    var first_name=request.body.first_name;
    var last_name=request.body.last_name;
    //get login info
    var credentials = auth(request)   
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {                    
                    if(err) {
                        response.status(400)
                        response.json()
                    }
                    if(res){                        
                        const sql=`UPDATE \`user\` SET \`first_name\`='${first_name}',\`last_name\`='${last_name}',\`password\`='${password}' WHERE \`ID\`='${data.rows[0].ID}'`
                        //access granted begin update
                        //console.log(sql)
                        query(sql).then(function(){
                            response.status(204)
                            response.json()
                        })
                        return
                    }
                    else
                    {
                        response.status(401)
                        response.json()
                        return
                    }                    
                })
                return;
            }
            response.status(401)
            response.json()
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.getBills = function (request, response) {
    
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        
                        query(`SELECT * FROM Bill WHERE owner_id='${data.rows[0].ID}'`).then(function (data) {
                            response.status(200)
                            data.rows.forEach(element => {
                                element.categories=csvToJsonList(element.categories)
                                console.log(element.categories)
                            });
                            
                            response.json(data.rows)
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Creates a new member 
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.createBill = function (request, response) {
    
    var credentials = auth(request)
    
    if(!(request.body.paymentStatus=="paid" || request.body.paymentStatus=="due" || request.body.paymentStatus=="no_payment_required" || request.body.paymentStatus=="past_due")){
        
        response.status(400)
        response.json()
        return
    }

    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        const uuidv1 = require('uuid/v1');
                        var newid=uuidv1();
                        const sql=`INSERT INTO \`Bill\`(\`id\`, \`owner_id\`, \`vendor\`, \`bill_date\`, \`due_date\`, \`amount_due\`, \`categories\`, \`paymentStatus\`) VALUES ('${newid}','${data.rows[0].ID}','${request.body.vendor}','${request.body.bill_date}','${request.body.due_date}','${request.body.amount_due.toFixed(2)}','${jsonListToCsv(request.body.categories)}',"${request.body.paymentStatus}");`
                        console.log(sql)
                        
                        query(sql).then(function (data) {
                            query(`SELECT * FROM Bill WHERE id='${newid}'`).then(function (data){
                                response.status(201)
                                data.rows[0].categories=csvToJsonList(data.rows[0].categories)
                                response.json(data.rows[0])
                                return
                            })
                            
                            
                            
                            
                        }).catch(renderErrorResponse)
                        // response.status(400)
                        // response.json()                    
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.getBills = function (request, response) {
    
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        
                        query(`SELECT * FROM Bill WHERE owner_id='${data.rows[0].ID}'`).then(function (data) {
                            response.status(200)
                            data.rows.forEach(element => {
                                element.categories=csvToJsonList(element.categories)
                                //console.log(element.categories)
                            });
                            
                            response.json(data.rows)
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.getBill = function (request, response) {
    
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(401)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        const sql=`SELECT * FROM Bill WHERE owner_id='${data.rows[0].ID}' AND id='${request.params.id}'`
                        //console.log(sql)
                        query(sql).then(function (data) {
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                return;
                            }
                            response.status(200)
                            data.rows[0].categories=csvToJsonList(data.rows[0].categories)
                            
                            
                            response.json(data.rows[0])
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.putBill = function (request, response) {
    
    var credentials = auth(request)
    if(!(request.body.paymentStatus=="paid" || request.body.paymentStatus=="due" || request.body.paymentStatus=="no_payment_required" || request.body.paymentStatus=="past_due" || request.body.paymentStatus=="" ||request.body.paymentStatus==null)){
        
        response.status(400)
        response.json()
        return
    }
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        var owner_id=data.rows[0].ID
                        var ticketid=request.params.id
                        const sql=`SELECT * FROM Bill WHERE owner_id='${owner_id}' AND id='${ticketid}'`
                        
                        //console.log(sql)
                        query(sql).then(function (data) {
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                return;
                            }
                            var origindata=data.rows[0];
                            if(request.body.vendor==null || request.body.vendor=='')
                                request.body.vendor=data.rows[0].vendor;
                            if(request.body.bill_date==null || request.body.bill_date=='')
                                request.body.bill_date=data.rows[0].bill_date;
                            if(request.body.due_date==null || request.body.due_date=='')
                                request.body.due_date=data.rows[0].due_date;
                            if(request.body.amount_due==null || request.body.amount_due=='' || request.body.amount_due <0.01)
                                request.body.amount_due=data.rows[0].amount_due;
                            if(request.body.paymentStatus=="" ||request.body.paymentStatus==null)
                                request.body.paymentStatus=data.rows[0].paymentStatus;
                            const sql=`UPDATE \`Bill\` SET \`vendor\`='${request.body.vendor}',\`bill_date\`='${request.body.bill_date}',\`due_date\`='${request.body.due_date}',\`amount_due\`=${request.body.amount_due.toFixed(2)},\`categories\`='${jsonListToCsv(request.body.categories)}',\`paymentStatus\`='${request.body.paymentStatus}' WHERE owner_id='${owner_id}' AND id='${ticketid}'`
                            console.log(sql)
                            origindata.vendor=request.body.vendor;
                            origindata.bill_date=request.body.bill_date;
                            origindata.due_date=request.body.due_date;
                            origindata.amount_due=request.body.amount_due;
                            origindata.categories=request.body.categories;
                            origindata.paymentStatus=request.body.paymentStatus;
                            
                            query(sql).then(function (data) {
                                if(data.err!=null)
                                {
                                    response.status(400)
                                    response.json();
                                }
                                response.status(200)                            
                                response.json(origindata)
                                return
                            });
                            
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.deleteBill = function (request, response) {    
    var credentials = auth(request)
    if (!credentials) {
        response.statusCode = 401
        response.json();
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        //console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        var owner_id=data.rows[0].ID
                        var ticketid=request.params.id
                        const sql=`DELETE FROM \`Bill\` WHERE owner_id='${owner_id}' AND id='${ticketid}'`
                        
                        //console.log(sql)
                        query(sql).then(function (data) {
                            
                            response.status(204)                            
                            response.json()
                            return
                            
                            
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Throws error if error object is present.
 *
 * @param {Response} response The response object
 * @return {Function} The error handler function.
 */
let renderErrorResponse = (response) => {
    const errorCallback = (error) => {
        if (error) {
            response.status(500);
            response.json({
                message: error.message
            });
        }
    }
    return errorCallback;
};


//small tools
let jsonListToCsv=(json)=>{
    var csv = '';
    json.forEach(element => {
        csv+=element+','
    });
    
    return csv.substring(0,csv.length-1);
}
let csvToJsonList=(csv)=>{
    var json=csv.split(",");  
    return json; 
}