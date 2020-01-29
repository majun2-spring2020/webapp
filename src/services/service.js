//this file is operation for mysql
var mysql=require("mysql")
//mysql config
var pool = mysql.createPool({
    host: "localhost",
    user: "majun",
    password: "qwer1234",
    database: "majun"
});
/**
 * @param sql sentence for mysql
 * @returns promise for sql query
 */
module.exports=function (sql) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                conn.query(sql,function(err,rows,fields){
                    //release the connection
                    conn.release();
                    //for promise callback
                    resolve({"err":err,
                            "rows":rows,
                            "fields":fields});
                });
            }
        });
    });
};