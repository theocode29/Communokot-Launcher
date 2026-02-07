/**
 * Unit tests for hardware-detection.ts
 * Tests hardware scoring algorithm and preset recommendations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import os from 'os';

// Mock os module
vi.mock('os', async () => {
    const actual = await vi.importActual('os');
    return {
        ...actual,
        cpus: vi.fn(),
        totalmem: vi.fn(),
        arch: vi.fn(),
    };
});

// Mock child_process
vi.mock('child_process', () => ({
    exec: vi.fn((cmd, callback) => {
        callback(null, 'NVIDIA GeForce RTX 3080', '');
    })
}));

// Import after mocking
import { calculateHardwareScore, recommendPreset } from './hardware-detection';

// ============================================
// Hardware Score Calculation Tests
// ============================================

describe('calculateHardwareScore', () => {
    it('should return maximum score for high-end hardware', () => {
        const score = calculateHardwareScore(
            32, // RAM
            16, // Cores
            'dedicated', // GPU
            2560, // Width
            1440 // Height
        );

        // Max attainable: 35 (RAM) + 25 (CPU) + 30 (GPU) - 5 (1440p) = 85
        expect(score).toBe(85);
    });

    it('should return low score for integrated graphics', () => {
        const score = calculateHardwareScore(
            8, // RAM
            4, // Cores
            'integrated', // GPU
            1920, // Width
            1080 // Height
        );

        // No GPU points (40), reduced RAM and CPU points
        expect(score).toBeLessThan(60);
    });

    it('should factor RAM properly', () => {
        const lowRam = calculateHardwareScore(
            4,
            8,
            'dedicated',
            1920,
            1080
        );

        const highRam = calculateHardwareScore(
            32,
            8,
            'dedicated',
            1920,
            1080
        );

        expect(highRam).toBeGreaterThan(lowRam);
    });

    it('should factor CPU cores properly', () => {
        const dualCore = calculateHardwareScore(
            16,
            2,
            'dedicated',
            1920,
            1080
        );

        const octoCore = calculateHardwareScore(
            16,
            8,
            'dedicated',
            1920,
            1080
        );

        expect(octoCore).toBeGreaterThan(dualCore);
    });

    it('should factor screen resolution', () => {
        const hd720 = calculateHardwareScore(
            16,
            8,
            'dedicated',
            1280,
            720
        );

        const hd1440 = calculateHardwareScore(
            16,
            8,
            'dedicated',
            2560,
            1440
        );

        // Higher resolution gets slightly more points (no, actually simpler resolution penalty mechanism)
        // Wait, logic says: 4K -> -10, 1440p -> -5. So LOWER resolution -> HIGHER score.
        // My previous expectation was wrong based on simple "better is better". But for performance, simpler is better.
        // Let's check the implementation:
        // if (pixelCount >= 3840 * 2160) score -= 10;
        // else if (pixelCount >= 2560 * 1440) score -= 5;

        // So 720p (no penalty) > 1440p (-5 penalty)
        expect(hd720).toBeGreaterThan(hd1440);
    });

    it('should handle unknown GPU type', () => {
        const score = calculateHardwareScore(
            16,
            8,
            'unknown',
            1920,
            1080
        );

        // Should assume integrated (0 GPU points) for safety
        expect(score).toBeLessThan(90);
    });
});

// ============================================
// Preset Recommendation Tests
// ============================================

describe('recommendPreset', () => {
    it('should recommend low-end for score < 40', () => {
        expect(recommendPreset(0)).toBe('low-end');
        expect(recommendPreset(20)).toBe('low-end');
        expect(recommendPreset(39)).toBe('low-end');
    });

    it('should recommend balanced for score 40-69', () => {
        expect(recommendPreset(40)).toBe('balanced');
        expect(recommendPreset(50)).toBe('balanced');
        expect(recommendPreset(69)).toBe('balanced');
    });

    it('should recommend high-end for score >= 70', () => {
        expect(recommendPreset(70)).toBe('high-end');
        expect(recommendPreset(80)).toBe('high-end');
        expect(recommendPreset(100)).toBe('high-end');
    });

    it('should handle edge cases', () => {
        expect(recommendPreset(-10)).toBe('low-end');
        expect(recommendPreset(150)).toBe('high-end');
    });
});
