import { 
    ChatInputCommandInteraction,
    SlashCommandBuilder 
} from 'discord.js';
import { DateTime } from 'luxon';
import { TimezonesData } from '../types';
import { formatDateTime } from '../utils';

export const data = new SlashCommandBuilder()
    .setName('yourtime')
    .setDescription('Convert time across different timezones in messages')
    .addStringOption(option =>
        option
            .setName('datetime')
            .setDescription('The date and time (YYYY-MM-DD HH:MM:SS)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('message')
            .setDescription('The message containing {time} placeholder')
            .setRequired(true)
    );

export async function execute(
    interaction: ChatInputCommandInteraction,
    timezonesData: TimezonesData
): Promise<void> {
    const senderPref = timezonesData[interaction.user.id];
    
    if (!senderPref) {
        await interaction.reply({
            content: 'Please set your timezone first using /settime',
            ephemeral: true
        });
        return;
    }

    const datetimeStr = interaction.options.getString('datetime', true);
    const messageTemplate = interaction.options.getString('message', true);

    if (!messageTemplate.includes('{time}')) {
        await interaction.reply({
            content: 'Message must contain {time} placeholder where the time should appear',
            ephemeral: true
        });
        return;
    }

    try {
        // Parse the input datetime in the sender's timezone
        const inputDt = DateTime.fromFormat(
            datetimeStr,
            'yyyy-MM-dd HH:mm:ss',
            { zone: senderPref.timezone }
        );

        if (!inputDt.isValid) {
            throw new Error(inputDt.invalidReason);
        }

        // Create a Discord timestamp that will automatically convert to each user's timezone
        // Format: <t:timestamp:f> for full date and time
        const discordTimestamp = `<t:${Math.floor(inputDt.toSeconds())}:f>`;
        
        // Replace the {time} placeholder with the Discord timestamp
        const finalMessage = messageTemplate.replace('{time}', discordTimestamp);
        
        // Send the message with the Discord timestamp
        await interaction.reply({
            content: finalMessage,
            // Set ephemeral to false so everyone can see it
            ephemeral: false
        });

    } catch (error) {
        await interaction.reply({
            content: 'Invalid datetime format. Please use YYYY-MM-DD HH:MM:SS',
            ephemeral: true
        });
    }
}