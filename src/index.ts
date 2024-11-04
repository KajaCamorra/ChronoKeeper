import { 
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits 
} from 'discord.js';
import { config } from './config';
import { TimezonesData } from './types';
import { Storage } from './storage';
import * as settime from './commands/settime';
import * as time from './commands/time';
import * as yourtime from './commands/yourtime';

class TimezoneBotClient extends Client {
    timezonesData: TimezonesData = {};
    commands = new Collection<string, any>();

    constructor() {
        super({ 
            intents: [GatewayIntentBits.Guilds],
        });
        
        // Initialize commands
        this.commands.set(settime.data.name, settime);
        this.commands.set(time.data.name, time);
        this.commands.set(yourtime.data.name, yourtime);
    }

    async init() {
        // Load saved preferences if they exist
        try {
            this.timezonesData = await Storage.load();
        } catch {
            this.timezonesData = {};
        }

        // Event handler for slash commands
        this.on(Events.InteractionCreate, async interaction => {
            // Handle autocomplete interactions
            if (interaction.isAutocomplete()) {
                const command = this.commands.get(interaction.commandName);
                if (!command || !command.autocomplete) return;

                try {
                    await command.autocomplete(interaction);
                } catch (error) {
                    console.error('Autocomplete error:', error);
                }
                return;
            }

            // Handle regular command interactions
            if (interaction.isChatInputCommand()) {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction, this.timezonesData);
                } catch (error) {
                    console.error('Command execution error:', error);
                    const reply = {
                        content: 'There was an error executing this command!',
                        ephemeral: true
                    };
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(reply);
                    } else {
                        await interaction.reply(reply);
                    }
                }
            }
        });

        // Login with token
        await this.login(config.token);
        console.log('Bot is online and autocomplete is enabled!');
    }
}

// Create and initialize the bot
const client = new TimezoneBotClient();
client.init().catch(error => {
    console.error('Initialization error:', error);
});