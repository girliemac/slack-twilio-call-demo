/* 
 * Slack messages handling
 */

const axios = require('axios');
const qs = require('qs');



/* Calling the chat.postMessage method */

const send = async(blocks) => { 

  const args = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: process.env.SLACK_CHANNEL_ID,
    blocks: blocks
  };
  
  const result = await axios.post('https://slack.com/api/chat.postMessage', qs.stringify(args));
  
  try {
    console.log(result.data);
    const ts = result.data.ts;
  } catch(e) {
    console.log(e);
  }
};


/* Posting a transcription to Slack (using Block Kit message structure) */

const sendTranscription = async(data) => { 
  const {From, TranscriptionText, CallSid} = data;
  
  const msg = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*We just received a call!* \nPhone: ${From}\nTranscription:\n_${TranscriptionText}_`
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: `:iphone: Call back`,
          emoji: true
        },
        value: From,
        action_id: `phone_call:${CallSid}`
      }
    },
    {
      type: "context",
		  elements:[
			  {
				  type: "plain_text",
				  text: `CallSID: ${CallSid}`
			  }
      ]
    }
  ];
  
  send(JSON.stringify(msg));

};

/* Update the originally sent Slack message when the Call button is clicked */

const updateMessage = async(blocks, ts, end) => { 
  
  let newBlocks = blocks;
  
  if(!end) {
    newBlocks[0].accessory.action_id = 'phone_call'; // Until we get the disabled-state button, I just have to remove the ID to make it not actionable...
    newBlocks[0].accessory.text.text = ':calling: Calling...';
  } else {
    newBlocks[0].accessory.text.text = ':iphone: Call Ended';
  }
  
  const args = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: process.env.SLACK_CHANNEL_ID,
    ts: ts,
    blocks: JSON.stringify(newBlocks)
  };
  
  const result = await axios.post('https://slack.com/api/chat.update', qs.stringify(args));
  
  try {
    console.log(result.data);   
    
    // Timeout to re-update the message
    // But ideally, it should listen to the call-complete callback, then update
    // See index.js completed-call endpoint
    
    if(!end) {
      const ts2 = result.data.ts;
      
      const sleep = require('util').promisify(setTimeout);
      await sleep(30000);
      
      await updateMessage(newBlocks, ts2, true);
    }
    
  } catch(e) {
    console.log(e);
  }
  
};


module.exports = { sendTranscription, updateMessage };
