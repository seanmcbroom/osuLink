const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { GuildHandler } = require('./Modules/GuildHandler');
const { UserHandler } = require('./Modules/UserHandler');
const { InteractionHandler } = require('./Modules/InteractionHandler');

const { osu } = require('../Modules/osu');
const { REST } = require('@discordjs/rest');
const { Firebase } = require('./Modules/Datastore')

const Settings = require('../settings.js');

class Client extends AkairoClient {
  constructor() {
    super({
      ownerID: Settings.Owners,
    }, {
      intents: 525
    });

    this.interactionHandler = new InteractionHandler(this, {
      directory: './Client/Commands',
    })

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './Client/Inhibitors',
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: './Client/Listeners',
    });

    this.guildHandler = new GuildHandler(this, {
      DataFormat: Settings.DataFormats.Guild,
    });

    this.userHandler = new UserHandler(this, {
      DataFormat: Settings.DataFormats.User,
    })

    this.REST = new REST({ version: '9' }).setToken(Settings.BotToken);

    this.Database = new Firebase({
      FirebaseLogin: Settings.Firebase,
    })

    this.osu = new osu({
      apiKey: Settings.osuApiKey,
      beatmapsDirectory: './Components/beatmaps'
    })

    this.interactionHandler.useInhibitorHandler(this.inhibitorHandler);

    this.interactionHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.mainColor = '#9bc8fa';

    this.once('ready', this.setup);
  }

  async setup() {
    console.log(`Online as ${this.user.tag}`);
    this.user.setActivity('osu!', { type: 'PLAYING' });
  }
}

const client = new Client();
client.login(Settings.BotToken);
