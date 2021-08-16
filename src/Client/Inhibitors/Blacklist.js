const { Inhibitor } = require('discord-akairo');

const blacklist = [
  '302818411547983884'
];

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