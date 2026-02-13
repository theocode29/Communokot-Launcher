import { join, basename } from 'path';
import { readdirSync, unlinkSync, existsSync, createWriteStream, mkdirSync } from 'fs';
import axios from 'axios';
import { pipeline } from 'stream/promises';
import { ProgressCallback } from './fabric';

// Project IDs from Modrinth (Slug -> ID)
// Sodium: 'AANobbMI'
// Fabric API: 'P7dR8mSH'
// ImmediatelyFast: '5ZwdcRci'
// FerriteCore: 'uXXizFIs'
// Entity Culling: 'NNAgCjsB'
// Lithium: 'gvQqBUqZ'
// LazyDFU: 'hvFnDODi'
// ModernFix: 'nmDcB62a'
// Sodium Leaf Culling: 'M25bkObt'

interface ModConfig {
    name: string;
    projectId: string; // Modrinth Project ID
}

const REQUIRED_MODS: ModConfig[] = [
    { name: 'Fabric API', projectId: 'P7dR8mSH' },
    { name: 'Sodium', projectId: 'AANobbMI' },
    { name: 'ImmediatelyFast', projectId: '5ZwdcRci' },
    { name: 'FerriteCore', projectId: 'uXXizFIs' },
    { name: 'Entity Culling', projectId: 'NNAgCjsB' },
    { name: 'Lithium', projectId: 'gvQqBUqZ' },
    { name: 'LazyDFU', projectId: 'hvFnDODi' },
    { name: 'ModernFix', projectId: 'nmDcB62a' },
    { name: 'Sodium Leaf Culling', projectId: 'M25bkObt' },
];

const TARGET_MC_VERSION = '1.21.11';
const LOADER = 'fabric';

/**
 * Downloads a file from a URL to a destination path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    await pipeline(response.data, createWriteStream(destPath));
}

/**
 * Resolves the latest version of a mod for the target Minecraft version from Modrinth.
 */
async function resolveModVersion(projectId: string, mcVersion: string): Promise<{ url: string, filename: string } | null> {
    try {
        const url = `https://api.modrinth.com/v2/project/${projectId}/version?loaders=["${LOADER}"]&game_versions=["${mcVersion}"]`;
        const response = await axios.get(url);
        const versions = response.data;

        if (versions && versions.length > 0) {
            // Get the first (latest) version
            const latest = versions[0];
            const primaryFile = latest.files.find((f: any) => f.primary) || latest.files[0];

            console.log(`[Mods] Resolved ${projectId} (MC ${mcVersion}): ${primaryFile.filename}`);
            return {
                url: primaryFile.url,
                filename: primaryFile.filename
            };
        }
    } catch (error) {
        console.error(`[Mods] Failed to resolve version for project ${projectId}`, error);
    }
    return null;
}


/**
 * Enforces the mods folder to strictly contain only the required optimization mods.
 */
export async function updateMods(rootPath: string, onProgress?: ProgressCallback): Promise<void> {
    const modsPath = join(rootPath, 'mods');

    if (!existsSync(modsPath)) {
        mkdirSync(modsPath, { recursive: true });
    }

    // 1. Resolve all mods first to get target filenames
    const resolvedMods: { name: string, filename: string, url: string }[] = [];

    // Total steps: Resolving (1 step) + Downloading (N steps)
    const totalSteps = 1 + REQUIRED_MODS.length;
    let currentStep = 0;

    console.log('[Mods] Resolving mod versions for 1.21.11...');
    onProgress?.("Recherche des versions de mods...", 50);

    for (const mod of REQUIRED_MODS) {
        const result = await resolveModVersion(mod.projectId, TARGET_MC_VERSION);
        if (result) {
            resolvedMods.push({ name: mod.name, ...result });
        } else {
            console.warn(`[Mods] Could not find ${mod.name} for ${TARGET_MC_VERSION}. Skipping.`);
            // In strict mode we might want to throw, but for now we skip to avoid breaking launch
        }
    }
    currentStep++;

    // 2. Cleanup old files
    const currentFiles = readdirSync(modsPath);
    const requiredFilenames = new Set(resolvedMods.map(m => m.filename));

    for (const file of currentFiles) {
        if (!requiredFilenames.has(file) && file.endsWith('.jar')) {
            console.log(`[Mods] Removing unneeded mod: ${file}`);
            try {
                unlinkSync(join(modsPath, file));
            } catch (e) {
                console.error(`[Mods] Failed to delete ${file}:`, e);
            }
        }
    }

    // 3. Download missing files
    for (const [index, mod] of resolvedMods.entries()) {
        const filePath = join(modsPath, mod.filename);

        // Progress mapping: 50 -> 90
        // We have resolvedMods.length items to process
        const stepProgress = 40 / resolvedMods.length;
        const globalProgress = 50 + (index * stepProgress);

        if (!existsSync(filePath)) {
            console.log(`[Mods] Downloading ${mod.name}...`);
            onProgress?.(`Téléchargement de ${mod.name}...`, Math.round(globalProgress));

            try {
                await downloadFile(mod.url, filePath);
                console.log(`[Mods] ${mod.name} installed.`);
            } catch (e) {
                console.error(`[Mods] Failed to download ${mod.name}:`, e);
                throw new Error(`Failed to download ${mod.name}`);
            }
        }
    }

    console.log(`[Mods] ${resolvedMods.length} optimization mods valid.`);
    onProgress?.('Mods à jour.', 90);
}
