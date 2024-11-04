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
            .setDescription('The message containing [your-time] placeholder')
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
    const message = interaction.options.getString('message', true);

    try {
        const inputDt = DateTime.fromFormat(
            datetimeStr,
            'yyyy-MM-dd HH:mm:ss',
            { zone: senderPref.timezone }
        );

        if (!inputDt.isValid) {
            throw new Error(inputDt.invalidReason);
        }

        const convertedMessages = new Map<string, string>();
        
        for (const [userId, pref] of Object.entries(timezonesData)) {
            const userDt = inputDt.setZone(pref.timezone);
            const formattedTime = formatDateTime(userDt, pref);
            const userMessage = message.replace('[your-time]', formattedTime);
            convertedMessages.set(userId, userMessage);
        }

        const senderMessage = convertedMessages.get(interaction.user.id)!;
        await interaction.reply(senderMessage);

    } catch (error) {
        await interaction.reply({
            content: 'Invalid datetime format. Please use YYYY-MM-DD HH:MM:SS',
            ephemeral: true
        });
    }
}