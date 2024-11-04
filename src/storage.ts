import fs from 'fs/promises';
import { TimezonesData } from './types';

export class Storage {
    private static readonly STORAGE_PATH = './timezone_preferences.json';

    static async load(): Promise<TimezonesData> {
        try {
            const data = await fs.readFile(Storage.STORAGE_PATH, 'utf-8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    static async save(data: TimezonesData): Promise<void> {
        await fs.writeFile(
            Storage.STORAGE_PATH,
            JSON.stringify(data, null, 2)
        );
    }
}