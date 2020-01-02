Bot-Insightful is a Slack base knowledge base chatbot for questions and answer from Palo IT community

## Frameworks
- Botkit
- Ngrok
- DialogueFlow

## Setting up

### OAuth redirection  and interactive webhook URLs

This is where using the link provided by Ngrok, communication between slack and the bot can be established.

1. Log in to `Slack api` and  go to `your Apps`
2. Go to `Outh &  Permissions` and update the redirection URLs with the Ngrok link
3. Go to `Event Subscriptions` and update the request URL with the Ngrok link

You can inspect the traffic logs going throught Ngrok at [`http://127.0.0.1:4040`](http://127.0.0.1:4040/)

### Event Subscription

The follow events needs to be subscribed for the bot and workspace

Go to `Slack api` → `Event Subscriptions` and assign the following subscriptions to

- Bot events
    - `message.channel`
    - `message.im`
    - `message.groups`
- Workspace events
    - `message.im`

## Starting the application

1. Replace the `TUNNEL_LINK` environment variable with one generated with Ngrok
2. Update [OAuth redirection  and interactive webhook URLs](/#oauth-redirection-and-interactive-webhook-urls)
3. Run `yarn dev:start`