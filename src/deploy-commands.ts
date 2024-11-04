import { REST, Routes } from 'discord.js';
import { config } from './config';
import * as settime from './commands/settime';
import * as time from './commands/time';
import * as yourtime from './commands/yourtime';

const commands = [
    settime.data.toJSON(),
    time.data.toJSON(),
    yourtime.data.toJSON(),
];

// Create REST instance
const rest = new REST().setToken(config.token);

// Deploy commands
async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

deployCommands();