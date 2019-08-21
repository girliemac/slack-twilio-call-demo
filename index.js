/* 
 * Slack x Twilio Showcase
 */

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const slack = require('./slack');
const twilio = require('./twilio');

app.use(bodyParser.json()); // for parsing POST req
app.use(bodyParser.urlencoded({ extended: true }));


/*  Endpoint to receive outbound calls from a caller's phone */

app.post('/receive-call', async (req, res) => {
  const result = await twilio.receiveCall();
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(result);  
});

/* The async callback endpoint when a transcription was finished being created */

app.post('/transcribe', async (req, res) => {
  console.log('transcribed!');
  console.log(req.body);
  const {CallSid, TranscriptionText} = req.body;
  slack.sendTranscription(req.body);
})


/* Botton action from Slack UI to dial back the caller */

app.post('/make-call-from-slack', async (req, res) => {
  //console.log(req.body);
  
  const { token, user, team, actions, message, response_url } = JSON.parse(req.body.payload);
 
  if(actions && actions[0].action_id.match(/phone_call/)) {
    
    // Update the Slack message
    slack.updateMessage(message.blocks, message.ts);
    
    // Make a call with Twilio
    const customerNumber = actions[0].value; // customer number
    const url = `https://${req.headers.host}/outbound-call/${customerNumber}`;
    await twilio.makeCall(url);
    
    // Render the response as XML in reply to the webhook request
    res.sendStatus(200);
    
  } else {
    res.sendStatus(200);
  }
});


/* Endpoint to return TwiML instuctions for the outbound conference call */

app.post('/outbound-call/:number', async (req, res) => {
  const number = req.params.number;
  const result = await twilio.makeOutboundCall(number);
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(result);
});

/* Endpoint to be called when the phone call between prospect and agent ended */

app.post('/completed-call', async (req, res) => {
  // Ideally, as the call ended, the "Calling..." message on Slack should be updated to "Called on 10am 2019-08-01"
  // To implement, match and store the original (very first) Slack message ts and call info, probably caller's phone number
  // Then use the ts to call chat.update Slack API to update the message
});




/* Running Express server */

const server = app.listen(5000, () => {
  console.log('Express web server is running on port %d in %s mode', server.address().port, app.settings.env);
});


