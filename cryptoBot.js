var Botkit = require('botkit');
const https = require('https');

var config = {debug: true};

var controller = Botkit.slackbot(config);

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

const BTCZAR_URL = 'https://api.mybitx.com/api/1/ticker?pair=XBTZAR';
const ETHZAR_URL = 'https://api.coinmarketcap.com/v1/ticker/?convert=ZAR&limit=2';
const options = ['ZAR', 'Bitcoin currently trading at R', 'Bitcoin price: R', 'R'];

var opt;
var previousBtPrice = 0;
var previousEtPrice = 0;

// Bitcoin listener
controller.hears(['hey', 'hi', 'hello'], 'direct_mention, direct_message, mention', function(bot, message) {
	opt = options[Math.floor((Math.random() * 3) + 1)];
	
	https.get(BTCZAR_URL, (response) => {
		let bitCoinPrice = '';
		let emoji = '';
		response.on('data', (data) => {
			bitCoinPrice = JSON.parse(data.toString()).bid;
			emoji = previousBtPrice < parseFloat(bitCoinPrice) ? ':arrow_up:' : ':arrow_down:';
			bot.reply(message, opt + bitCoinPrice + ' ' + emoji);
			previousBtPrice = parseFloat(bitCoinPrice);
		});
	}).on('error', (err) => { 
		bot.reply(message, 'Oops! Can you try that again?');
	});
});

// ethereum listener
controller.hears(['eth', 'ethereum'], 'direct_mention, direct_message, mention', function(bot, message) {
	opt = options[Math.floor((Math.random() * 3) + 1)];
	
	https.get(ETHZAR_URL, (response) => {
		let ethereumPrice = '';
		let emoji = '';
		let chunks = [];
		response.on('data', (data) => {
			chunks.push(data);
		}).on('end', () => { 
			let res = Buffer.concat(chunks);
			let apiResponse = JSON.parse(res);
			ethereumPrice = parseFloat(apiResponse[1].price_zar);
			emoji = previousEtPrice < ethereumPrice ? ':arrow_up:' : ':arrow_down:';
			bot.reply(message, opt.replace('Bitcoin', 'Ethereum') + ethereumPrice.toFixed(2) + ' ' + emoji);
			previousEtPrice = ethereumPrice;
		});
	}).on('error', (err) => { 
		bot.reply(message, 'Oops! Can you try that again?');
	});
});