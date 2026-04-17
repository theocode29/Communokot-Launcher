import { join } from 'path';
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
// Sound Physics Remastered: 'qyVF9oeo'
// Simple Voice Chat: '9eGKb6K1'

interface ModConfig {
    name: string;
    projectId: string; // Modrinth Project ID
}

interface ModrinthDependency {
    project_id: string | null;
    dependency_type: string;
}

interface ModrinthVersionFile {
    url: string;
    filename: string;
    primary?: boolean;
}

interface ModrinthVersion {
    files: ModrinthVersionFile[];
    dependencies?: ModrinthDependency[];
}

interface ResolvedModVersion {
    url: string;
    filename: string;
    requiredDependencies: string[];
}

interface ResolvedMod {
    name: string;
    projectId: string;
    filename: string;
    url: string;
}

export interface UpdateModsOptions {
    controllerModeEnabled?: boolean;
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
    { name: 'Sound Physics Remastered', projectId: 'qyVF9oeo' },
    { name: 'Simple Voice Chat', projectId: '9eGKb6K1' },
    { name: 'Mod Menu', projectId: 'mOgUt4GM' },
    { name: 'AmbientSounds', projectId: 'fM515JnW' },
    { name: 'CreativeCore', projectId: 'OsZiaDHq' },
    { name: 'Cool Rain', projectId: 'iDyqnQLT' },
    { name: 'Sound Controller', projectId: 'uY9zbflw' },
    { name: 'Item Landing Sound', projectId: 'T18xfcmD' },
    { name: 'Presence Footsteps', projectId: 'rcTfTZr3' },
];

const CONTROLLER_MODE_MODS: ModConfig[] = [
    { name: 'MidnightControls', projectId: 'bXX9h73M' },
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
async function resolveModVersion(projectId: string, mcVersion: string): Promise<ResolvedModVersion | null> {
    try {
        const url = `https://api.modrinth.com/v2/project/${projectId}/version?loaders=["${LOADER}"]&game_versions=["${mcVersion}"]`;
        const response = await axios.get(url);
        const versions = response.data as ModrinthVersion[];

        if (versions && versions.length > 0) {
            // Get the first (latest) version
            const latest = versions[0];
            const primaryFile = latest.files.find((f) => f.primary) || latest.files[0];
            const requiredDependencies = (latest.dependencies || [])
                .filter((dependency) => dependency.dependency_type === 'required' && !!dependency.project_id)
                .map((dependency) => dependency.project_id as string);

            if (!primaryFile) {
                return null;
            }

            console.log(`[Mods] Resolved ${projectId} (MC ${mcVersion}): ${primaryFile.filename}`);
            return {
                url: primaryFile.url,
                filename: primaryFile.filename,
                requiredDependencies,
            };
        }
    } catch (error) {
        console.error(`[Mods] Failed to resolve version for project ${projectId}`, error);
    }
    return null;
}

async function resolveControllerDependencies(
    dependencies: string[],
    resolvedModsByProject: Map<string, ResolvedMod>,
    mcVersion: string
): Promise<void> {
    const queue = [...dependencies];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const dependencyProjectId = queue.shift();
        if (!dependencyProjectId || visited.has(dependencyProjectId)) {
            continue;
        }

        visited.add(dependencyProjectId);
        const dependencyResult = await resolveModVersion(dependencyProjectId, mcVersion);
        if (!dependencyResult) {
            throw new Error(`Mode manette activé mais dépendance requise introuvable: ${dependencyProjectId} (${mcVersion}).`);
        }

        if (!resolvedModsByProject.has(dependencyProjectId)) {
            resolvedModsByProject.set(dependencyProjectId, {
                name: `Dependency ${dependencyProjectId}`,
                projectId: dependencyProjectId,
                filename: dependencyResult.filename,
                url: dependencyResult.url,
            });
        }

        for (const childDependency of dependencyResult.requiredDependencies) {
            if (!visited.has(childDependency)) {
                queue.push(childDependency);
            }
        }
    }
}


/**
 * Enforces the mods folder to strictly contain only the required optimization mods.
 */
export async function updateMods(rootPath: string, onProgress?: ProgressCallback, options: UpdateModsOptions = {}): Promise<void> {
    const modsPath = join(rootPath, 'mods');
    const { controllerModeEnabled = false } = options;

    if (!existsSync(modsPath)) {
        mkdirSync(modsPath, { recursive: true });
    }

    // 1. Resolve all mods first to get target filenames
    const resolvedModsByProject = new Map<string, ResolvedMod>();

    console.log('[Mods] Resolving mod versions for 1.21.11...');
    onProgress?.("Recherche des versions de mods...", 50);

    for (const mod of REQUIRED_MODS) {
        const result = await resolveModVersion(mod.projectId, TARGET_MC_VERSION);
        if (result) {
            resolvedModsByProject.set(mod.projectId, { name: mod.name, projectId: mod.projectId, ...result });
        } else {
            console.warn(`[Mods] Could not find ${mod.name} for ${TARGET_MC_VERSION}. Skipping.`);
            // In strict mode we might want to throw, but for now we skip to avoid breaking launch
        }
    }

    if (controllerModeEnabled) {
        console.log('[Mods] Controller mode enabled. Resolving MidnightControls and dependencies...');

        for (const mod of CONTROLLER_MODE_MODS) {
            const result = await resolveModVersion(mod.projectId, TARGET_MC_VERSION);
            if (!result) {
                throw new Error(`Mode manette activé mais ${mod.name} est introuvable pour Minecraft ${TARGET_MC_VERSION}.`);
            }

            resolvedModsByProject.set(mod.projectId, { name: mod.name, projectId: mod.projectId, ...result });
            await resolveControllerDependencies(result.requiredDependencies, resolvedModsByProject, TARGET_MC_VERSION);
        }
    }

    const resolvedMods = [...resolvedModsByProject.values()];

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
        const stepProgress = resolvedMods.length > 0 ? (40 / resolvedMods.length) : 40;
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
