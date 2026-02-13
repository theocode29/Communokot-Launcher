/**
 * Preset Application Orchestrator - Robust Version
 * Coordinates performance preset application with full safety guarantees
 */

import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, readFile, readdir } from 'fs/promises';
import type { PerformancePreset } from './types/mod-configs';
import { detectHardware } from './hardware-detection';
import {
    writeFileAtomic,
    deepMerge,
    loadMetadata,
    saveMetadata,
    hasUserModifications,
    validateJSON,
    parseProperties,
    stringifyProperties,
    parseToml,
    stringifyToml,
    calculateHash
} from './config-manager';
import {
    SODIUM_PRESETS,
    LITHIUM_PRESETS,
    FERRITECORE_PRESETS,
    ENTITYCULLING_PRESETS,
    IMMEDIATELYFAST_PRESETS,
    MODERNFIX_PRESETS,
    SODIUMLEAFCULLING_PRESETS
} from './performance-presets';
import {
    createVersionedBackup,
    logAuditEntry,
    applySafeBootMode,
    restoreFromBackup,
    getMostRecentBackup
} from './backup-manager';
import {
    dryRunPresetApplication,
    formatDryRunResult,
    type DryRunResult
} from './dry-run-engine';
import {
    checkIncompatibilities,
    getBasicHardwareInfo,
    type HardwareInfo,
    type IncompatibilityCheckResult
} from './incompatibility-db';
import type { ProgressCallback } from './fabric';

// ============================================
// Types
// ============================================

export interface PresetApplicationResult {
    success: boolean;
    preset: string;
    appliedFiles: string[];
    skippedFiles: string[];
    warnings: string[];
    errors: string[];
    backupId?: string;
    incompatibilitiesDetected: string[];
    workaroundsApplied: string[];
}

export interface PresetApplicationOptions {
    dryRun?: boolean;
    forceOverwrite?: boolean;
    preserveUserModifications?: boolean;
    checkIncompatibilities?: boolean;
    createBackup?: boolean;
}

// ============================================
// Configuration Files
// ============================================

const CONFIG_FILES = [
    { filename: 'sodium-options.json', format: 'json', presets: SODIUM_PRESETS },
    { filename: 'lithium.properties', format: 'properties', presets: LITHIUM_PRESETS },
    { filename: 'ferritecore-common.toml', format: 'toml', presets: FERRITECORE_PRESETS },
    { filename: 'entityculling.json', format: 'json', presets: ENTITYCULLING_PRESETS },
    { filename: 'immediatelyfast.json', format: 'json', presets: IMMEDIATELYFAST_PRESETS },
    { filename: 'modernfix-mixins.properties', format: 'properties', presets: MODERNFIX_PRESETS },
    { filename: 'sodiumleafculling.json', format: 'json', presets: SODIUMLEAFCULLING_PRESETS },
] as const;

// ============================================
// File Operations
// ============================================

async function loadConfigFile(filePath: string, format: string): Promise<object> {
    if (!existsSync(filePath)) {
        return {};
    }

    const content = await readFile(filePath, 'utf8');

    switch (format) {
        case 'json':
            const validation = validateJSON(content);
            if (!validation.valid) {
                console.warn(`[Preset] Invalid JSON in ${filePath}, using empty config`);
                return {};
            }
            return JSON.parse(content);

        case 'properties':
            return parseProperties(content);

        case 'toml':
            return parseToml(content);

        default:
            return {};
    }
}

function stringifyConfig(config: object, format: string, tomlSection?: string): string {
    switch (format) {
        case 'json':
            return JSON.stringify(config, null, 2);

        case 'properties':
            return stringifyProperties(config as Record<string, boolean>);

        case 'toml':
            return stringifyToml(config as Record<string, unknown>, tomlSection || 'config');

        default:
            return JSON.stringify(config, null, 2);
    }
}

// ============================================
// Round-Trip Validation
// ============================================

