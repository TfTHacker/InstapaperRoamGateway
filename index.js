const instapaper = require('./instapaper')
const express = require('express');
const app = express();
const url = require("url");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Roam42 SmartBlock gateway between Roam and InstaPaper')
});

app.get('/test', function(request,response){
	response.send({test: 'Server running' })
})

app.get('/gettoken', async function(request,response){
	const client = new instapaper(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
	client.setUserCredentials(process.env.USERNAME, process.env.PASSWORD)
	const token = await client.getOAuthTokenAndSecret();
	response.send(token);
})

// Following functions expect
// username and password as url's on the GET 

const configClient = async (params)=>{
	const client = new instapaper(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
	client.setUserCredentials(params.username, params.password);
	return client;
}

app.get('/unread', async function(request,response){
	const params = url.parse(request.url,true).query;
	const client = await configClient(params);
	const rawResults = await client._request('/api/1/bookmarks/list', {folder_id: 'unread'} );
	let results = rawResults.data.map(r => r);
	response.send(results);
})

app.get('/highlights', async function(request,response){
	var params = url.parse(request.url,true).query;
	if(params.id) {
		const client = await configClient(params);
		try{
			const results = (await client._request('/api/1.1/bookmarks/' + params.id + '/highlights'));
			let highlights = results.data.map(h => h);
			response.send(highlights);
		} catch(e) {
			response.send('invalid bookmark id');
			console.log(e)
		}
	} else {
		response.send('missing parameter id');
	}
})


app.listen(3000, () => {
  console.log('server started');
});