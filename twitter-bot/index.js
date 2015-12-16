var Twitter = require('twitter');
var request = require('request');
 
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

function onImageAnalysis(err, httpResponse, body) {
  console.log(err);	
  console.log(body);	
}

client.stream('statuses/filter', {track: process.env.TWITTER_BOT}, function(stream) {

  stream.on('data', function(tweet) {

		if(tweet.entities.media) {
			var mediaUrl = tweet.entities.media[0].media_url,
      	download = request(mediaUrl);
				
			request.post(
				 'http://imagenet/upload',
				 {formData: {upload: download}}, 
				 onImageAnalysis
  		 );
		}
		
	});
 
  stream.on('error', function(error) {
    throw error;
  });

});

