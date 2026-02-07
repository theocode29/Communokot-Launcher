/**
 * Unit tests for backup-manager.ts
 * Tests backup creation, restoration, manifest management, and pruning
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import os from 'os';
import {
    createVersionedBackup,
    restoreFromBackup,
    loadBackupManifest,
    listBackups
} from './backup-manager';

// ============================================
// Setup
// ============================================

const TEST_DIR = path.join(os.tmpdir(), 'backup-test-' + Date.now());
const BACKUP_DIR = path.join(TEST_DIR, '.launcher-backups');

beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
    try {
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
        // Ignore errors
    }
});

// ============================================
// Backup Creation Tests
// ============================================

describe('createVersionedBackup', () => {
    it('should create a backup of config files', async () => {
        // Create dummy config file
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{"key": "value"}');

        const backupId = await createVersionedBackup(TEST_DIR, 'manual');

        expect(backupId).toBeDefined();

        // Check if backup directory exists
        const backupPath = path.join(BACKUP_DIR, backupId);
        const exists = await fs.access(backupPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // Check if file is inside backup
        const fileExists = await fs.access(path.join(backupPath, 'test.json')).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
    });

    it('should update manifest', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{}');
        const backupId = await createVersionedBackup(TEST_DIR, 'manual');

        const manifest = await loadBackupManifest(TEST_DIR);

        expect(manifest.backups).toHaveLength(1);
        expect(manifest.backups[0].id).toBe(backupId);
        expect(manifest.backups[0].reason).toBe('manual');
    });

    it('should not backup non-config files', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'test.txt'), 'text file'); // Not in whitelist
        const backupId = await createVersionedBackup(TEST_DIR, 'manual');

        const backupPath = path.join(BACKUP_DIR, backupId);
        const fileExists = await fs.access(path.join(backupPath, 'test.txt')).then(() => true).catch(() => false);
        expect(fileExists).toBe(false);
    });
});

// ============================================
// Restore Tests
// ============================================

describe('restoreFromBackup', () => {
    it('should restore files from backup', async () => {
        // 1. Create original state
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{"original": true}');
        const backupId = await createVersionedBackup(TEST_DIR, 'manual');

        // 2. Modify state
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{"modified": true}');

        // 3. Restore
        const result = await restoreFromBackup(TEST_DIR, backupId);

        expect(result.success).toBe(true);
        expect(result.restored).toContain('test.json');

        // 4. Verify content
        const content = await fs.readFile(path.join(TEST_DIR, 'test.json'), 'utf-8');
        expect(content).toBe('{"original": true}');
    });

    it('should create pre-rollback backup', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{"data": 1}');
        const backupId = await createVersionedBackup(TEST_DIR, 'manual');

        // Modify
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{"data": 2}');

        const result = await restoreFromBackup(TEST_DIR, backupId);

        expect(result.preRollbackBackupId).toBeDefined();

        // Verify pre-rollback backup contains the modified state
        const preRollbackPath = path.join(BACKUP_DIR, result.preRollbackBackupId!);
        const content = await fs.readFile(path.join(preRollbackPath, 'test.json'), 'utf-8');
        expect(content).toBe('{"data": 2}');
    });
});

// ============================================
// Pruning Tests
// ============================================

describe('Backup Pruning', () => {
    it('should keep max 10 backups by default', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'test.json'), '{}');

        // Create 12 backups
        for (let i = 0; i < 12; i++) {
            await createVersionedBackup(TEST_DIR, 'manual');
            // Small delay to ensure unique timestamps/IDs if running fast
            await new Promise(r => setTimeout(r, 10));
        }

        const backups = await listBackups(TEST_DIR);
        expect(backups.length).toBeLessThanOrEqual(10);

        // Should verify folders were deleted too
        const dirs = await fs.readdir(BACKUP_DIR);
        // dirs contains manifest + audit log + backups
        // so backup dirs = dirs - 2
        const backupDirs = dirs.filter(d => !d.endsWith('.json'));
        expect(backupDirs.length).toBeLessThanOrEqual(10);
    });
});
