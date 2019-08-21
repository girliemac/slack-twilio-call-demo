# Twilio x Slack Demo
## “Here's my number, so call me maybe” 
*Receiving calls and send the transcriptions to Slack*

---

## Scenario

A customer-would-be is interested in your product/services/whatever, and call the number listed on web/billboard/something. 
The phone is prompted to the company's voicemail.

After a message was left, agents get Slack notifications. An agent can follow up with the prospect by initiating a call from Slack. 

### Scenario for the Live Demo shown at Twilio Signal Conf

![Sccenario](https://cdn.glitch.com/4c3447c6-0721-47ba-9f1c-86ea6b97bcc9%2FScreen%20Shot%202019-08-07%20at%206.48.20%20PM.png?v=1565228933990)

### App Flow

1. Receiving a call to an incoming call endpoint, which prompt to the TwiML voice message
2. The call is recorded, and as soon as the recorded voice is transcribed, the callback is called
3. Use the data with the transcription, a message is created with Block Kit, and sent to a Slack channel via Slack Web API
4. The message contains an actionable button. By clicking it, it initiates a call via Twilio TwiML
5. Twilio initiates a call between the prospect and the agent -When the prospect answers the call, it put her on hold, while connecting to the agent's phone

![App flow](https://cdn.glitch.com/4c3447c6-0721-47ba-9f1c-86ea6b97bcc9%2FScreen%20Shot%202019-08-07%20at%206.50.11%20PM.png?v=1565229041862)
---

## Slack Setup


### :gear: Creating a New Slack App

First, go to [Slack App Creation page](https://api.slack.com/apps) to create an app.


### :key: Getting Your Credentials

Your *Signing Secret* key is at: 
Settings > **Basic information**

If you distribute your app to public, you'll need the Client ID and Client Secret too.

OAuth token should be available after instllation under:
Features > **OAuth & Permissions**

The credential info is stored in the `.env` file. 🗝

```
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

### Scopes

- `bots`

## Twilio Setup

Set your credentials

```
TWILIO_PHONE_NUMBER=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
```

Also, for the convenience (or I am just lazy) I am using a sales rep's number (a physical phone number, non-Twilio number) hard-coded in **.env** file too.

Set up a webhook for "A CALL COMES IN" at 
https://www.twilio.com/console/phone-numbers 

The hook should point to this Glitch URL with `/receive-call` route. In this case, the webhook URL is `https://slack-twilio-call-demo-2.glitch.me/receive-call`

---

## Slide deck at Twilio Signal Conf

https://www.slideshare.net/tomomi/slack-twilio-uniquely-powering-communication
