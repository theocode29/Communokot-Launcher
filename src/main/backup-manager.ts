/**
 * Backup Manager - Versioned backup system with manifest
 * Implements robust backup/restore/rollback capabilities
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';


// ============================================
// Types
// ============================================

export interface BackupManifest {
    version: "1.0";
    backups: BackupEntry[];
    maxBackups: number;
    maxAgeDays: number;
}

export interface BackupEntry {
    id: string;
    timestamp: string;
    reason: 'pre-preset-apply' | 'pre-migration' | 'pre-rollback' | 'manual' | 'auto';
    files: string[];
    presetApplied?: string;
    hardwareScore?: number;
    canRestore: boolean;
    metadata?: Record<string, unknown>;
}

export interface AuditLog {
    entries: AuditEntry[];
}

export interface AuditEntry {
    timestamp: string;
    action: 'preset-applied' | 'migration' | 'rollback' | 'safe-boot' | 'user-reset' | 'backup-created';
    details: {
        preset?: string;
        fromSchema?: string;
        toSchema?: string;
        filesModified: string[];
        backupId?: string;
        hardwareScore?: number;
        dryRun?: boolean;
    };
    result: 'success' | 'partial' | 'failed';
    errors?: string[];
}

export interface RollbackResult {
    success: boolean;
    restored: string[];
    failed: string[];
    backupId: string;
    preRollbackBackupId?: string;
}

// ============================================
// Constants
// ============================================

const BACKUP_DIR_NAME = '.launcher-backups';
const MANIFEST_FILE = 'backup-manifest.json';
const AUDIT_LOG_FILE = 'audit-log.json';
const DEFAULT_MAX_BACKUPS = 10;
const DEFAULT_MAX_AGE_DAYS = 7;
const CONFIG_EXTENSIONS = ['json', 'properties', 'toml'];

// ============================================
// Backup Manager Implementation
// ============================================

/**
 * Get the backup directory path
 */
function getBackupDir(configDir: string): string {
    return path.join(configDir, BACKUP_DIR_NAME);
}

/**
 * Ensure backup directory exists
 */
async function ensureBackupDir(configDir: string): Promise<string> {
    const backupDir = getBackupDir(configDir);
    await fs.mkdir(backupDir, { recursive: true });
    return backupDir;
}

/**
 * Load the backup manifest, creating default if not exists
 */
export async function loadBackupManifest(configDir: string): Promise<BackupManifest> {
    const manifestPath = path.join(getBackupDir(configDir), MANIFEST_FILE);

    try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return {
            version: "1.0",
            backups: [],
            maxBackups: DEFAULT_MAX_BACKUPS,
            maxAgeDays: DEFAULT_MAX_AGE_DAYS,
        };
    }
}

/**
 * Save the backup manifest
 */
