var Database = require('somewhere');
var fs = require('fs');
var database = new Database('./database.json');

fs.readFile('../labels.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
	var keys = data.split('\n');
	keys.forEach(function(key){
		database.save('nouns', {text: key});
	});
});

