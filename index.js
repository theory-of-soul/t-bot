const TelegramBot = require('node-telegram-bot-api');
const $ = require('cheerio');
const puppeteer = require('puppeteer');

const authData = require('./constants.json');

const TOKEN = authData.token;
const LOGIN_RUTRACKER = authData.login;
const PASSWORD_RUTRACKER = authData.password;

const RUTRACKER_FIND_URL = 'https://rutracker.org/forum/login.php?redirect=tracker.php?nm=';

const bot = new TelegramBot(TOKEN, {polling: true});

const findRequestOnRutracker = (searchText, chatId) => {
  puppeteer
    .launch({headless: true})
    .then((browser) => {
      return browser.newPage();
    }).then(async (page) => {
    await page.goto(RUTRACKER_FIND_URL + encodeURIComponent(searchText));
    await page.type('.forumline [name="login_username"]', LOGIN_RUTRACKER);
    await page.type('.forumline [name="login_password"]', PASSWORD_RUTRACKER);
    await page.click('.forumline [name="login"]');
    await page.waitFor('.forumline');
    return await page.content()
  }).then((html) => {
    const result = $('.tCenter a.tLink', html);

    result.each((i, elem) => {
      if (i < 6) {
        bot.sendMessage(chatId, (i + 1) + '. ' + $(elem.children).text());
      }
    })
  }).catch((err) => {
    console.log('err', err)
  })
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Добро пожаловать");
  bot.sendMessage(msg.chat.id, "Чтобы начать поиск введите /find и запрос");
});

bot.onText(/\/find (.+)/, (msg, match) => {

  if (match[1]) {
    bot.sendMessage(msg.chat.id, `Ищу: ` + match[1]);
    findRequestOnRutracker(match[1], msg.chat.id);
  } else {
    bot.sendMessage(msg.chat.id, `Строка не должна быть пустой`);
  }
});