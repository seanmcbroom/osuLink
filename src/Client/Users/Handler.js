const User = require('./User');

class UserHandler {
    /**
     * Creates a new user handler
     * @param {Object} client Akairo Client
     * @param {Object} options Handler options
     */
    constructor(client, options = {}) {
        const {
            DataFormat = {}
        } = options;

        /**
         * Akairo Client
         * @type {Object}
         */
        this.client = client;

        /**
         * User cache storage
         * @type {Map<string, User>}
         */
        this.users = new Map();

        this.DataFormat = DataFormat;

        this.client.once('ready', () => {
            this.setup();
        });
    }

    /**
     * Setup handler
     * @returns {void}
     */
    setup() {
        this.client.on('guildMemberAdd', (member) => {
            this.add(member.id);
        })

        this.client.on('guildMemberRemove', (member) => {
            if (!this.isUserInAGuild(member.id)) {
                this.delete(member.id);
            }
        });
    }

    /**
     * Add user to handler
     * @param {string} id 
     * @returns {User}
     */
    add(id) {
        const user = this.users.get(id);
        const discordUser = this.client.users.cache.get(id);

        if (!user && !discordUser.bot) {
            const user = new User(this, discordUser, {
                DataFormat: this.DataFormat
            });

            this.users.set(id, user);

            return user;
        }
    }

    /**
     * Remove user from handler
     * @param {string} id 
     * @returns {void}
     */
    delete(id) {
        return this.users.delete(id);
    }

    /**
     * Get user from handler
     * @param {string} id 
     * @returns {void}
     */
    get(id) {
        return this.users.get(id) || this.add(id);
    }

    /**
     * Loads all users in the guild cache.
     * @returns {void}
     */
    loadAll() {
        for (const guild of this.client.guilds._cache) {
            for (const member of guild[1].members._cache) {
                this.add(member[1].id);
            }
        }
    }

    /**
     * Checks for user in all cached guild members.
     * @param {string} id 
     * @returns {boolean}
     */
    isUserInAGuild(id) {
        for (const guild of this.client.guilds._cache) {
            for (const member of guild[1].members._cache) {
                if (member[1].user.id == id) {
                    return true;
                }
            }
        }

        return false;
    }
}

module.exports = UserHandler;