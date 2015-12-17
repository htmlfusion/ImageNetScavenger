var _ = require('lodash'),
 Twitter = require('twitter'),
 Database = require('somewhere'),
 request = require('request'),
 collection = 'nouns',
 database = new Database('/var/somewhere/database.json');
 
console.log(collection, database.find(collection, {}))

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

function tweetFound(tweet, foundObject) {
	foundObject.found = true
	foundObject.tweet = tweet;
	database.update(collection, foundObject.id, foundObject);
	var message = '🌟🌟🌟 @' + tweet.user.screen_name + ' you found a ' + foundObject.text + ". We're crossing it off the list http://mmmbrain.com";
  client.post('statuses/update', {status: message},  function(error, tweet, response){
  });
}

function noMatch(user, closest) {
	var message = '💣💣💣 @' + user.screen_name + ' no match!'
	message += " Your closest match was " + closest 
	message += "See whats left to find http://mmmbrain.com";
  client.post('statuses/update', {status: message},  function(error, tweet, response){
  });
}

function alreadyFound(user, winningUser) {
	var message = '🐌🐌🐌 @' + user.screen_name + ' @'+winningUser.screen_name
	message += ' already found that!'
	message += "See whats left to find http://mmmbrain.com";
  client.post('statuses/update', {status: message},  function(error, tweet, response){
  });
}

function bestMatch(matches) {
	var best = _.max(_.pairs(matches), function(pair){return pair[1]})
	return {text: best[0], score: best[1]};
}
	

function onImageAnalysis(err, matches, tweet) {
	console.log(matches);
	if (!err) {
		
		var best = bestMatch(matches);
		console.log(best);
		if (best.score > 0.9) {

			var text = best.text;
			console.log("Best match " + text);
			var foundObject = database.findOne(collection, {text: text});
			console.log('found object', foundObject);
      if (!Object.keys(foundObject).length){
				console.log("Invalid match");
			} else if (!foundObject.found) {
				console.log('found');
			  tweetFound(tweet, foundObject);
			} else {
				console.log('already found');
				alreadyFound(tweet.user, foundObject.tweet.user);
			}

		} else {
		  console.log('no match');
			noMatch(tweet.user, text);
		}
	}
}

client.stream('statuses/filter', {track: process.env.TWITTER_BOT}, function(stream) {

  stream.on('data', function(tweet) {

		if(tweet.entities.media) {
			var mediaUrl = tweet.entities.media[0].media_url,
      	download = request(mediaUrl);
				
			request.post(
				 'http://imagenet/upload',
				 {formData: {upload: download}}, 
				 function(err, httpResponse, body) {
		         onImageAnalysis(err, JSON.parse(body), tweet);
				 }
  		 );
		}
		
	});
 
  stream.on('error', function(error) {
    throw error;
  });

});

