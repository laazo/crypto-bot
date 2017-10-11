var Botkit = require('botkit');
const https = require('https');

var config = {debug: true};

var controller = Botkit.slackbot(config);

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

const BTCZAR_URL = 'https://api.mybitx.com/api/1/ticker?pair=XBTZAR';
var previousPrice = 0;

controller.hears(['hey', 'hi', 'hello'], 'direct_mention, direct_message, mention', function(bot, message) {
	var options = ['ZAR', 'Bitcoin currently trading at R', 'Bitcoin price: R', 'R'];
	var opt = options[Math.floor((Math.random() * 3) + 1)];
	
	https.get(BTCZAR_URL, (response) => {
		let bitCoinPrice = '';
		let emoji = '';
		response.on('data', (data) => {
			bitCoinPrice = JSON.parse(data.toString()).bid;
			emoji = previousPrice < parseFloat(bitCoinPrice) ? ':arrow_up:' : ':arrow_down:';
			bot.reply(message, opt + bitCoinPrice + ' ' + emoji);
			previousPrice = parseFloat(bitCoinPrice);
		});
	}).on('error', (err) => { 
		bot.reply(message, 'Oops! Can you try that again?');
	});
});