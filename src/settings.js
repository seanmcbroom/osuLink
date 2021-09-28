const isProduction = process.env.PRODUCTION === "TRUE";

module.exports = {
    Owners: [517529173061795840, 866759411267141682],

    Links: {
        Invite: isProduction
            ? 'https://discord.com/api/oauth2/authorize?client_id=767176248811847691&permissions=2550262800&scope=bot%20applications.commands'
            : 'https://discord.com/api/oauth2/authorize?client_id=718794018468790293&permissions=2550262800&scope=bot%20applications.commands',
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
                guilds: {},
                bestScores: {},
                pp: 0
            }
        },

        Guild: {
            trackingChannel: null,
            trackingWhitelist: {},
            Binds: {}
        }
    },

    BotToken: isProduction
        ? process.env.BOT_TOKEN
        : process.env.BOT_TOKEN_PTB,

    osuApiKey: process.env.OSU_API_KEY,

    Firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: `${process.env.FIREBASE_DATABASE_ID}.firebaseapp.com`,
        databaseURL: `https://${process.env.FIREBASE_DATABASE_ID}.firebaseio.com`,
        storageBucket: `${process.env.FIREBASE_DATABASE_ID}.appspot.com`
    }
}