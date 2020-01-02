import {Botkit} from 'botkit';

module.exports = (controller: Botkit) => {
  controller.hears('sample', '  ', async (bot, message) => {
    await bot.reply(message, 'I heard a sample message.');
  });

  controller.hears('hello', 'direct_message', async (bot, message) => {
    await bot.reply(message, 'Hello yourself!');
  });

  controller.on('message', async (bot, message) => {
    await bot.reply(message, `Echo: ${message.text}`);
  });
};
