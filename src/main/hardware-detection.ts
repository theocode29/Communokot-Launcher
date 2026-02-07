/**
 * Hardware detection module for determining optimal performance preset
 */

import { totalmem, cpus, platform } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HardwareInfo, PerformancePreset } from './types/mod-configs';

const execAsync = promisify(exec);

/**
 * Detect GPU type (integrated vs dedicated)
 */
async function detectGPU(): Promise<{ type: 'integrated' | 'dedicated' | 'unknown', name: string }> {
    const os = platform();

    try {
        if (os === 'darwin') {
            // macOS: Use system_profiler
            const { stdout } = await execAsync('system_profiler SPDisplaysDataType');

            // Look for common integrated GPU names
            const isIntegrated = /Intel (HD|UHD|Iris)|Apple (M\d)/i.test(stdout);

            // Extract GPU name
            const nameMatch = stdout.match(/Chipset Model:\s*(.+)/);
            const name = nameMatch ? nameMatch[1].trim() : 'Unknown GPU';

            return {
                type: isIntegrated ? 'integrated' : 'dedicated',
                name
            };
        } else if (os === 'win32') {
            // Windows: Use wmic
            const { stdout } = await execAsync('wmic path win32_VideoController get name');

            const lines = stdout.split('\n').filter(line => line.trim() && line.trim() !== 'Name');
            const name = lines[0]?.trim() || 'Unknown GPU';

            // Common integrated GPU indicators
            const isIntegrated = /Intel (HD|UHD)|AMD Radeon.*Vega|Intel Iris/i.test(name);

            return {
                type: isIntegrated ? 'integrated' : 'dedicated',
                name
            };
        } else {
            // Linux: Use lspci
            const { stdout } = await execAsync('lspci | grep -i vga');

            const isIntegrated = /Intel.*Integrated|Intel.*HD|Intel.*UHD/i.test(stdout);
            const name = stdout.trim() || 'Unknown GPU';

            return {
                type: isIntegrated ? 'integrated' : 'dedicated',
                name
            };
        }
    } catch (error) {
        console.warn('[Hardware Detection] Failed to detect GPU:', error);
        return { type: 'unknown', name: 'Unknown GPU' };
    }
}

/**
 * Get screen resolution
 * Note: This should be called from the main process with screen module available
 */
export function getScreenResolution(): { width: number, height: number } {
    try {
        // This will be called from main process where screen is available
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        return {
            width: primaryDisplay.bounds.width,
            height: primaryDisplay.bounds.height
        };
    } catch (error) {
        console.warn('[Hardware Detection] Failed to get screen resolution:', error);
        // Default to 1920x1080 if detection fails
        return { width: 1920, height: 1080 };
    }
}

/**
 * Calculate a hardware score (0-100)
 * Higher score = better hardware
 */
export function calculateHardwareScore(
    totalRamGB: number,
    cpuCores: number,
    gpuType: 'integrated' | 'dedicated' | 'unknown',
    screenWidth: number,
    screenHeight: number
): number {
    let score = 0;

    // RAM contribution (0-35 points)
    if (totalRamGB >= 16) score += 35;
    else if (totalRamGB >= 12) score += 28;
    else if (totalRamGB >= 8) score += 20;
    else if (totalRamGB >= 6) score += 12;
    else score += 5;

    // CPU contribution (0-25 points)
    if (cpuCores >= 8) score += 25;
    else if (cpuCores >= 6) score += 20;
    else if (cpuCores >= 4) score += 12;
    else score += 5;

    // GPU contribution (0-30 points)
    if (gpuType === 'dedicated') score += 30;
    else if (gpuType === 'integrated') score += 10;
    else score += 15; // Unknown, assume mid-range

    // Resolution penalty (0-10 points deduction)
    const pixelCount = screenWidth * screenHeight;
    let pixelPenalty = 0;
    if (pixelCount >= 3840 * 2160) pixelPenalty = 10; // 4K
    else if (pixelCount >= 2560 * 1440) pixelPenalty = 5; // 1440p

    score -= pixelPenalty;

    console.log(`[Hardware] Score Calculation: RAM=${totalRamGB}GB, Cores=${cpuCores}, GPU=${gpuType}, Res=${screenWidth}x${screenHeight}`);
    console.log(`[Hardware] Points: Base=${score + pixelPenalty}, Penalty=-${pixelPenalty}, Total=${Math.max(0, Math.min(100, score))}`);

    return Math.max(0, Math.min(100, score));
}

/**
 * Determine recommended preset based on hardware score
 */
export function recommendPreset(score: number): PerformancePreset {
    if (score >= 70) return 'high-end';
    if (score >= 40) return 'balanced';
    return 'low-end';
}

/**
 * Detect hardware and recommend a performance preset
 */
export async function detectHardware(): Promise<HardwareInfo> {
    console.log('[Hardware Detection] Starting hardware detection...');

    // Get RAM
    const totalRamBytes = totalmem();
    const totalRamGB = Math.round(totalRamBytes / (1024 ** 3));

    // Get CPU cores
    const cpuCores = cpus().length;

    // Get GPU
    const { type: gpuType, name: gpuName } = await detectGPU();

    // Get screen resolution
    const screenResolution = getScreenResolution();

    // Calculate score
    const score = calculateHardwareScore(totalRamGB, cpuCores, gpuType, screenResolution.width, screenResolution.height);

    // Determine recommended preset
    const recommendedPreset = recommendPreset(score);

    const info: HardwareInfo = {
        totalRamGB,
        cpuCores,
        gpuType,
        gpuName,
        screenResolution,
        recommendedPreset,
        score
    };

    console.log('[Hardware Detection] Results:', {
        RAM: `${totalRamGB}GB`,
        CPU: `${cpuCores} cores`,
        GPU: `${gpuName} (${gpuType})`,
        Resolution: `${screenResolution.width}x${screenResolution.height}`,
        Score: score,
        Recommended: recommendedPreset
    });

    return info;
}
