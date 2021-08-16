const Settings = {
    Owners: [517529173061795840, 866759411267141682],

    DataFormats: {
        User: {
            Language: "EN",
            osuID: null
        },

        Guild: {
            NicknameEnabled: false,
            NicknameFormat: "${USERNAME}",
            VerifiedRole: null,
            RoleBinds: {},
            Prefix: "osu!"
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