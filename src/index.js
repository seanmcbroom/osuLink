require('dotenv').config()

const Discord = require('discord.js');
const Settings = require('./settings');

const ShardingManager = new Discord.ShardingManager('./Client/main.js', {
  token: Settings.BotToken,
});

ShardingManager.spawn();