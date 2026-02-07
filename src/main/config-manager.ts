/**
 * Configuration manager for mod configs with atomic writes and deep merge
 */

import { join } from 'path';
import { readFile, writeFile, rename, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import type { ConfigMetadata, PerformancePreset } from './types/mod-configs';

const METADATA_FILENAME = 'launcher_config_metadata.json';

/**
 * Calculate SHA-256 hash of a string
 */
export function calculateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

/**
 * Atomically write a file with tmp + rename strategy
 */
export async function writeFileAtomic(filePath: string, content: string): Promise<void> {
    const tmpPath = `${filePath}.tmp`;

    try {
        await writeFile(tmpPath, content, 'utf8');
        // Atomic rename (POSIX guarantee)
        await rename(tmpPath, filePath);
    } catch (error) {
        // Clean up tmp file if it exists
        try {
            if (existsSync(tmpPath)) {
                await rename(tmpPath, tmpPath + '.failed');
            }
        } catch { }
        throw error;
    }
}

/**
 * Deep merge two objects
 * @param target - Target object (existing config)
 * @param source - Source object (new config from preset)
 * @param preserveUserModifications - If true, don't overwrite existing keys
 */
export function deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>,
    preserveUserModifications: boolean = false
): T {
    const result = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (preserveUserModifications && key in target) {
                // Preserve user's existing value
                continue;
            }

            if (
                sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)
            ) {
                // Recursively merge nested objects
                result[key] = deepMerge(targetValue, sourceValue, preserveUserModifications) as any;
            } else {
                // Direct assignment
                result[key] = sourceValue as any;
            }
        }
    }

    return result;
}

/**
 * Convert Java properties format to object
 */
export function parseProperties(content: string): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, value] = trimmed.split('=').map(s => s.trim());
            if (key && value !== undefined) {
                result[key] = value === 'true';
            }
        }
    }

    return result;
}

/**
 * Convert object to Java properties format
 */
export function stringifyProperties(obj: Record<string, boolean>): string {
    let result = '# Configuration file\n';
    for (const [key, value] of Object.entries(obj)) {
        result += `${key}=${value}\n`;
    }
    return result;
}

/**
 * Parse TOML (basic implementation for FerriteCore's simple format)
 */
export function parseToml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('[')) {
            const [key, value] = trimmed.split('=').map(s => s.trim());
            if (key && value !== undefined) {
                if (value === 'true' || value === 'false') {
                    result[key] = value === 'true';
                } else if (!isNaN(Number(value))) {
                    result[key] = Number(value);
                } else {
                    result[key] = value.replace(/^["']|["']$/g, '');
                }
            }
        }
    }

    return result;
}

/**
 * Stringify TOML (basic implementation)
 */
export function stringifyToml(obj: Record<string, unknown>, section: string = ''): string {
    let result = '# Configuration file\n';
    if (section) {
        result += `[${section}]\n`;
    }
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            // Skip nested objects for now (basic TOML support)
            continue;
        }
        result += `${key} = ${value}\n`;
    }
    return result;
}

/**
 * Load or create metadata file
 */
export async function loadMetadata(configPath: string): Promise<ConfigMetadata> {
    const metadataPath = join(configPath, METADATA_FILENAME);

    try {
        if (existsSync(metadataPath)) {
            const content = await readFile(metadataPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn('[Config Manager] Failed to load metadata:', error);
    }

    // Return default metadata
    return {
        version: '1.0',
        lastAppliedPreset: null,
        lastModified: new Date().toISOString(),
        hashes: {},
        userManaged: false
    };
}

/**
 * Save metadata file
 */
export async function saveMetadata(configPath: string, metadata: ConfigMetadata): Promise<void> {
    const metadataPath = join(configPath, METADATA_FILENAME);

    // Ensure config directory exists
    if (!existsSync(configPath)) {
        await mkdir(configPath, { recursive: true });
    }

    const content = JSON.stringify(metadata, null, 2);
    await writeFileAtomic(metadataPath, content);
}

/**
 * Check if a config file has been modified by the user
 */
export async function hasUserModifications(
    configPath: string,
    filename: string,
    metadata: ConfigMetadata
): Promise<boolean> {
    const filePath = join(configPath, filename);

    if (!existsSync(filePath)) {
        return false;
    }

    try {
        const content = await readFile(filePath, 'utf8');
        const currentHash = calculateHash(content);
        const storedHash = metadata.hashes[filename];

        // If no stored hash, assume it's first time (no user modifications yet)
        if (!storedHash) {
            return false;
        }

        // If hashes differ, user has modified the file
        return currentHash !== storedHash;
    } catch (error) {
        console.warn(`[Config Manager] Failed to check modifications for ${filename}:`, error);
        return false;
    }
}

/**
 * Create a backup of a config file
 */
export async function backupConfigFile(configPath: string, filename: string): Promise<void> {
    const filePath = join(configPath, filename);
    const backupPath = `${filePath}.backup`;

    try {
        if (existsSync(filePath)) {
            const content = await readFile(filePath, 'utf8');
            await writeFile(backupPath, content, 'utf8');
            console.log(`[Config Manager] Created backup: ${backupPath}`);
        }
    } catch (error) {
        console.warn(`[Config Manager] Failed to create backup for ${filename}:`, error);
    }
}

/**
 * Validate JSON syntax
 */
export function validateJSON(content: string): { valid: boolean, error?: string } {
    try {
        JSON.parse(content);
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid JSON'
        };
    }
}

/**
 * Restore config from backup
 */
export async function restoreFromBackup(configPath: string, filename: string): Promise<boolean> {
    const filePath = join(configPath, filename);
    const backupPath = `${filePath}.backup`;

    try {
        if (existsSync(backupPath)) {
            const content = await readFile(backupPath, 'utf8');
            await writeFileAtomic(filePath, content);
            console.log(`[Config Manager] Restored ${filename} from backup`);
            return true;
        }
    } catch (error) {
        console.error(`[Config Manager] Failed to restore from backup:`, error);
    }

    return false;
}
