var Twitter = require('twitter'),
 request = require('request'),
 dbPath = '/var/somewhere/database.json';

var database = new Database(dbPath);
 
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

function tweetFound(user, match) {
	var message = '🌟🌟🌟 @' + user.screen_name + ' you found a ' + match + ". We're crossing it off the list http://mmmbrain.com";
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
	

function onImageAnalysis(err, matches, tweet) {
	console.log(matches);
	if (!err) {
		Object.keys(matches).forEach(function(key){
			if (matches[key] > 0.9) {
				console.log("You've found " + key);
				tweetFound(tweet.user, key);
			}
		});
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

