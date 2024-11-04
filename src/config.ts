import dotenv from 'dotenv';
dotenv.config();

export const config = {
    token: process.env.DISCORD_TOKEN!,
    clientId: process.env.CLIENT_ID!,
    adminChannels: new Set<string>(
        (process.env.ADMIN_CHANNELS || '').split(',').filter(Boolean)
    ),
    adminRoles: new Set<string>(
        (process.env.ADMIN_ROLES || '').split(',').filter(Boolean)
    )
};