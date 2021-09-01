const Settings = {
    Owners: [517529173061795840, 866759411267141682],

    Links: {
        Invite: 'https://discord.com/api/oauth2/authorize?client_id=767176248811847691&permissions=2550262800&scope=bot%20applications.commands',
        SupportServer: 'https://discord.gg/K2dTCmJ',
        TopGG: 'https://top.gg/bot/767176248811847691'
    },

    Colors: {
        Main: '#9bc8fa'
    },

    DataFormats: {
        User: {
            osuID: null,
            tracking: {
                bestScores: {},
                pp: 0
            }
        },

        Guild: {
            verifiedRole: null,
            trackingChannel: null,
            trackingWhitelist: {}
        }
    },

    BotToken: process.env.BOT_TOKEN,

    osuApiKey: process.env.OSU_API_KEY,

    Firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: `${process.env.FIREBASE_DATABASE_ID}.firebaseapp.com`,
        databaseURL: `https://${process.env.FIREBASE_DATABASE_ID}.firebaseio.com`,
        storageBucket: `${process.env.FIREBASE_DATABASE_ID}.appspot.com`
    }
}

module.exports = Settings;