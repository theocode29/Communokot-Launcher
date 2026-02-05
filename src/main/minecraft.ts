import { join } from 'path';
import { homedir, platform } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { ResourcePackManager } from './resourcepack';
import { ensureFabricInstalled } from './fabric';
import { updateMods } from './mods';

const require = createRequire(import.meta.url);
const { Client, Authenticator } = require('minecraft-launcher-core');

import { ProgressCallback } from './fabric';

export interface LaunchOptions {
    username: string;
    ram: number;
    javaPath?: string;
    minecraftPath?: string;
    onProgress?: ProgressCallback; // Callback for UI updates
}

export interface LaunchResult {
    success: boolean;
    error?: string;
    message?: string;
}

// Server configuration
const MC_SERVER_NAME = 'Communokot';
const MC_SERVER_IP = 'mc1949282.fmcs.cloud';
const MC_SERVER_PORT = 25565;

/**
 * Get default Minecraft installation path
 */
function getDefaultMinecraftPath(): string {
    const os = platform();

    if (os === 'darwin') {
        return join(homedir(), 'Library', 'Application Support', 'minecraft');
    } else if (os === 'win32') {
        return join(process.env.APPDATA || '', '.minecraft');
    } else {
        return join(homedir(), '.minecraft');
    }
}

/**
 * Launch Minecraft using minecraft-launcher-core
 */
export async function launchMinecraft(options: LaunchOptions): Promise<LaunchResult> {
    const { username, ram, minecraftPath, onProgress } = options;

    if (!username || username.trim().length === 0) {
        return { success: false, error: 'Le pseudo ne peut pas être vide' };
    }

    const rootPath = minecraftPath || getDefaultMinecraftPath();

    // Create root if it doesn't exist
    if (!existsSync(rootPath)) {
        mkdirSync(rootPath, { recursive: true });
    }

    // --- Resource Pack Auto-Update ---
    try {
        console.log('[Launcher] Checking for resource pack updates...');
        onProgress?.('Vérification des packs de ressources...', 5);
        const resourcePackManager = new ResourcePackManager();
        await resourcePackManager.checkAndInstall(rootPath);
        console.log('[Launcher] Resource pack check completed.');
    } catch (error) {
        console.error('[Launcher] Resource pack update failed (non-fatal):', error);
    }
    // ---------------------------------

    // --- Fabric & Mods Auto-Update (NEW) ---
    let fabricVersionId: string = '1.21.11'; // Default fallback
    try {
        console.log('[Launcher:Flow] Step 1: Fabric Installation');
        console.log('[Launcher] Ensuring Fabric is installed...');
        // We use system 'java' for the installer. 
        // In a perfect world, we'd use the specific runtime from options.javaPath if valid, but 'java' usually works for the CLI installer.
        fabricVersionId = await ensureFabricInstalled(rootPath, options.javaPath || 'java', onProgress);
        console.log(`[Launcher:Flow] Step 1 Complete. Fabric ID: ${fabricVersionId}`);

        console.log('[Launcher:Flow] Step 2: Mod Updates');
        console.log('[Launcher] Updating optimization mods...');
        await updateMods(rootPath, onProgress);
        console.log('[Launcher:Flow] Step 2 Complete. Mods updated.');
    } catch (error) {
        console.error('[Launcher:Flow] CRITICAL ERROR in Fabric/Mods Setup:', error);
        return { success: false, error: 'Erreur lors de l’installation de Fabric/Mods: ' + (error as Error).message };
    }
    // ---------------------------------------

    const launcher = new Client();
    console.log('[Launcher:Flow] Step 3: Configuring MCLC');

    // Determine authorization (Offline mode based on username)
    // Note: For true online mode, we would need to implement Microsoft Auth flow
    const authorization = Authenticator.getAuth(username);

    console.log(`[Launcher] Starting launch process for ${username} with version ${fabricVersionId}`);
    console.log(`[Launcher] Target Server: ${MC_SERVER_IP}:${MC_SERVER_PORT}`);

    onProgress?.("Démarrage du jeu...", 95);

    const launchOptions = {
        clientPackage: null,
        authorization: authorization,
        root: rootPath,
        version: {
            number: '1.21.11', // The base MC version
            type: "release",
            custom: fabricVersionId // The folder name in versions/ which contains the fabric json
        },
        memory: {
            max: `${ram}G`,
            min: `${Math.max(2, ram / 2)}G`
        },
        javaPath: options.javaPath && options.javaPath !== 'auto' ? options.javaPath : undefined,
        quickPlay: {
            type: "multiplayer",
            identifier: `${MC_SERVER_IP}:${MC_SERVER_PORT}`
        }
    };

    console.log('[Launcher:Flow] Launch options prepared:', JSON.stringify(launchOptions, null, 2));

    return new Promise((resolve) => {
        // Event listeners for debugging
        launcher.on('debug', (e: any) => console.log(`[MCLC Debug] ${e}`));
        launcher.on('data', (e: any) => console.log(`[MCLC Data] ${e}`));

        launcher.on('progress', (e: any) => {
            console.log(`[MCLC Progress] ${e.type} - ${Math.round(e.task / e.total * 100)}%`);
            // MCLC reports progress for game assets/libraries download
            // We map this to the 90-100% range of our global progress if needed,
            // OR we just use the text. MCLC progress is often verbose.
            // Let's just update text.
            onProgress?.(`Téléchargement des fichiers du jeu (${Math.round(e.task / e.total * 100)}%)...`, 95);
        });

        launcher.on('close', (code: number) => {
            console.log(`[Launcher] Game closed with code ${code}`);
        });

        // Launch the game
        console.log('[Launcher:Flow] Invoking MCLC launcher.launch()...');
        launcher.launch(launchOptions).then(() => {
            // Success assumes the process started. MCLC launch returns promise when process spawns?
            // Actually MCLC launch returns a Promise<void> that resolves when the game process starts
            console.log('[Launcher] Game process started successfully');
            onProgress?.("Jeu lancé !", 100);
            resolve({
                success: true,
                message: undefined // UI will not show message
            });
        }).catch((err: any) => {
            console.error('[Launcher] Error during launch:', err);
            resolve({
                success: false,
                error: err.message || 'Erreur lors du lancement du jeu'
            });
        });
    });
}
