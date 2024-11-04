import { Snowflake } from 'discord.js';

export interface UserTimePreference {
    timezone: string;
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy';
    timeFormat: '24h' | '12h';
    userId: Snowflake;
}

export interface TimezonesData {
    [key: Snowflake]: UserTimePreference;
}