//this file is operation for mysql
var mysql=require("mysql")
//mysql config
var pool = mysql.createPool({
    host: process.env.DBHost || "localhost",
    user: process.env.DBUser || "majun",
    password: process.env.DBPassword || "qwer1234",
    port: process.env.DBport || 3306,
    database: process.env.DBDatabase || "majun"
});
/**
 * @param sql sentence for mysql
 * @returns promise for sql query
 */
const logger=require("../log/logcontroller")
module.exports=function (sql) {
    var start=new Date().getTime()

    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err,conn){
            if(err){
                logger.error(err)
                reject(err);                
            }else{
                conn.query(sql,function(err,rows,fields){
                    //release the connection
                    conn.release();
                    //for promise callback
                    var total=new Date().getTime()-start;
                    client.timing('sqlTime', total);
                    resolve({"err":err,
                            "rows":rows,
                            "fields":fields});
                });
            }
        });
    });
};