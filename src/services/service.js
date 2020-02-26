//this file is operation for mysql
var mysql=require("mysql")
//mysql config
var pool = mysql.createPool({
    host: process.argv[2] || "localhost",
    user: process.argv[3] || "majun",
    password: process.argv[4] || "qwer1234",
    port:process.argv[5] || 3306,
    database: process.argv[6] || "majun"
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