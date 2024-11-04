import { 
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember
} from 'discord.js';
import { DateTime } from 'luxon';
import { TimezonesData } from '../types';
import { config } from '../config';
import { formatDateTime } from '../utils';

export const data = new SlashCommandBuilder()
    .setName('time')
    .setDescription('Check timezone information')
    .addSubcommand(subcommand =>
        subcommand
            .setName('user')
            .setDescription("Check a user's timezone")
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('The user to check')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('count')
            .setDescription('Show timezone distribution')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('all')
            .setDescription('Show all users timezones (admin only)')
    );

export async function execute(
    interaction: ChatInputCommandInteraction,
    timezonesData: TimezonesData
): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'user': {
            const targetUser = interaction.options.getUser('user', true);
            const pref = timezonesData[targetUser.id];

            if (!pref) {
                await interaction.reply({
                    content: `${targetUser.username} hasn't set their timezone yet.`,
                    ephemeral: true
                });
                return;
            }

            const currentTime = DateTime.now().setZone(pref.timezone);
            const formattedTime = formatDateTime(currentTime, pref);

            await interaction.reply({
                content: `${targetUser.username}'s current time is ${formattedTime}`,
                ephemeral: true
            });
            break;
        }

        case 'count': {
            const timezoneCounts = new Map<string, number>();
            const timezoneTimes = new Map<string, DateTime>();

            for (const pref of Object.values(timezonesData)) {
                const count = timezoneCounts.get(pref.timezone) ?? 0;
                timezoneCounts.set(pref.timezone, count + 1);
                
                if (!timezoneTimes.has(pref.timezone)) {
                    timezoneTimes.set(
                        pref.timezone,
                        DateTime.now().setZone(pref.timezone)
                    );
                }
            }

            const response = ['Current times by timezone:'];
            for (const [tz, count] of timezoneCounts) {
                const time = timezoneTimes.get(tz)!.toFormat('HH:mm');
                response.push(
                    `${tz}: ${time} (${count} ${count === 1 ? 'user' : 'users'})`
                );
            }

            await interaction.reply({
                content: response.join('\n'),
                ephemeral: true
            });
            break;
        }

        case 'all': {
            const member = interaction.member as GuildMember;
            const hasPermission = 
                config.adminChannels.has(interaction.channelId) ||
                member.roles.cache.some(role => config.adminRoles.has(role.id));

            if (!hasPermission) {
                await interaction.reply({
                    content: "You don't have permission to use this command.",
                    ephemeral: true
                });
                return;
            }

            const timezoneUsers = new Map<string, string[]>();
            
            for (const [userId, pref] of Object.entries(timezonesData)) {
                const users = timezoneUsers.get(pref.timezone) ?? [];
                const member = await interaction.guild?.members
                    .fetch(userId)
                    .catch(() => null);
                
                if (member) {
                    users.push(member.displayName);
                    timezoneUsers.set(pref.timezone, users);
                }
            }

            const response = ['Users by timezone:'];
            for (const [tz, users] of timezoneUsers) {
                const currentTime = DateTime.now()
                    .setZone(tz)
                    .toFormat('HH:mm');
                response.push(
                    `\n${tz} (Current time: ${currentTime}):\n${users.join(', ')}`
                );
            }

            await interaction.reply({
                content: response.join('\n'),
                ephemeral: true
            });
            break;
        }
    }
}