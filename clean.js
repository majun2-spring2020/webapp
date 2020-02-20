// //原理：
// //子进程并不是bash进程，进程只是一个空间，用来运行某个软件。其中bash就是其中一个软件。
// //spawn函数返回的，就是这个软件的上下文。可以向该上下文发生命令。执行程序。
// var spawn = require('child_process').spawn;//子进程操作模块
// // var subProcess = spawn("/bin/bash");//使用子程序去运行某个软件。在这里就是运行bash软件。并获取其上下文。
// var subProcess = spawn("bash");//使用子程序去运行某个软件。在这里就是运行bash软件。并获取其上下文。

// //消息监听，监听子进程的输出。并在主进程中打印出来。
// function onData(data) {
//     process.stdout.write(data);//获取当前进程，并在输出中写入某内容。关键是process表示的是当前进程
// }
// //整个进程的错误监听
// subProcess.on('error', function () {
//     console.log("error");
//     //console.log(arguments);
// });
// //设置消息监听
// subProcess.stdout.on('data', onData);
// subProcess.stderr.on('data', onData);
// subProcess.on('close', (code) => { console.log(`子进程退出码：${code}`); }); // 监听进程退出
// //向子进程发送命令
// subProcess.stdin.write('sudo mysql<<EOF');   // 写入数据
// subProcess.stdin.write(`CREATE USER 'rose'@'%' IDENDIFIED BY 'qwer1234'`);   // 写入数据
// subProcess.stdin.write('EOF');   // 写入数据
// subProcess.stdin.end();

var exec=require('child_process').exec
exec(`sudo mysql < CREATE USER IF NOT EXISTS 'majun'@'localhost' IDENTIFIED BY 'qwer1234';GRANT ALL ON *.* TO 'majun'@'localhost';CREATE DATABASE IF NOT EXISTS \`majun\`;CREATE TABLE IF NOT EXISTS \`majun\`.\`user\` ( \`ID\` VARCHAR(40) NOT NULL PRIMARY KEY, \`first_name\` TEXT NOT NULL , \`last_name\` TEXT NOT NULL , \`password\` TEXT NOT NULL , \`email_address\` VARCHAR(100) NOT NULL UNIQUE, \`account_created\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \`account_updated\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE = InnoDB;CREATE TABLE IF NOT EXISTS \`majun\`.\`attachment\` (\`id\` VARCHAR(40) NOT NULL PRIMARY KEY , \`file_name\` TEXT NOT NULL , \`url\` TEXT NOT NULL , \`upload_date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , \`lastModifiedDate\` TEXT NOT NULL , \`SIZE\` INT NOT NULL DEFAULT 0 , \`MD5\` TEXT NOT NULL ) ENGINE = InnoDB;CREATE TABLE IF NOT EXISTS \`majun\`.\`Bill\` ( \`id\` VARCHAR(40) NOT NULL PRIMARY KEY, \`created_ts\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_ts\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`owner_id\` VARCHAR(40) NOT NULL , \`attachment_id\` VARCHAR(40), \`vendor\` TEXT NOT NULL , \`bill_date\` DATETIME NOT NULL , \`due_date\` DATETIME NOT NULL , \`amount_due\` DOUBLE NOT NULL , \`categories\` TEXT NOT NULL , \`paymentStatus\` ENUM('paid','due','past_due','no_payment_required') , FOREIGN KEY(attachment_id) REFERENCES \`attachment\`(ID) ON DELETE SET NULL, FOREIGN KEY(owner_id) REFERENCES \`user\`(ID) ON DELETE CASCADE) ENGINE = InnoDB
`,function(err,stdout,stderr){
    if(err) throw err    
})