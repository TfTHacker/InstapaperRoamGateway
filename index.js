const instapaper = require('./instapaper')
const express = require('express');
const cors = require('cors')
const url = require("url");
const app = express();

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('public')); 

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
	let results = rawResults.data.filter(r =>{ if(r.bookmark_id) return r} );
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

app.get('/addlink', async function(request,response){
	const params = url.parse(request.url,true).query;
	console.log(params)
	const client = await configClient(params);
	const rawResults = await client._request('/api/1/bookmarks/add', {url: params.url } );
	response.send(rawResults);
})




app.listen(3000, () => {
  console.log('server started');
});