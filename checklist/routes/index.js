var express = require('express');
var router = express.Router();
var Database = require('somewhere'),
 collection = 'nouns',
 dbPath = '/var/somewhere2/database.json';


/* GET home page. */

router.get('/', function(req, res) {
  var database = new Database(dbPath);
  res.render('index', {
		found: database.find(collection, {found: true}),
		unfound: database.find(collection, {found: false})
	});
});

module.exports = router;