async function saveBackupManifest(configDir: string, manifest: BackupManifest): Promise<void> {
    await ensureBackupDir(configDir);
    const manifestPath = path.join(getBackupDir(configDir), MANIFEST_FILE);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Generate a unique backup ID based on timestamp
 */
function generateBackupId(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Get all config files in a directory
 */
async function getConfigFiles(configDir: string): Promise<string[]> {
    try {
        const files = await fs.readdir(configDir);
        return files.filter(file => {
            const ext = path.extname(file).slice(1).toLowerCase();
            return CONFIG_EXTENSIONS.includes(ext);
        });
    } catch {
        return [];
    }
}

/**
 * Compute SHA-256 hash of file content
 */
export async function computeFileHash(filePath: string): Promise<string> {
    try {
        const content = await fs.readFile(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
        return '';
    }
}

/**
 * Prune old backups based on manifest settings
 */
async function pruneOldBackups(configDir: string, manifest: BackupManifest): Promise<void> {
    const now = Date.now();
    const maxAge = manifest.maxAgeDays * 24 * 60 * 60 * 1000;
    const backupDir = getBackupDir(configDir);

    // Filter out old backups
    const validBackups: BackupEntry[] = [];
    const toDelete: BackupEntry[] = [];

    for (const backup of manifest.backups) {
        const backupAge = now - new Date(backup.timestamp).getTime();

        if (backupAge > maxAge) {
            toDelete.push(backup);
        } else {
            validBackups.push(backup);
        }
    }

    // Keep only maxBackups most recent
    validBackups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    while (validBackups.length > manifest.maxBackups) {
        const removed = validBackups.pop();
        if (removed) toDelete.push(removed);
    }

    // Delete old backup directories
    for (const backup of toDelete) {
        const backupPath = path.join(backupDir, backup.id);
        try {
            await fs.rm(backupPath, { recursive: true, force: true });
            console.log(`[BackupManager] Pruned old backup: ${backup.id}`);
        } catch {
            // Ignore deletion errors
        }
    }

    manifest.backups = validBackups;
}

/**
 * Create a versioned backup of all config files
 */
export async function createVersionedBackup(
    configDir: string,
    reason: BackupEntry['reason'],
    metadata?: Record<string, unknown>
): Promise<string> {
    console.log(`[BackupManager] Creating backup (reason: ${reason})`);

    const manifest = await loadBackupManifest(configDir);
    const backupId = generateBackupId();
    const backupPath = path.join(getBackupDir(configDir), backupId);

    // Create backup directory
    await fs.mkdir(backupPath, { recursive: true });

    // Get all config files
    const configFiles = await getConfigFiles(configDir);
    const copiedFiles: string[] = [];

    // Copy each file
    for (const file of configFiles) {
        try {
            const sourcePath = path.join(configDir, file);
            const destPath = path.join(backupPath, file);
            await fs.copyFile(sourcePath, destPath);
            copiedFiles.push(file);
        } catch (e) {
            console.warn(`[BackupManager] Failed to backup ${file}:`, e);
        }
    }

    // Add entry to manifest
    const entry: BackupEntry = {
        id: backupId,
        timestamp: new Date().toISOString(),
        reason,
        files: copiedFiles,
        canRestore: copiedFiles.length > 0,
        metadata,
    };

    manifest.backups.push(entry);

    // Prune old backups
    await pruneOldBackups(configDir, manifest);

    // Save manifest
    await saveBackupManifest(configDir, manifest);

    console.log(`[BackupManager] Backup created: ${backupId} (${copiedFiles.length} files)`);

    // Log to audit
    await logAuditEntry(configDir, {
        action: 'backup-created',
        details: {
            backupId,
            filesModified: copiedFiles,
        },
        result: 'success',
    });

    return backupId;
}

/**
 * Restore from a specific backup
 */
export async function restoreFromBackup(
    configDir: string,
    backupId: string
): Promise<RollbackResult> {
    console.log(`[BackupManager] Restoring from backup: ${backupId}`);

    const manifest = await loadBackupManifest(configDir);
    const backup = manifest.backups.find(b => b.id === backupId);

    if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
    }

    if (!backup.canRestore) {
        throw new Error(`Backup ${backupId} is not restorable`);
    }

    const backupPath = path.join(getBackupDir(configDir), backupId);

    // Create a pre-rollback backup first
    const preRollbackId = await createVersionedBackup(configDir, 'pre-rollback');

    const restored: string[] = [];
    const failed: string[] = [];

    for (const file of backup.files) {
        try {
            const backupFile = path.join(backupPath, file);
            const targetFile = path.join(configDir, file);

            // Verify backup file exists
            await fs.access(backupFile);

            // Copy back
            await fs.copyFile(backupFile, targetFile);
            restored.push(file);

        } catch (e) {
            console.error(`[BackupManager] Failed to restore ${file}:`, e);
            failed.push(file);
        }
    }

    const result: RollbackResult = {
        success: failed.length === 0,
        restored,
        failed,
        backupId,
        preRollbackBackupId: preRollbackId,
    };

    // Log to audit
    await logAuditEntry(configDir, {
        action: 'rollback',
        details: {
            backupId,
            filesModified: restored,
        },
        result: failed.length === 0 ? 'success' : 'partial',
        errors: failed.length > 0 ? failed.map(f => `Failed to restore: ${f}`) : undefined,
    });

    console.log(`[BackupManager] Restore complete: ${restored.length} restored, ${failed.length} failed`);

    return result;
}

/**
 * Get list of available backups
 */
export async function listBackups(configDir: string): Promise<BackupEntry[]> {
    const manifest = await loadBackupManifest(configDir);
    return manifest.backups.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/**
 * Get the most recent backup
 */
export async function getMostRecentBackup(configDir: string): Promise<BackupEntry | null> {
    const backups = await listBackups(configDir);
    return backups.length > 0 ? backups[0] : null;
}

// ============================================
// Audit Logging
// ============================================

/**
 * Load the audit log
 */
async function loadAuditLog(configDir: string): Promise<AuditLog> {
    const logPath = path.join(getBackupDir(configDir), AUDIT_LOG_FILE);

    try {
        const content = await fs.readFile(logPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return { entries: [] };
    }
}

/**
 * Save the audit log
 */
async function saveAuditLog(configDir: string, log: AuditLog): Promise<void> {
    await ensureBackupDir(configDir);
    const logPath = path.join(getBackupDir(configDir), AUDIT_LOG_FILE);
    await fs.writeFile(logPath, JSON.stringify(log, null, 2), 'utf-8');
}

/**
 * Log an audit entry
 */
export async function logAuditEntry(
    configDir: string,
    entry: Omit<AuditEntry, 'timestamp'>
): Promise<void> {
    try {
        const log = await loadAuditLog(configDir);

        log.entries.push({
            ...entry,
            timestamp: new Date().toISOString(),
        });

        // Keep only last 100 entries
        if (log.entries.length > 100) {
            log.entries = log.entries.slice(-100);
        }

        await saveAuditLog(configDir, log);
    } catch (e) {
        console.error('[BackupManager] Failed to log audit entry:', e);
    }
}

/**
 * Get recent audit entries
 */
export async function getAuditLog(
    configDir: string,
    limit: number = 20
): Promise<AuditEntry[]> {
    const log = await loadAuditLog(configDir);
    return log.entries.slice(-limit).reverse();
}

// ============================================
// Safe Boot Mode
// ============================================

const SAFE_BOOT_CONFIGS: Record<string, object> = {
    'sodium-options.json': {
        quality: {
            graphics_quality: 'fast',
            clouds_quality: 'off',
            weather_quality: 'off',
            leaves_quality: 'fast',
        },
        rendering: {
            render_distance: 4,
            simulation_distance: 5,
            max_fps: 60,
            enable_vsync: true,
        },
        advanced: {
            use_advanced_staging_buffers: false,
            cpu_render_ahead_limit: 1,
            allow_direct_memory_access: false,
        },
    },
    'lithium.properties': {
        // Lithium is generally safe, enable all
        'mixin.ai.pathing': true,
        'mixin.entity.collisions': true,
        'mixin.world.chunk_access': true,
    },
    'ferritecore.mixin.json': {
        // FerriteCore memory optimizations
        mixins: {
            enabled: true,
        },
    },
};

/**
 * Apply safe boot mode - minimal, stable configuration
 */
export async function applySafeBootMode(configDir: string): Promise<void> {
    console.log('[BackupManager] Applying SAFE BOOT mode');

    // Create backup first
    await createVersionedBackup(configDir, 'pre-rollback', { reason: 'safe-boot' });

    const modified: string[] = [];

    for (const [filename, config] of Object.entries(SAFE_BOOT_CONFIGS)) {
        try {
            const filePath = path.join(configDir, filename);
            const content = filename.endsWith('.json')
                ? JSON.stringify(config, null, 2)
                : Object.entries(config)
                    .map(([k, v]) => `${k}=${v}`)
                    .join('\n');

            await fs.writeFile(filePath, content, 'utf-8');
            modified.push(filename);
        } catch (e) {
            console.error(`[BackupManager] Failed to apply safe boot for ${filename}:`, e);
        }
    }

    // Log to audit
    await logAuditEntry(configDir, {
        action: 'safe-boot',
        details: {
            filesModified: modified,
        },
        result: 'success',
    });

    console.log('[BackupManager] Safe boot mode applied');
}
