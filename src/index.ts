import {SlackAdapter, SlackEventMiddleware, SlackMessageTypeMiddleware} from 'botbuilder-adapter-slack';
import {Botkit, BotkitConfiguration} from 'botkit';
import dotenv from 'dotenv';
import {Request, Response} from 'express';

dotenv.config();

const getTokenForTeam = async (teamId: string): Promise<any> => {
  if (tokenCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(tokenCache[teamId]);
      }, 150);
    });
  } else {
    // tslint:disable-next-line
    console.error('Team not found in tokenCache: ', teamId);
  }
};

const getBotUserByTeam = async (teamId: string): Promise<any> => {
  if (userCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userCache[teamId]);
      }, 150);
    });
  } else {
    // tslint:disable-next-line
    console.error('Team not found in userCache: ', teamId);
  }
};

const slackConfig = {
  botToken: process.env.BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
  redirectUri: `${process.env.TUNNEL_LINK}/install/auth`,
  verificationToken: process.env.VERIFICATION_TOKEN,
};

const adapter = new SlackAdapter({
  enable_incomplete: true,
  botToken: slackConfig.botToken,
  clientId: slackConfig.clientId,
  clientSecret: slackConfig.clientSecret,
  clientSigningSecret: slackConfig.clientSigningSecret,
  getBotUserByTeam,
  getTokenForTeam,
  redirectUri: slackConfig.redirectUri,
  scopes: ['bot'],
  verificationToken: slackConfig.verificationToken,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());

const configuration: BotkitConfiguration = {
  adapter,
  webserver_middlewares: [],
};

const controller: Botkit = new Botkit(configuration);

const tokenCache: any = {};
const userCache: any = {};

controller.webserver.get('/', (_: Request, res: Response) => {
  res.send(`This app is running Botkit ${controller.version}.`);
});

controller.middleware.receive.use(function(_:any, message:any, next:any) {

  // log it
  console.log('RECEIVED: ', message);

  // modify the message
  message.logged = true;

  // continue processing the message
  next();

});


// Create a route for the install link.
// This will redirect the user to Slack's permission request page.
controller.webserver.get('/install', (_: Request, res: Response) => {
  res.redirect(controller.adapter.getInstallLink());
});

// Create a route to capture the results of the oauth flow.
// this URL should match the value of the `redirectUri` passed to Botkit.
controller.webserver.get('/install/auth', async (req: Request, res: Response) => {
  try {
    const results = await controller.adapter.validateOauthCode(req.query.code);

    // tslint:disable-next-line
    console.log('FULL OAUTH DETAILS', results);

    // Store token by team in bot state.
    tokenCache[results.team_id] = results.bot.bot_access_token;

    // Capture team to bot id
    userCache[results.team_id] = results.bot.bot_user_id;

    res.json('Success! Bot installed.');
  } catch (err) {
    // tslint:disable-next-line
    console.error('OAUTH ERROR:', err);

    res.status(401);
    res.send(err.message);
  }
});

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
  controller.loadModule(__dirname + '/features');
});
