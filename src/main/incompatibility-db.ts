/**
 * Known Incompatibilities Database
 * Tracks known conflicts between mods, hardware, and configurations
 */

import os from 'os';

// ============================================
// Types
// ============================================

export interface HardwarePattern {
    cpuModel?: RegExp | string;
    cpuArch?: string;
    gpuVendor?: string;
    gpuName?: RegExp | string;
    driverVersion?: string;
    minRam?: number;
    maxRam?: number;
}

export interface DriverPattern {
    vendor: string;
    versionRange: string;
}

export interface ConfigPatch {
    mod: string;
    patch: Record<string, unknown>;
}

export interface KnownIncompatibility {
    id: string;
    description: string;
    conditions: {
        mods?: string[];
        hardware?: HardwarePattern;
        os?: string[];
        drivers?: DriverPattern;
    };
    impact: 'crash' | 'visual-glitch' | 'performance-degradation' | 'data-corruption';
    workaround?: ConfigPatch;
    disableFeature?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface HardwareInfo {
    cpuModel: string;
    cpuArch: string;
    cpuCores: number;
    totalRamGB: number;
    gpuName: string;
    gpuVendor: string;
    gpuType: 'integrated' | 'dedicated' | 'unknown';
    driverVersion?: string;
    os: string;
}

export interface IncompatibilityCheckResult {
    detected: KnownIncompatibility[];
    appliedWorkarounds: string[];
    warnings: string[];
    patchedConfigs: Map<string, Record<string, unknown>>;
}

// ============================================
// Known Incompatibilities Database
// ============================================

export const KNOWN_INCOMPATIBILITIES: KnownIncompatibility[] = [
    // Intel 13th/14th Gen CPU instability
    {
        id: 'intel-13th-14th-gen-instability',
        description: 'Intel 13th/14th gen CPUs may crash with aggressive rendering settings due to known microcode issues',
        conditions: {
            hardware: { cpuModel: /i[579]-(1[34][0-9]{3}|1[34][0-9]{2}[A-Z]?)/ }
        },
        impact: 'crash',
        severity: 'critical',
        workaround: {
            mod: 'sodium-options.json',
            patch: {
                advanced: {
                    cpu_render_ahead_limit: 2,
                    allow_direct_memory_access: false,
                },
                rendering: {
                    max_fps: 120, // Cap FPS to reduce CPU stress
                }
            }
        }
    },

    // Apple Silicon Metal limitations
    {
        id: 'apple-silicon-opengl-compat',
        description: 'Apple Silicon requires specific OpenGL settings due to Metal translation layer',
        conditions: {
            hardware: { cpuArch: 'arm64' },
            os: ['darwin']
        },
        impact: 'visual-glitch',
        severity: 'medium',
        workaround: {
            mod: 'sodium-options.json',
            patch: {
                advanced: {
                    use_advanced_staging_buffers: false,
                }
            }
        }
    },

    // Low VRAM with high render distance
    {
        id: 'low-vram-render-distance',
        description: 'Low VRAM systems may crash with high render distances',
        conditions: {
            hardware: { maxRam: 4 } // Less than 4GB RAM often means integrated GPU
        },
        impact: 'crash',
        severity: 'high',
        workaround: {
            mod: 'sodium-options.json',
            patch: {
                rendering: {
                    render_distance: 6,
                    simulation_distance: 6,
                },
                quality: {
                    clouds_quality: 'off',
                    weather_quality: 'fast',
                }
            }
        }
    },

    // AMD driver issues with particle culling
    {
        id: 'amd-particle-culling',
        description: 'Some AMD drivers have issues with particle culling optimization',
        conditions: {
            hardware: { gpuVendor: 'AMD' }
        },
        impact: 'visual-glitch',
        severity: 'low',
        workaround: {
            mod: 'sodium-options.json',
            patch: {
                performance: {
                    use_particle_culling: false,
                }
            }
        }
    },

    // Integrated graphics general safety
    {
        id: 'integrated-graphics-safety',
        description: 'Integrated graphics should use conservative settings',
        conditions: {
            hardware: {
                gpuName: /(Intel.*HD|Intel.*UHD|Intel.*Iris|AMD.*Vega|AMD.*Radeon.*Graphics)/i
            }
        },
        impact: 'performance-degradation',
        severity: 'medium',
        workaround: {
            mod: 'sodium-options.json',
            patch: {
                rendering: {
                    render_distance: 8,
                    enable_vsync: true,
                },
                quality: {
                    graphics_quality: 'fast',
                    leaves_quality: 'fast',
                }
            }
        }
    },

    // ImmediatelyFast + Sodium compatibility
    {
        id: 'immediatelyfast-sodium-compat',
        description: 'ImmediatelyFast may conflict with some Sodium settings',
        conditions: {
            mods: ['sodium', 'immediatelyfast']
        },
        impact: 'visual-glitch',
        severity: 'low',
        workaround: {
            mod: 'immediatelyfast.json',
            patch: {
                experimental_screen_batching: false,
            }
        }
    },
];

// ============================================
// Matching Functions
// ============================================

/**
 * Check if hardware matches a pattern
 */
function matchesHardwarePattern(hardware: HardwareInfo, pattern: HardwarePattern): boolean {
    if (pattern.cpuModel) {
        const regex = pattern.cpuModel instanceof RegExp
            ? pattern.cpuModel
            : new RegExp(pattern.cpuModel, 'i');
        if (!regex.test(hardware.cpuModel)) return false;
    }

    if (pattern.cpuArch && hardware.cpuArch !== pattern.cpuArch) {
        return false;
    }

    if (pattern.gpuVendor) {
        const vendor = pattern.gpuVendor.toLowerCase();
        if (!hardware.gpuVendor.toLowerCase().includes(vendor) &&
            !hardware.gpuName.toLowerCase().includes(vendor)) {
            return false;
        }
    }

    if (pattern.gpuName) {
        const regex = pattern.gpuName instanceof RegExp
            ? pattern.gpuName
            : new RegExp(pattern.gpuName, 'i');
        if (!regex.test(hardware.gpuName)) return false;
    }

    if (pattern.minRam !== undefined && hardware.totalRamGB < pattern.minRam) {
        return false;
    }

    if (pattern.maxRam !== undefined && hardware.totalRamGB > pattern.maxRam) {
        return false;
    }

    return true;
}

/**
 * Check if an incompatibility's conditions are met
 */
function matchesConditions(
    incomp: KnownIncompatibility,
    hardware: HardwareInfo,
    installedMods: string[]
): boolean {
    const { conditions } = incomp;

    // Check OS
    if (conditions.os && !conditions.os.includes(hardware.os)) {
        return false;
    }

    // Check required mods
    if (conditions.mods) {
        const hasAllMods = conditions.mods.every(mod =>
            installedMods.some(m => m.toLowerCase().includes(mod.toLowerCase()))
        );
        if (!hasAllMods) return false;
    }

    // Check hardware pattern
    if (conditions.hardware && !matchesHardwarePattern(hardware, conditions.hardware)) {
        return false;
    }

    return true;
}

/**
 * Deep merge two objects
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = deepMerge(
                (result[key] as Record<string, unknown>) || {},
                value as Record<string, unknown>
            );
        } else {
            result[key] = value;
        }
    }

    return result;
}

// ============================================
// Main Functions
// ============================================

/**
 * Check for known incompatibilities and apply workarounds
 */
export function checkIncompatibilities(
    hardware: HardwareInfo,
    installedMods: string[],
    currentConfigs: Map<string, Record<string, unknown>>
): IncompatibilityCheckResult {
    const detected: KnownIncompatibility[] = [];
    const appliedWorkarounds: string[] = [];
    const warnings: string[] = [];
    const patchedConfigs = new Map(currentConfigs);

    console.log('[Incompatibility] Checking for known incompatibilities...');
    console.log(`[Incompatibility] Hardware: ${hardware.cpuModel}, ${hardware.gpuName}`);
    console.log(`[Incompatibility] Mods: ${installedMods.join(', ')}`);

    for (const incomp of KNOWN_INCOMPATIBILITIES) {
        if (matchesConditions(incomp, hardware, installedMods)) {
            console.log(`[Incompatibility] Detected: ${incomp.id}`);
            detected.push(incomp);

            if (incomp.workaround) {
                const modFile = incomp.workaround.mod;
                const currentConfig = patchedConfigs.get(modFile) || {};
                const patched = deepMerge(currentConfig, incomp.workaround.patch as Record<string, unknown>);
                patchedConfigs.set(modFile, patched);
                appliedWorkarounds.push(incomp.id);
                console.log(`[Incompatibility] Applied workaround for: ${incomp.id}`);
            }

            if (incomp.severity === 'critical' || incomp.severity === 'high') {
                warnings.push(`${incomp.description} (${incomp.impact})`);
            }
        }
    }

    console.log(`[Incompatibility] Detected ${detected.length} issues, applied ${appliedWorkarounds.length} workarounds`);

    return {
        detected,
        appliedWorkarounds,
        warnings,
        patchedConfigs,
    };
}

/**
 * Get basic hardware info for incompatibility checking
 */
export function getBasicHardwareInfo(): HardwareInfo {
    const cpus = os.cpus();

    return {
        cpuModel: cpus[0]?.model || 'Unknown',
        cpuArch: os.arch(),
        cpuCores: cpus.length,
        totalRamGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
        gpuName: 'Unknown', // Will be populated by hardware-detection
        gpuVendor: 'Unknown',
        gpuType: 'unknown',
        os: process.platform,
    };
}

/**
 * Get list of all known incompatibility IDs
 */
export function getAllIncompatibilityIds(): string[] {
    return KNOWN_INCOMPATIBILITIES.map(i => i.id);
}

/**
 * Get incompatibility by ID
 */
export function getIncompatibilityById(id: string): KnownIncompatibility | undefined {
    return KNOWN_INCOMPATIBILITIES.find(i => i.id === id);
}
