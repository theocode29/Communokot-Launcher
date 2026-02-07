/**
 * Dry Run Engine - Simulate preset application before committing
 * Provides preview of changes without modifying files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { computeFileHash } from './backup-manager';

// ============================================
// Types
// ============================================

export interface DryRunResult {
    success: boolean;
    changes: FileChange[];
    warnings: string[];
    errors: string[];
    summary: {
        preset: string;
        affectedFiles: number;
        skippedFiles: number;
        totalChangedKeys: number;
    };
}

export interface FileChange {
    file: string;
    type: 'create' | 'modify' | 'skip';
    reason?: string;
    changedKeys: string[];
    preservedKeys: string[];
    diff?: DiffEntry[];
}

export interface DiffEntry {
    key: string;
    oldValue: unknown;
    newValue: unknown;
    action: 'add' | 'modify' | 'remove' | 'preserve';
}

export interface DryRunOptions {
    preserveUserModifications: boolean;
    validateBeforeApply: boolean;
    showDiff: boolean;
}

// ============================================
// Implementation
// ============================================

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Load and parse a config file
 */
async function loadConfig(filePath: string): Promise<object | null> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');

        if (filePath.endsWith('.json')) {
            return JSON.parse(content);
        }

        if (filePath.endsWith('.properties')) {
            const result: Record<string, string> = {};
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    if (key) {
                        result[key.trim()] = valueParts.join('=').trim();
                    }
                }
            }
            return result;
        }

        // For TOML, return raw for now
        return { _raw: content };
    } catch {
        return null;
    }
}

/**
 * Get all keys from an object recursively
 */
function getAllKeys(obj: object, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys.push(...getAllKeys(value, fullKey));
        }
    }

    return keys;
}

/**
 * Get a nested value from an object by key path
 */
function getNestedValue(obj: object, keyPath: string): unknown {
    const parts = keyPath.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Set a nested value in an object by key path
 */
function setNestedValue(obj: object, keyPath: string, value: unknown): void {
    const parts = keyPath.split('.');
    let current: Record<string, unknown> = obj as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare two values for equality
 */
function valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;

    if (typeof a === 'object') {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    return false;
}

/**
 * Calculate diff between current config and preset
 */
function calculateDiff(
    current: object | null,
    preset: object,
    userModifiedKeys: string[] = []
): { merged: object; diff: DiffEntry[]; changedKeys: string[]; preservedKeys: string[] } {
    const merged = current ? deepClone(current) : {};
    const diff: DiffEntry[] = [];
    const changedKeys: string[] = [];
    const preservedKeys: string[] = [];

    const presetKeys = getAllKeys(preset);

    for (const keyPath of presetKeys) {
        const presetValue = getNestedValue(preset, keyPath);
        const currentValue = current ? getNestedValue(current, keyPath) : undefined;

        // Check if user modified this key
        if (userModifiedKeys.includes(keyPath)) {
            preservedKeys.push(keyPath);
            diff.push({
                key: keyPath,
                oldValue: currentValue,
                newValue: presetValue,
                action: 'preserve',
            });
            continue;
        }

        // Skip objects (we'll handle their children)
        if (presetValue && typeof presetValue === 'object' && !Array.isArray(presetValue)) {
            continue;
        }

        if (currentValue === undefined) {
            // Key doesn't exist - add it
            setNestedValue(merged, keyPath, presetValue);
            changedKeys.push(keyPath);
            diff.push({
                key: keyPath,
                oldValue: undefined,
                newValue: presetValue,
                action: 'add',
            });
        } else if (!valuesEqual(currentValue, presetValue)) {
            // Key exists but value differs - modify it
            setNestedValue(merged, keyPath, presetValue);
            changedKeys.push(keyPath);
            diff.push({
                key: keyPath,
                oldValue: currentValue,
                newValue: presetValue,
                action: 'modify',
            });
        }
    }

    return { merged, diff, changedKeys, preservedKeys };
}

/**
 * Perform a dry run of preset application
 */
export async function dryRunPresetApplication(
    configDir: string,
    presetConfigs: Record<string, object>,
    userModifiedFiles: Record<string, string[]>,
    options: Partial<DryRunOptions> = {}
): Promise<DryRunResult> {
    const opts: DryRunOptions = {
        preserveUserModifications: true,
        validateBeforeApply: true,
        showDiff: true,
        ...options,
    };

    const changes: FileChange[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    let totalChangedKeys = 0;

    for (const [filename, presetConfig] of Object.entries(presetConfigs)) {
        const filePath = path.join(configDir, filename);

        try {
            const exists = await fileExists(filePath);
            const currentConfig = exists ? await loadConfig(filePath) : null;
            const userModifiedKeys = opts.preserveUserModifications
                ? (userModifiedFiles[filename] || [])
                : [];

            // Calculate what would change
            const { diff, changedKeys, preservedKeys } = calculateDiff(
                currentConfig,
                presetConfig,
                userModifiedKeys
            );

            if (changedKeys.length === 0) {
                changes.push({
                    file: filename,
                    type: 'skip',
                    reason: 'No changes needed',
                    changedKeys: [],
                    preservedKeys,
                    diff: opts.showDiff ? diff : undefined,
                });
            } else {
                changes.push({
                    file: filename,
                    type: exists ? 'modify' : 'create',
                    changedKeys,
                    preservedKeys,
                    diff: opts.showDiff ? diff : undefined,
                });
                totalChangedKeys += changedKeys.length;
            }

            if (preservedKeys.length > 0) {
                warnings.push(`${filename}: ${preservedKeys.length} user-modified keys preserved`);
            }

        } catch (e) {
            errors.push(`${filename}: ${(e as Error).message}`);
        }
    }

    return {
        success: errors.length === 0,
        changes,
        warnings,
        errors,
        summary: {
            preset: 'unknown', // Will be set by caller
            affectedFiles: changes.filter(c => c.type !== 'skip').length,
            skippedFiles: changes.filter(c => c.type === 'skip').length,
            totalChangedKeys,
        },
    };
}

/**
 * Format dry run result for logging
 */
export function formatDryRunResult(result: DryRunResult): string {
    const lines: string[] = [
        `=== DRY RUN RESULT ===`,
        `Status: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        `Files affected: ${result.summary.affectedFiles}`,
        `Files skipped: ${result.summary.skippedFiles}`,
        `Total keys changed: ${result.summary.totalChangedKeys}`,
        '',
    ];

    if (result.warnings.length > 0) {
        lines.push('Warnings:');
        result.warnings.forEach(w => lines.push(`  ⚠️ ${w}`));
        lines.push('');
    }

    if (result.errors.length > 0) {
        lines.push('Errors:');
        result.errors.forEach(e => lines.push(`  ❌ ${e}`));
        lines.push('');
    }

    lines.push('Changes:');
    for (const change of result.changes) {
        const icon = change.type === 'create' ? '➕' : change.type === 'modify' ? '📝' : '⏭️';
        lines.push(`  ${icon} ${change.file} (${change.type})`);

        if (change.changedKeys.length > 0) {
            lines.push(`      Changed: ${change.changedKeys.join(', ')}`);
        }
        if (change.preservedKeys.length > 0) {
            lines.push(`      Preserved: ${change.preservedKeys.join(', ')}`);
        }
    }

    return lines.join('\n');
}
