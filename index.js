'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const hatManager = require('./hatManager');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3080, () => {
  console.log('Listening on port %d', server.address().port);
 });


// Slack Auth


// Sorting Hat Slash Command

app.get('/', (req, res)=> {
  handleQuery(req.query, res);
})

app.post('/', (req, res) => {
  handleQuery(req.body, res);
});

function handleQuery(q, res){
  if (q.text){
    let name = q.text;

    if(! /^[a-z]+$/i.test(name)){ //contains digits or special chars
      res.send("For only letters in your name, the Sorting Hat does plead. Digits and fancy characters, I'm afraid I cannot read. 🙈");
      return;
    }


    let house = hatManager.getHogwartsHouse(name);

    let image = 'https://sorting-hat.co/' + house;
    let data = {
      response_type: 'in_channel', // public to the channle
      text: name + ': ' + house,
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
        text: 'Type a your name after the command, e.g. `/sortinghat Lily Potter`',
      }
    ]};
    res.json(data);
  }
}
