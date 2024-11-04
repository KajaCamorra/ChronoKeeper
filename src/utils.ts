import { DateTime } from 'luxon';
import { UserTimePreference } from './types';

export function formatDateTime(dt: DateTime, pref: UserTimePreference): string {
    const dateStr = pref.dateFormat === 'dd/mm/yyyy'
        ? dt.toFormat('dd/MM/yyyy')
        : dt.toFormat('MM/dd/yyyy');

    const timeStr = pref.timeFormat === '24h'
        ? dt.toFormat('HH:mm')
        : dt.toFormat('h:mma').toLowerCase();

    return `${dateStr} ${timeStr}`;
}
