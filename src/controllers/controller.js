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
 */
exports.create = function (request, response) {
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
    const resolve = (list) => {
        response.status(201);
        response.json()
        return
    };

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
        query(sql).then(resolve)
    }).catch(renderErrorResponse(response));
};

/**
 * Returns a members object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.get = function (request, response) {
    
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
exports.update = function (request, response) {
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
                        const sql=`UPDATE \`user\` SET \`first_name\`='${first_name}',\`last_name\`='${last_name}',\`password\`='${password}' WHERE \`ID\`=${data.rows[0].ID}`
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