const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const twilioClient = twilio(accountSid, authToken);


/* Making a phone call to toNumber */

const makeCall = async(url) => { 
  console.log(`Calling an agent...`);
  
  const options = {
    url: url,
    to: process.env.SALES_NUMBER,
    from: `+${twilioNumber}`
  };
  
  const result = await twilioClient.calls.create(options);
  //console.log(result);
};

/* Programmatically making another call to a sales rep, while letting a customer on hold */ 

const makeOutboundCall = async(number) => {
  const twimlResponse = new VoiceResponse();

  //twimlResponse.say("Hello, this is Cal's Cat Clinic calling back. Please hold on while connecting you with our agent shortly.");
  twimlResponse.say("Hello, agent. Please hold on while connecting you with our potential cat parent shortly.");
  
  // calling a sales rep
  twimlResponse.dial({
    record: 'record-from-answer-dual',
    statusCallbackEvent: ['completed'],
    statusCallback: '/completed-call'
  }, number); 
  
  twimlResponse.pause(5);
  return twimlResponse.toString();
}


/* Receiving a call from a physical phone to the app, and record the conversation to transcribe */ 

const receiveCall = async(url) => {
  console.log('A call received.');
  const twiml = new VoiceResponse();

  twiml.say("Hello, thanks for calling Cal's Cat Clinic. Please leave your message, and we will call you back soon.");
  
  // Record and transcribe the caller's message
  // https://www.twilio.com/docs/voice/twiml/record#transcribe

  twiml.record({
      transcribe: true,
      timeout: 4,
      maxLength: 30,
      transcribeCallback: '/transcribe'
  });
  twiml.hangup();
  
  return twiml.toString();
}


/* This function is not used in the app -- Fetch transcriptions later (when not using the callback) */

const fetchTranscript = async() => {
  
  const transcriptions = await twilioClient.transcriptions.list({limit: 20})
  
  // It looks like the newest is unshifted to the beginning of the array!
  const transcription = transcriptions[0];
  
  // Remove the transcription
  //twilioClient.transcriptions(transcriptions[0].sid).remove();
  
  return transcription;
}



module.exports = { makeCall, makeOutboundCall, receiveCall };