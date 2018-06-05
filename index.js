const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const token = process.env.ACCESS_TOKEN || 'EAADE5cASRWIBAJZAUVOUhFg94svEMalArnf4qMr4CRJZBVFIubiTS8rybILtSJ1nmyvAkw8HZCOSDSBZBJJXYlEFVMLkaQN1afFrcaQl1D8wYi3J3W8UsIdiTwWRriWah0X9sbGeZCPlSNCKdZAgdu1v653V5ZC1UMaz5ZBqqo3tqwZDZD';

app.get('/', function (req, res) {
    res.send('Hey!');
});

app.get('/webhock', function (req, res) {
    if (req.query['hub.verify_token'] === 'facebookchatbot') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Wrong token');
});

app.post('/webhock', function(req, res) {
    let messaging_events = req.body.entry[0].messaging;
    messaging_events.forEach(event => {
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            decideMessage(sender, text);            
            // sendText(sender, 'Text echo: ' + text.substring(0, 100));
        } else if (event.postback) {
            let text = JSON.stringify(event.postback);
            decideMessage(sender, text);
        }
    });
    res.sendStatus(200);
});

function decideMessage(sender, text1) {
    let text = text1.toLowerCase();
    if (text.includes('summer')) {
        sendImageMessage(sender);
    } else if (text.includes('winter')) {
        sendGeniricMessage(sender);
    } else {
        sendText(sender, 'I like Fall');
        sendButtonMessage(snder, 'what is your favorite season?');
    }
}

function sendText(sender, text) {
    let messageData = {
        text: text
    };
    sendRequest(sender, messageData);
}

function sendButtonMessage(sender, text) {
    let messageData = {"attachment": {
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": text,
          "buttons":[
            {
              "type":"postback",
              "title":"Summer",
              "payload":"summer"              
            },
            {
                "type":"postback",
                "title":"Winter",
                "payload":"winter"                
            }
          ]
        }
      }
    };

    sendRequest(sender, messageData);
}

function sendImageMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
               "template_type": "media",
               "elements": [
                  {
                     "media_type": "<image>",
                     "attachment_id": "https://picsum.photos/200/300"
                  }
               ]
            }
        }
    };

    sendRequest(sender, messageData);    
}

function sendGeniricMessage(sender) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements":[
                 {
                  "title":"Winter!",
                  "image_url":"https://picsum.photos/200/300",
                  "subtitle":"I Love Winter",
                  "buttons":[
                    {
                      "type":"web_url",
                      "url":"https://petersfancybrownhats.com",
                      "title":"View Website"
                    }            
                  ]      
                }
              ]
            }
        }
    };

    sendRequest(sender, messageData);
}

function sendRequest(sender, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log('sender error');
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('running: port');
});