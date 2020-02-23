const mysql=require("mysql")
var con = mysql.createConnection({
    host: process.argv[2],
    user: process.argv[3],
    password: process.argv[4],
    port:process.argv[5],
});
const database=process.argv[6]
module.exports=function(){
    console.log("bootstrap")

    con.connect(function(err){
        if(err) throw err
        con.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`,function(err,result){
            con.query(`CREATE TABLE IF NOT EXISTS \`${database}\`.\`user\` ( \`ID\` VARCHAR(40) NOT NULL PRIMARY KEY, \`first_name\` TEXT NOT NULL , \`last_name\` TEXT NOT NULL , \`password\` TEXT NOT NULL , \`email_address\` VARCHAR(100) NOT NULL UNIQUE, \`account_created\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \`account_updated\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE = InnoDB;`,function(err,result){
                if(err) throw err
            })
            con.query(`CREATE TABLE IF NOT EXISTS \`${database}\`.\`attachment\` (\`id\` VARCHAR(40) NOT NULL PRIMARY KEY , \`file_name\` TEXT NOT NULL , \`url\` TEXT NOT NULL , \`upload_date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , \`lastModifiedDate\` TEXT NOT NULL , \`SIZE\` INT NOT NULL DEFAULT 0 , \`MD5\` TEXT NOT NULL ) ENGINE = InnoDB;`,function(err,result){
                if(err) throw err
            })
            con.query(`CREATE TABLE IF NOT EXISTS \`${database}\`.\`Bill\` ( \`id\` VARCHAR(40) NOT NULL PRIMARY KEY, \`created_ts\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_ts\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`owner_id\` VARCHAR(40) NOT NULL , \`attachment_id\` VARCHAR(40), \`vendor\` TEXT NOT NULL , \`bill_date\` DATETIME NOT NULL , \`due_date\` DATETIME NOT NULL , \`amount_due\` DOUBLE NOT NULL , \`categories\` TEXT NOT NULL , \`paymentStatus\` ENUM('paid','due','past_due','no_payment_required') , FOREIGN KEY(attachment_id) REFERENCES \`attachment\`(ID) ON DELETE SET NULL, FOREIGN KEY(owner_id) REFERENCES \`user\`(ID) ON DELETE CASCADE) ENGINE = InnoDB`,function(err,result){
                if(err) throw err
            })
        })
        console.log("finish")
    })
    
}