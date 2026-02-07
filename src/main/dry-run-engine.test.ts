/**
 * Unit tests for dry-run-engine.ts
 * Tests preset simulation and diff calculation
 */

import { describe, it, expect } from 'vitest';
import {
    dryRunPresetApplication,
    formatDryRunResult
} from './dry-run-engine';
import * as fs from 'fs/promises';
import * as path from 'path';
import os from 'os';

// ============================================
// Diff Calculation Tests
// ============================================

describe('Diff Calculation', () => {
    it('should detect added keys', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));

        // Create empty config
        await fs.writeFile(
            path.join(tempDir, 'test.json'),
            JSON.stringify({}),
            'utf-8'
        );

        const result = await dryRunPresetApplication(
            tempDir,
            { 'test.json': { newKey: 'value' } },
            {},
            { showDiff: true }
        );

        expect(result.success).toBe(true);
        expect(result.changes[0].changedKeys).toContain('newKey');

        // Cleanup
        await fs.rm(tempDir, { recursive: true });
    });

    it('should detect modified keys', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));

        // Create config with existing value
        await fs.writeFile(
            path.join(tempDir, 'test.json'),
            JSON.stringify({ existingKey: 'oldValue' }),
            'utf-8'
        );

        const result = await dryRunPresetApplication(
            tempDir,
            { 'test.json': { existingKey: 'newValue' } },
            {},
            { showDiff: true }
        );

        expect(result.success).toBe(true);
        expect(result.changes[0].changedKeys).toContain('existingKey');

        // Cleanup
        await fs.rm(tempDir, { recursive: true });
    });

    it('should preserve user-modified keys', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));

        await fs.writeFile(
            path.join(tempDir, 'test.json'),
            JSON.stringify({ userKey: 'userValue', presetKey: 'oldValue' }),
            'utf-8'
        );

        const result = await dryRunPresetApplication(
            tempDir,
            { 'test.json': { userKey: 'presetValue', presetKey: 'newValue' } },
            { 'test.json': ['userKey'] }, // Mark userKey as user-modified
            { preserveUserModifications: true, showDiff: true }
        );

        expect(result.success).toBe(true);
        expect(result.changes[0].preservedKeys).toContain('userKey');
        expect(result.changes[0].changedKeys).toContain('presetKey');

        // Cleanup
        await fs.rm(tempDir, { recursive: true });
    });

    it('should skip files with no changes', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));

        // Create config with same values as preset
        await fs.writeFile(
            path.join(tempDir, 'test.json'),
            JSON.stringify({ key: 'value' }),
            'utf-8'
        );

        const result = await dryRunPresetApplication(
            tempDir,
            { 'test.json': { key: 'value' } }, // Same value
            {},
            { showDiff: true }
        );

        expect(result.success).toBe(true);
        expect(result.changes[0].type).toBe('skip');

        // Cleanup
        await fs.rm(tempDir, { recursive: true });
    });
});

// ============================================
// Format Result Tests
// ============================================

describe('formatDryRunResult', () => {
    it('should format successful result', () => {
        const result = {
            success: true,
            changes: [
                { file: 'test.json', type: 'modify' as const, changedKeys: ['key1'], preservedKeys: [] }
            ],
            warnings: [],
            errors: [],
            summary: {
                preset: 'balanced',
                affectedFiles: 1,
                skippedFiles: 0,
                totalChangedKeys: 1
            }
        };

        const formatted = formatDryRunResult(result);

        expect(formatted).toContain('DRY RUN RESULT');
        expect(formatted).toContain('SUCCESS');
        expect(formatted).toContain('test.json');
    });

    it('should include warnings', () => {
        const result = {
            success: true,
            changes: [],
            warnings: ['User modifications preserved'],
            errors: [],
            summary: {
                preset: 'balanced',
                affectedFiles: 0,
                skippedFiles: 0,
                totalChangedKeys: 0
            }
        };

        const formatted = formatDryRunResult(result);

        expect(formatted).toContain('Warnings');
        expect(formatted).toContain('User modifications preserved');
    });

    it('should include errors', () => {
        const result = {
            success: false,
            changes: [],
            warnings: [],
            errors: ['File not found'],
            summary: {
                preset: 'balanced',
                affectedFiles: 0,
                skippedFiles: 0,
                totalChangedKeys: 0
            }
        };

        const formatted = formatDryRunResult(result);

        expect(formatted).toContain('FAILED');
        expect(formatted).toContain('Errors');
        expect(formatted).toContain('File not found');
    });
});
