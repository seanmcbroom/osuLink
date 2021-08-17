const { Inhibitor } = require('discord-akairo');

const blacklist = [];

class BlacklistInhibitor extends Inhibitor {
  constructor() {
    super('blacklist', {
      reason: '‼‼⚠ **YOU ARE BLACKLISTED** ‼⚠‼🤡⚠‼🤡‼🤡',
      type: 'pre'
    });
  }

  exec(interaction) {
    return blacklist.includes(interaction.user.id);
  }
}

module.exports = BlacklistInhibitor;