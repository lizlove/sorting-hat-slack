'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const hatManager = require('./hatManager');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(3080, () => {
  console.log('Listening on port %d', server.address().port);
});


// Slack Auth


// Routes - Index

app.get('/sort', (req, res)=>{
  res.sendFile(path.join(__dirname+'/index.html'));
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

    let image = `https://sorting-hat.co/images/${house.title}.jpg`;
    let data = {
      response_type: 'in_channel', // public to the channel
      text: `*${name}*: ${house.body}`,
      mrkdwn: true,
      attachments:[
      {
        image_url: image
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
