const express = require('express');
const app = express();
const url = require("url")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Roam42 SmartBlock gateway between Roam and InstaPaper')
});

app.get('/test', function(request,response){
	response.send({hi:'test'})
})



app.listen(3000, () => {
  console.log('server started');
});