function validateRoundTrip(original: object, serialized: string, format: string): boolean {
    try {
        let reparsed: object;

        switch (format) {
            case 'json':
                reparsed = JSON.parse(serialized);
                break;
            case 'properties':
                reparsed = parseProperties(serialized);
                break;
            case 'toml':
                reparsed = parseToml(serialized);
                break;
            default:
                return false;
        }

        // Deep comparison
        return JSON.stringify(original) === JSON.stringify(reparsed);
    } catch {
        return false;
    }
}

// ============================================
// Get Installed Mods
// ============================================

async function getInstalledMods(minecraftPath: string): Promise<string[]> {
    const modsPath = join(minecraftPath, 'mods');

    if (!existsSync(modsPath)) {
        return [];
    }

    try {
        const files = await readdir(modsPath);
        return files
            .filter(f => f.endsWith('.jar'))
            .map(f => f.replace('.jar', ''));
    } catch {
        return [];
    }
}

// ============================================
// Apply Single Config
// ============================================

async function applySingleConfig(
    configPath: string,
    filename: string,
    format: string,
    presetConfig: object,
    preserveUser: boolean
): Promise<{ success: boolean; error?: string }> {
    const filePath = join(configPath, filename);

    try {
        // 1. Load existing config
        let existingConfig = await loadConfigFile(filePath, format);

        // 2. Deep merge with preset
        const mergedConfig = deepMerge(existingConfig, presetConfig, preserveUser);

        // 3. Stringify
        const tomlSection = filename.includes('ferritecore') ? 'mixin' : undefined;
        const content = stringifyConfig(mergedConfig, format, tomlSection);

        // 4. Validate round-trip (critical for safety)
        if (!validateRoundTrip(mergedConfig, content, format)) {
            console.error(`[Preset] Round-trip validation failed for ${filename}`);
            return { success: false, error: 'Round-trip validation failed' };
        }

        // 5. Write atomically
        await writeFileAtomic(filePath, content);

        console.log(`[Preset] Applied config to ${filename}`);
        return { success: true };

    } catch (error) {
        console.error(`[Preset] Failed to apply ${filename}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================
// Update Metadata
// ============================================

async function updateMetadataAfterApply(
    configPath: string,
    preset: 'low-end' | 'balanced' | 'high-end',
    appliedFiles: string[]
): Promise<void> {
    const metadata = await loadMetadata(configPath);
    metadata.lastAppliedPreset = preset;
    metadata.lastModified = new Date().toISOString();
    metadata.version = '2.0.0'; // New version with robust features

    for (const filename of appliedFiles) {
        const filePath = join(configPath, filename);
        if (existsSync(filePath)) {
            try {
                const content = await readFile(filePath, 'utf8');
                metadata.hashes[filename] = calculateHash(content);
            } catch (error) {
                console.warn(`[Preset] Failed to hash ${filename}:`, error);
            }
        }
    }

    await saveMetadata(configPath, metadata);
}

// ============================================
// Main Orchestrator Function
// ============================================

export async function applyPerformancePreset(
    minecraftPath: string,
    userPreset: PerformancePreset = 'auto',
    onProgress?: ProgressCallback,
    options: PresetApplicationOptions = {}
): Promise<PresetApplicationResult> {
    console.log('[Preset] === Starting Robust Performance Preset Application ===');
    onProgress?.('Configuration des optimisations...', 90);

    const result: PresetApplicationResult = {
        success: true,
        preset: userPreset,
        appliedFiles: [],
        skippedFiles: [],
        warnings: [],
        errors: [],
        incompatibilitiesDetected: [],
        workaroundsApplied: [],
    };

    const opts: PresetApplicationOptions = {
        dryRun: false,
        forceOverwrite: false,
        preserveUserModifications: true,
        checkIncompatibilities: true,
        createBackup: true,
        ...options,
    };

    const configPath = join(minecraftPath, 'config');

    try {
        // 1. Ensure config directory exists
        if (!existsSync(configPath)) {
            await mkdir(configPath, { recursive: true });
        }

        // 2. Load metadata
        const metadata = await loadMetadata(configPath);

        // 3. Check if user wants to manage their own configs
        if (metadata.userManaged && !opts.forceOverwrite) {
            console.log('[Preset] User-managed mode enabled, skipping preset application');
            result.skippedFiles = CONFIG_FILES.map(c => c.filename);
            return result;
        }

        // 4. Determine which preset to use
        let preset: 'low-end' | 'balanced' | 'high-end';
        let hardwareInfo: HardwareInfo | undefined;

        if (userPreset === 'auto') {
            const hardware = await detectHardware();
            preset = hardware.recommendedPreset as 'low-end' | 'balanced' | 'high-end';
            hardwareInfo = {
                cpuModel: 'Unknown',
                cpuArch: process.arch,
                cpuCores: hardware.cpuCores,
                totalRamGB: hardware.totalRamGB,
                gpuName: hardware.gpuName,
                gpuVendor: hardware.gpuName.split(' ')[0] || 'Unknown',
                gpuType: hardware.gpuType,
                os: process.platform,
            };
            console.log(`[Preset] Auto-detected preset: ${preset} (score: ${hardware.score})`);
            console.log(`[Preset] Hardware Details: RAM=${hardware.totalRamGB}GB, Cores=${hardware.cpuCores}, GPU=${hardware.gpuName} (${hardware.gpuType})`);
        } else {
            preset = userPreset as 'low-end' | 'balanced' | 'high-end';
            console.log(`[Preset] Using user-selected preset: ${preset}`);
            // Still detect hardware for logging purposes
            const hardware = await detectHardware();
            console.log(`[Preset] Hardware Score (Reference): ${hardware.score}`);
        }

        result.preset = preset;

        // 5. Check for incompatibilities
        if (opts.checkIncompatibilities) {
            onProgress?.('Vérification des incompatibilités...', 91);

            const installedMods = await getInstalledMods(minecraftPath);
            const hwInfo = hardwareInfo || getBasicHardwareInfo();

            // Build current configs map
            const currentConfigs = new Map<string, Record<string, unknown>>();
            for (const config of CONFIG_FILES) {
                const loaded = await loadConfigFile(join(configPath, config.filename), config.format);
                const presetData = config.presets[preset];
                const merged = deepMerge(loaded, presetData, opts.preserveUserModifications || true);
                currentConfigs.set(config.filename, merged as Record<string, unknown>);
            }

            const incompatResult = checkIncompatibilities(hwInfo, installedMods, currentConfigs);

            result.incompatibilitiesDetected = incompatResult.detected.map(d => d.id);
            result.workaroundsApplied = incompatResult.appliedWorkarounds;
            result.warnings.push(...incompatResult.warnings);

            // Update configs with workarounds
            for (const [filename, patchedConfig] of incompatResult.patchedConfigs) {
                currentConfigs.set(filename, patchedConfig);
                console.log(`[Preset] Applied workaround to: ${filename}`);
            }

            console.log(`[Preset] Incompatibility check: ${incompatResult.detected.length} issues, ${incompatResult.appliedWorkarounds.length} workarounds`);
            if (incompatResult.detected.length > 0) {
                console.log(`[Preset] Detected issues: ${incompatResult.detected.map(d => d.id).join(', ')}`);
            }
        }

        // 6. Check user modifications
        onProgress?.('Vérification des modifications...', 92);

        const userModifiedFiles: Record<string, string[]> = {};
        for (const config of CONFIG_FILES) {
            const hasModif = await hasUserModifications(configPath, config.filename, metadata);
            if (hasModif) {
                userModifiedFiles[config.filename] = ['*']; // Mark all keys as modified
                console.log(`[Preset] User modifications detected in ${config.filename}`);
            }
        }

        const hasAnyModifications = Object.keys(userModifiedFiles).length > 0;

        // 7. Dry run (optional)
        if (opts.dryRun) {
            console.log('[Preset] Running in DRY RUN mode');

            const presetConfigs: Record<string, object> = {};
            for (const config of CONFIG_FILES) {
                presetConfigs[config.filename] = config.presets[preset];
            }

            const dryRunResult = await dryRunPresetApplication(
                configPath,
                presetConfigs,
                userModifiedFiles,
                { preserveUserModifications: opts.preserveUserModifications || true }
            );

            console.log(formatDryRunResult(dryRunResult));

            result.success = dryRunResult.success;
            result.warnings.push(...dryRunResult.warnings);
            result.errors.push(...dryRunResult.errors);
            return result;
        }

        // 8. Create backup before applying
        if (opts.createBackup) {
            onProgress?.('Création de backup...', 93);
            try {
                result.backupId = await createVersionedBackup(configPath, 'pre-preset-apply', {
                    preset,
                    hardwareInfo,
                });
                console.log(`[Preset] Backup created: ${result.backupId}`);
            } catch (error) {
                console.warn('[Preset] Failed to create backup:', error);
                result.warnings.push('Failed to create backup');
            }
        }

        // 9. Apply each config
        onProgress?.('Application des optimisations...', 94);

        for (const config of CONFIG_FILES) {
            const presetConfig = config.presets[preset];
            const preserveUser = hasAnyModifications && (opts.preserveUserModifications ?? true);

            const applyResult = await applySingleConfig(
                configPath,
                config.filename,
                config.format,
                presetConfig,
                preserveUser
            );

            if (applyResult.success) {
                result.appliedFiles.push(config.filename);
                console.log(`[Preset] Successfully applied ${config.filename} for preset ${preset}`);
            } else {
                console.error(`[Preset] Failed to apply ${config.filename}: ${applyResult.error}`);
                result.errors.push(`${config.filename}: ${applyResult.error}`);
                result.success = false;
            }
        }

        // 10. Update metadata
        await updateMetadataAfterApply(configPath, preset, result.appliedFiles);

        // 11. Log to audit
        await logAuditEntry(configPath, {
            action: 'preset-applied',
            details: {
                preset,
                filesModified: result.appliedFiles,
                backupId: result.backupId,
                hardwareScore: hardwareInfo?.totalRamGB,
            },
            result: result.success ? 'success' : 'partial',
            errors: result.errors.length > 0 ? result.errors : undefined,
        });

        console.log(`[Preset] === Preset Application Complete ===`);
        console.log(`[Preset] Applied: ${result.appliedFiles.length}, Errors: ${result.errors.length}`);
        onProgress?.('Optimisations appliquées', 95);

        return result;

    } catch (error) {
        console.error('[Preset] Critical error during preset application:', error);
        result.success = false;
        result.errors.push((error as Error).message);

        // Try to recover with safe boot mode
        try {
            console.log('[Preset] Attempting safe boot mode recovery...');
            await applySafeBootMode(configPath);
            result.warnings.push('Applied safe boot mode due to critical error');
        } catch (recoveryError) {
            console.error('[Preset] Safe boot recovery also failed:', recoveryError);
        }

        throw new Error('Échec de l\'application des optimisations: ' + (error as Error).message);
    }
}

// ============================================
// Rollback Function
// ============================================

export async function rollbackPreset(minecraftPath: string): Promise<void> {
    console.log('[Preset] Rolling back to previous configuration...');

    const configPath = join(minecraftPath, 'config');

    const lastBackup = await getMostRecentBackup(configPath);
    if (!lastBackup) {
        throw new Error('No backup available for rollback');
    }

    await restoreFromBackup(configPath, lastBackup.id);
    console.log(`[Preset] Rollback complete from backup: ${lastBackup.id}`);
}

// ============================================
// Safe Boot Export
// ============================================

export { applySafeBootMode } from './backup-manager';
