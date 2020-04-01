/**
 * 
 */

'use strict';
const bcrypt = require('bcrypt');
const query=require('../services/service');
const fs=require("fs")
const s3File=require("../services/s3Services")
const logger=require("../log/logcontroller")
const client=require("../log/statsd")
var auth = require('basic-auth')
const SQS=require("../services/SQSService")
/**
 * Creates a new member 
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 * response
 */
exports.userCreate = function (request, response) {
    client.increment('userCreateCall');
    logger.info('userCreateCall')
    var start=new Date().getTime();
    var email=request.body.email_address;
    //regular check for email address
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(String(email).toLowerCase()))
    {
        
        response.status(400);
        response.json();
        var total=new Date().getTime()-start;
        client.timing('userCreate_fail', total);
        return 
    }
    //password check
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if(!strongRegex.test(String(request.body.password)))
    {
        response.status(400);
        response.json();
        var total=new Date().getTime()-start;
        client.timing('userCreate_fail', total);
        return
    }
    //encodeing the password
    var password = bcrypt.hashSync(request.body.password, 10); 
    //seperate the request body and get the information we need   
    var first_name=request.body.first_name;
    var last_name=request.body.last_name; 
    //if successfully query, return is here       
    

    const sql=`INSERT INTO \`user\` (\`ID\`,\`first_name\`, \`last_name\`, \`password\`, \`email_address\`) VALUES (UUID(),'${first_name}', '${last_name}', '${password}', '${email}');`
    // // console.log(sql)
    //find the email existance here
    query(`SELECT * FROM user WHERE email_address='${email}'`).then(function (data) {
        if(data.rows[0]!=undefined)
        {
            //exist, return 400
            response.status(400)
            response.json();
            var total=new Date().getTime()-start;
            client.timing('userCreate_fail', total);
            return;
        }
        //not exist,then create
        query(sql).then(function (data){
            query(`SELECT * FROM \`user\` WHERE email_address='${email}'`).then(function (data){
                response.status(201)
                delete data.rows[0]['password']
                response.json(data.rows[0]);
                var total=new Date().getTime()-start;
                client.timing('userCreate_success', total);
                return;
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
    client.increment('userGetCall');
    logger.info('userGetCall')
    var start=new Date().getTime();
    var credentials = auth(request)

    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('userGet_fail', total);
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// // console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// // console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('userGet_fail', total);
                        return
                        //// // console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        response.status(200)
                        delete data.rows[0]['password'] //delete the password
                        response.json(data.rows[0])     
                        var total=new Date().getTime()-start;
                        client.timing('userGet_success', total);                   
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('userGet_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('userGet_fail', total);
                return
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
    client.increment('userUpdateCall');
    logger.info('userUpdateCall')
    var start=new Date().getTime();
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if(!strongRegex.test(String(request.body.password)))
    {
        response.status(400);
        response.json();
        var total=new Date().getTime()-start;
        client.timing('userUpdate_fail', total);
        return
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
        var total=new Date().getTime()-start;
        client.timing('userUpdate_fail', total);
        return
    } else {
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {                    
                    if(err) {
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('userUpdate_fail', total);
                        return
                    }
                    if(res){                        
                        const sql=`UPDATE \`user\` SET \`first_name\`='${first_name}',\`last_name\`='${last_name}',\`password\`='${password}' WHERE \`ID\`='${data.rows[0].ID}'`
                        //access granted begin update
                        //// console.log(sql)
                        query(sql).then(function(){
                            response.status(204)
                            response.json()
                            var total=new Date().getTime()-start;
                            client.timing('userUpdate_success', total);
                            return
                        })
                        return
                    }
                    else
                    {
                        //401
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('userUpdate_fail', total);
                        return
                    }                    
                })
                return;
            }
            response.status(401)
            response.json()
            var total=new Date().getTime()-start;
            client.timing('userUpdate_fail', total);
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
    client.increment('getBillsCall');
    logger.info('getBillsCall')
    var start=new Date().getTime();
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('getBills_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBills_fail', total);
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        
                        query(`SELECT * FROM Bill WHERE owner_id='${data.rows[0].ID}'`).then(function (data) {
                            response.status(200)
                            data.rows.forEach(element => {
                                element.categories=csvToJsonList(element.categories)
                                // console.log(element.categories)
                            });
                            
                            response.json(data.rows)
                            var total=new Date().getTime()-start;
                            client.timing('getBills_success', total);
                            return
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBills_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('getBills_fail', total);
                return
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
    client.increment('createBillCall');
    logger.info('createBillCall')
    var start=new Date().getTime();
    var credentials = auth(request)
    
    if(!(request.body.paymentStatus=="paid" || request.body.paymentStatus=="due" || request.body.paymentStatus=="no_payment_required" || request.body.paymentStatus=="past_due")){
        
        response.status(400)
        response.json()
        var total=new Date().getTime()-start;
        client.timing('createBill_fail', total);
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
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('createBill_fail', total);
                        return
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        const uuidv1 = require('uuid/v1');
                        var newid=uuidv1();
                        const sql=`INSERT INTO \`Bill\`(\`id\`, \`owner_id\`, \`vendor\`, \`bill_date\`, \`due_date\`, \`amount_due\`, \`categories\`, \`paymentStatus\`) VALUES ('${newid}','${data.rows[0].ID}','${request.body.vendor}','${request.body.bill_date}','${request.body.due_date}','${request.body.amount_due.toFixed(2)}','${jsonListToCsv(request.body.categories)}',"${request.body.paymentStatus}");`
                        // console.log(sql)
                        
                        query(sql).then(function (data) {
                            query(`SELECT * FROM Bill WHERE id='${newid}'`).then(function (data){
                                response.status(201)
                                data.rows[0].categories=csvToJsonList(data.rows[0].categories)
                                response.json(data.rows[0])
                                var total=new Date().getTime()-start;
                                client.timing('createBill_success', total);
                                return
                            })
                            
                            
                            
                            
                        }).catch(renderErrorResponse(response))
                        // response.status(400)
                        // response.json()                    
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('createBill_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('createBill_fail', total);
                return
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
    client.increment('getBillCall');
    logger.info('getBillCall')
    var start=new Date().getTime()
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('getBill_fail', total);
        return 
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBill_fail', total);
                        return
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        const sql=`SELECT * FROM Bill WHERE owner_id='${data.rows[0].ID}' AND id='${request.params.id}'`
                        //// console.log(sql)
                        query(sql).then(function (data) {
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                var total=new Date().getTime()-start;
                                client.timing('getBill_fail', total);
                                return;
                            }
                            response.status(200)
                            data.rows[0].categories=csvToJsonList(data.rows[0].categories)
                            
                            
                            response.json(data.rows[0])
                            var total=new Date().getTime()-start;
                            client.timing('getBill_success', total);
                        })                      
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBill_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('getBill_fail', total);
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
    client.increment('putBillCall');
    logger.info('putBillCall')
    var start=new Date().getTime()
    var credentials = auth(request)
    if(!(request.body.paymentStatus=="paid" || request.body.paymentStatus=="due" || request.body.paymentStatus=="no_payment_required" || request.body.paymentStatus=="past_due" || request.body.paymentStatus=="" ||request.body.paymentStatus==null)){
        
        response.status(400)
        response.json()
        var total=new Date().getTime()-start;
        client.timing('putBill_fail', total);
        return
    }
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('putBill_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('putBill_fail', total);
                        return
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        var owner_id=data.rows[0].ID
                        var ticketid=request.params.id
                        const sql=`SELECT * FROM Bill WHERE owner_id='${owner_id}' AND id='${ticketid}'`
                        
                        //// console.log(sql)
                        query(sql).then(function (data) {
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                var total=new Date().getTime()-start;
                                client.timing('putBill_fail', total);
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
                            // console.log(sql)
                            origindata.vendor=request.body.vendor;
                            origindata.bill_date=request.body.bill_date;
                            origindata.due_date=request.body.due_date;
                            origindata.amount_due=request.body.amount_due.toFixed(2);
                            origindata.categories=request.body.categories;
                            origindata.paymentStatus=request.body.paymentStatus;
                            
                            query(sql).then(function (data) {
                                if(data.err!=null)
                                {
                                    response.status(400)
                                    response.json();
                                    var total=new Date().getTime()-start;
                                    client.timing('putBill_fail', total);
                                }
                                response.status(200)                            
                                response.json(origindata)
                                var total=new Date().getTime()-start;
                                client.timing('putBill_success', total);
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
                        var total=new Date().getTime()-start;
                        client.timing('putBill_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('putBill_fail', total);
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
    client.increment('deleteBillCall');
    logger.info('deleteBillCall')
    var start=new Date().getTime()
    var credentials = auth(request)
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('deleteBill_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(400)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('deleteBill_fail', total);
                        return
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        //login successfully, return data
                        var ticketid=request.params.id
                        var owner_id=data.rows[0].ID
                        const sql=`SELECT * FROM \`Bill\` WHERE owner_id='${owner_id}' AND id='${ticketid}'`
                        query(sql).then(function(data){
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                var total=new Date().getTime()-start;
                                client.timing('deleteBill_fail', total);
                                return;
                            }
                            else{
                                const sql=`SELECT * FROM \`attachment\` WHERE id='${data.rows[0].attachment_id}'`
                                
                                query(sql).then(function (data) {
                                    if(data.rows[0]!=undefined){
                                        try{
                                            console.log(data.rows[0].url)
                                            s3File.delete(data.rows[0].url)
                                        }
                                        catch(err){
                                            console.log("no file")
                                        }
                                        const sql=`DELETE FROM \`attachment\` WHERE id='${data.rows[0].id}'`
                                        
                                        query(sql).then(console.log(sql))
                                    }
                                    
                                    const sql=`DELETE FROM \`Bill\` WHERE id='${ticketid}'`                                
                                //// console.log(sql)
                                    query(sql).then(function (data) {
                                        response.status(204)                            
                                        response.json()
                                        var total=new Date().getTime()-start;
                                        client.timing('deleteBill_fail', total);
                                        return
                                })      
                                })
                                                
                                return
                            }
                            
                        }).catch(renderErrorResponse)
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('deleteBill_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('deleteBill_fail', total);
                return
            }            
        }).catch(renderErrorResponse(response));
    }
};

/**
 * Returns a members object in JSON.1
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.postAttachment = function (request, response) {
    client.increment('postAttachmentCall');
    logger.info('postAttachmentCall')
    var start=new Date().getTime()
    var formidable = require("formidable")
    var form = new formidable.IncomingForm();
    form.maxFieldsSize = 10 * 1024 * 1024; //10 M maxinum
    form.keepExtensions = true; 
    form.uploadDir =  './tmp';
    form.hash = 'md5'
    var file
    //console.log(request.file)
    form.parse(request,function(err,fields,file){
        if(err){
            response.status(400);
            response.json("");
            var total=new Date().getTime()-start;
            client.timing('postAttachment_fail', total);
            return
        }
        if(file.files==undefined){
            response.status(400);
            response.json("");
            var total=new Date().getTime()-start;
            client.timing('postAttachment_fail', total);
            return
        }
        //console.log(file);
        // get the file
        var filePath = '';
        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
        if(file.tmpFile){
            filePath = file.tmpFile.path;
        } else {
            for(var key in file){
                if( file[key].path && filePath==='' ){
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移动的目录文件夹，不存在时创建目标文件夹
        var targetDir =  './upload';
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));
        //判断文件类型是否允许上传
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            var err = new Error('type of file error');
            response.status(400);
            response.json("");
            var total=new Date().getTime()-start;
            client.timing('postAttachment_fail', total);
        } else {
            //以当前时间戳对上传文件进行重命名
                        
            
            const uuidv1 = require('uuid/v1');
           
            //console.log(originname)
            var newid=uuidv1();
            var fileName = newid + fileExt;
            
            var targetFile = targetDir +"/"+ fileName;
            //console.log(targetFile)
            var MD5= file.files.hash;
            var size=file.files.size;
            var modified=file.files.lastModifiedDate;
            var originname=file.files.name
            var credentials = auth(request)
            if (!credentials) {
                response.statusCode = 401
                response.json();
                var total=new Date().getTime()-start;
                client.timing('postAttachment_fail', total);
                return
            } else {
                //user existance check
                query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
                    if(data.rows[0]!=undefined)
                    {
                        //user exist
                        //// console.log(data.rows[0])
                        bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                            //// console.log(data.rows[0].password)
                            if(err) {
                                //server error...
                                response.status(400)
                                response.json("")
                                var total=new Date().getTime()-start;
                                client.timing('postAttachment_fail', total);
                                return
                                //// console.log('Comparison error: ', err);
                            }
                            if(res){
                                //login successfully, return data
                                
                                query(`SELECT * FROM Bill WHERE id='${request.params.id}' AND owner_id='${data.rows[0].ID}'`).then(function(data){
                                    
                                    if(data.rows[0]!=undefined){
                                        //bill exists
                                        
                                        if(data.rows[0].attachment_id==null){  
                                            //bill doesnt have attachment       
                                            // if(!1){
                                            //     response.status(400)
                                            //     response.json()
                                            //     return
                                            // } 
                                            logger.debug(s3File.upload(filePath,fileName))
                                            const sql=`INSERT INTO \`attachment\`(\`id\`, \`file_name\`, \`url\`,\`MD5\`,\`lastModifiedDate\`,\`SIZE\`) VALUES ('${newid}','${originname}','${fileName}','${MD5}','${modified}','${size}')`
                                            // console.log(sql)
                                            
                                            query(sql).then(function (data) { 
                                                query(`UPDATE \`Bill\` SET \`attachment_id\`='${newid}' WHERE id='${request.params.id}'`).then(function(data){     query(`SELECT * FROM \`attachment\` WHERE id='${newid}'`).then(function (data){
                                                        //移动文件   
                                                                                                        
                                                        response.status(201)                                                    
                                                        response.json(data.rows[0])
                                                        var total=new Date().getTime()-start;
                                                        client.timing('postAttachment_success', total);
                                                        return
                                                    }).catch(renderErrorResponse)
                                                }).catch(renderErrorResponse)                                              
                                                
                                            }).catch(renderErrorResponse)
                                        }
                                        else{
                                            response.status(400)
                                            response.json("")
                                            var total=new Date().getTime()-start;
                                            client.timing('postAttachment_fail', total);
                                            return
                                        }
                                                           
                                        return
                                    }
                                    else{
                                        response.status(404)
                                        response.json("")
                                        var total=new Date().getTime()-start;
                                        client.timing('postAttachment_fail', total);
                                        return
                                    }

                                }).catch(renderErrorResponse)
                            }
                            else
                            {
                                //password wrong
                                response.status(401)
                                response.json()
                                var total=new Date().getTime()-start;
                                client.timing('postAttachment_fail', total);
                                return
                            }                    
                        })                
                        return;
                    }
                    else{
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('postAttachment_fail', total);
                        return
                    }            
                }).catch(renderErrorResponse(response));
            }
                    
        }
        
    });
    
    //console.log(request.body)
    
    
};

/**
 * Returns a billattachment object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.getBillAttachment = function (request, response) {
    client.increment('getBillAttachmentCall');
    logger.info('getBillAttachmentCall')
    var start=new Date().getTime()
    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('getBillAttachment_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBillAttachment_fail', total);
                        return
                        //// console.log('Comparison error: ', err);
                        //
                    }
                    if(res){
                        //login successfully, return data
                        const sql=`SELECT * FROM attachment WHERE id='${request.params.fileid}' AND id IN( SELECT attachment_id FROM Bill WHERE owner_id='${data.rows[0].ID}' AND id='${request.params.billid}')`
                        //console.log(sql)
                        query(sql).then(function (data) {
                            //console.log(data)
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                var total=new Date().getTime()-start;
                                client.timing('getBillAttachment_fail', total);
                                return;
                            }
                            else{
                                response.status(200)                                              
                                response.json(data.rows[0])
                                var total=new Date().getTime()-start;
                                client.timing('getBillAttachment_success', total);
                                return
                            }
                            
                        }).catch(renderErrorResponse);          
                                
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('getBillAttachment_success', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('getBillAttachment_success', total);
            }            
        }).catch(renderErrorResponse(response));
    }
};

/**
 * Returns a billattachment object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.deleteBillAttachment = function(request, response){
    client.increment('deleteBillAttachmentCall');
    logger.info('deleteBillAttachmentCall')
    var start=new Date().getTime();

    var credentials = auth(request)
    
    if (!credentials) {
        response.statusCode = 401
        response.json();
        var total=new Date().getTime()-start;
        client.timing('deleteBillAttachment_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('deleteBillAttachment_fail', total);
                        //// console.log('Comparison error: ', err);
                        //
                    }
                    if(res){
                        //login successfully, return data
                        const sql=`SELECT * FROM attachment WHERE id='${request.params.fileid}' AND id IN( SELECT attachment_id FROM Bill WHERE owner_id='${data.rows[0].ID}' AND id='${request.params.billid}')`
                        console.log(sql)
                        query(sql).then(function (data) {
                           
                            if(data.rows[0]==undefined){
                                response.status(404);
                                response.json();
                                var total=new Date().getTime()-start;
                                client.timing('deleteBillAttachment_fail', total);
                                return;
                            }
                            else{
                                
                                s3File.delete(data.rows[0].url)
                                query(`DELETE FROM attachment WHERE id='${data.rows[0].id}'`).then(function(){
                                    response.status(204)                                              
                                    response.json(data.rows[0])
                                    var total=new Date().getTime()-start;
                                    client.timing('deleteBillAttachment_success', total);
                                    return
                                }).catch(renderErrorResponse)                                
                                return
                            }
                            
                        }).catch(renderErrorResponse);          
                                
                        return
                    }
                    else
                    {
                        //password wrong
                        response.status(401)
                        response.json()
                        var total=new Date().getTime()-start;
                        client.timing('deleteBillAttachment_fail', total);
                        return
                    }                    
                })                
                return;
            }
            else{
                response.status(401)
                response.json()
                var total=new Date().getTime()-start;
                client.timing('deleteBillAttachment_fail', total);
            }            
        }).catch(renderErrorResponse(response));
    }
};
/**
 * Returns a billattachment object in JSON.
 *
 * @param {request} {HTTP request object}
 * @param {response} {HTTP response object}
 */
exports.getByDue = function(request,response){
    response.status=200
    response.json()
    var start=new Date().getTime();
    client.increment('getByDueCall');
    logger.info('getByDueCall')
    var credentials = auth(request)    
    if (!credentials) {
        var total=new Date().getTime()-start;
        client.timing('getByDue_fail', total);
        return
    } else {
        //user existance check
        query(`SELECT * FROM user WHERE email_address='${credentials.name}'`).then(function (data) {
            if(data.rows[0]!=undefined)
            {
                //user exist
                //// console.log(data.rows[0])
                bcrypt.compare(credentials.pass,data.rows[0].password,function(err, res) {
                    //// console.log(data.rows[0].password)
                    if(err) {
                        //server error...
                        var total=new Date().getTime()-start;
                        client.timing('getByDue_fail', total);
                        //// console.log('Comparison error: ', err);
                    }
                    if(res){
                        var params={
                            MessageBody: "A request",
                            DelaySeconds: 0,
                            QueueUrl: process.env.Queue,
                            MessageAttributes: {
                                "owner_id": {
                                  DataType: "String",
                                  StringValue: data.rows[0].ID
                                },
                                "xday": {
                                  DataType: "Number",
                                  StringValue: request.params.x
                                },
                                "email":{
                                    DataType: "String",
                                    StringValue: credentials.name
                                }
                            },
                        }
                        SQS.sendMessage(params)
                        var total=new Date().getTime()-start;
                        client.timing('getByDue_success', total);
                    }
                })
            }
        })
    }
}


/**
 * Throws error if error object is present.
 *
 * @param {Response} response The response object
 * @return {Function} The error handler function.
 */
let renderErrorResponse = (response) => {
    const errorCallback = (error) => {
        if (error) {
            logger.error(error.message)
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