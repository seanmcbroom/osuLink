const { AkairoClient, InteractionHandler, ListenerHandler } = require('discord-akairo');
const GuildHandler = require('./Guilds/Handler');
const UserHandler = require('./Users/Handler');

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

    this.login(Settings.BotToken);

    this.interactionHandler = new InteractionHandler(this, {
      directory: './src/Client/Commands',
      defaultCommandTags: ['general']
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

    this.interactionHandler.loadAll();
    this.listenerHandler.loadAll();

    this.once('ready', () => {
      this.setup();
    });
  }

  async setup() {
    this.userHandler.loadAll();

    this.user.setActivity('osu!', { type: 'PLAYING' });

    console.log(`[${new Date(Date.now()).toUTCString()}] Logged into "${this.user.tag}"`);
  }
}

new Client();