'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const hatManager = require('./hatManager');
const request = require('request');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(process.env.PORT || 3080, () => {
  console.log('Listening on port %d', server.address().port);
});


// Slack Auth

app.get('/slack', function(req, res){
  if (!req.query.code) { // access denied
    res.redirect('http://sorting-hat-bot.herokuapp.com/sort');
    return;
  }
  var data = {form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
  }};
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Get an auth token
      let token = JSON.parse(body).access_token;

      // Get the team domain name to redirect to the team URL after auth
      request.post('https://slack.com/api/team.info', {form: {token: token}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if(JSON.parse(body).error == 'missing_scope') {
            res.send('Sorting Hat has been added to your team!');
          } else {
            let team = JSON.parse(body).team.domain;
            res.redirect('http://' +team+ '.slack.com');
          }
        }
      });
    }
  })
});

// Sorting Hat Slash Command

app.get('/', (req, res)=> {
  handleQuery(req.query, res);
});

app.post('/', (req, res) => {
  handleQuery(req.body, res);
});

function handleQuery(q, res){
  if (q.text){
    let name = q.text;

    if(! /^[a-z ]+$/i.test(name)){ //contains digits or special chars
      res.send("For only letters in your name, the Sorting Hat does plead. Digits and fancy characters, I'm afraid I cannot read. 🙈");
      return;
    }


    let house = hatManager.getHogwartsHouse(name);

    let image = `https://sorting-hat-bot.herokuapp.com/images/${house.name}.jpg`;
    let data = {
      response_type: 'in_channel', // public to the channel
      mrkdwn: true,
      attachments:[
      {
        "image_url": `${image}`,
        "color": "#34a5c6",
        "author_name": `${name}`,
        "pretext": "You belong in...",
        "title": `${house.title}`,
        "text": `${house.body}`,
        "footer": "Sorting Hat",
        "footer_icon": "https://sorting-hat-bot.herokuapp.com/images/sortingHat.png"
      }
    ]};
    res.json(data);

  } else {
    let data = {
      response_type: 'ephemeral', // private message
      text: 'How to use /sortinghat command:',
      attachments:[
      {
        text: 'Type a your name after the command, e.g. `/sortinghat Lily Potter` or `/sortinghat Dobby`',
      }
    ]};
    res.json(data);
  }
}

// Routes - Index
app.get('/sort', (req, res)=>{
  res.sendFile(path.join(__dirname+'/index.html'));
});
