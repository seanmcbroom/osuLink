const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { GuildHandler } = require('./Modules/GuildHandler');
const { UserHandler } = require('./Modules/UserHandler');
const { InteractionHandler } = require('./Modules/InteractionHandler');

const { osu } = require('../Modules/osu');
const { Firebase } = require('./Modules/Datastore')

const Settings = require('../settings.js');

class Client extends AkairoClient {
  constructor() {
    super({
      ownerID: Settings.Owners,
    }, {
      intents: 3
    });

    this.Settings = Settings;

    this.interactionHandler = new InteractionHandler(this, {
      directory: './src/Client/Commands',
    })

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: './src/Client/Inhibitors',
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: './src/Client/Listeners',
    });

    this.guildHandler = new GuildHandler(this, {
      DataFormat: Settings.DataFormats.Guild,
    });

    this.userHandler = new UserHandler(this, {
      DataFormat: Settings.DataFormats.User,
    })

    this.Database = new Firebase({
      FirebaseLogin: Settings.Firebase,
    })

    this.osu = new osu({
      apiKey: Settings.osuApiKey,
      beatmapsDirectory: './src/Components/beatmaps'
    })

    this.interactionHandler.useInhibitorHandler(this.inhibitorHandler);

    this.interactionHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();

    this.once('ready', this.setup);
  }

  async setup() {
    console.log(`Online as ${this.user.tag}`);
    this.user.setActivity('osu!', { type: 'PLAYING' });
  }
}

const client = new Client();
client.login(Settings.BotToken);