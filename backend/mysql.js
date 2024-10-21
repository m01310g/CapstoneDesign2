var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Capstone2@',
  database : 'co_n'
});
 
connection.connect();
 
connection.query('SELECT * FROM user_info', function (error, results, fields) {
  if (error) throw error;
  // console.log('The solution is: ', results[0].solution);
  console.log(results);
});
 
connection.end();