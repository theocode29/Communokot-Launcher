import { join } from 'path';
import { homedir, platform } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { ResourcePackManager } from './resourcepack';

const require = createRequire(import.meta.url);
const { Client, Authenticator } = require('minecraft-launcher-core');

export interface LaunchOptions {
    username: string;
    ram: number;
    javaPath?: string;
    minecraftPath?: string;
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
    const { username, ram, minecraftPath } = options;

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
        const resourcePackManager = new ResourcePackManager();
        await resourcePackManager.checkAndInstall(rootPath);
    } catch (error) {
        console.error('[Launcher] Resource pack update failed (non-fatal):', error);
    }
    // ---------------------------------

    const launcher = new Client();

    // Determine authorization (Offline mode based on username)
    // Note: For true online mode, we would need to implement Microsoft Auth flow
    const authorization = Authenticator.getAuth(username);

    // Initial version to try
    // The user strictly requested 1.21.11 support
    let versionNumber = '1.21.11';

    // Check if 1.21.11 exists, if not fall back to 1.21.1
    const v11Path = join(rootPath, 'versions', '1.21.11');
    const v1Path = join(rootPath, 'versions', '1.21.1');

    if (existsSync(v11Path)) {
        console.log('[Launcher] Found custom version 1.21.11');
        versionNumber = '1.21.11';
    } else if (existsSync(v1Path)) {
        console.log('[Launcher] Found version 1.21.1');
        versionNumber = '1.21.1';
    } else {
        // Default to asking for 1.21.1 if neither found (MCLC might download it)
        console.log('[Launcher] Version not found locally, requesting 1.21.1');
        versionNumber = '1.21.1';
    }

    console.log(`[Launcher] Starting launch process for ${username} with version ${versionNumber}`);
    console.log(`[Launcher] Target Server: ${MC_SERVER_IP}:${MC_SERVER_PORT}`);

    const launchOptions = {
        clientPackage: null,
        authorization: authorization,
        root: rootPath,
        version: {
            number: versionNumber,
            type: "release",
            custom: versionNumber === '1.21.11' ? '1.21.11' : undefined // Mark as custom if it's the specific non-standard one
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

    return new Promise((resolve) => {
        // Event listeners for debugging
        launcher.on('debug', (e) => console.log(`[MCLC Debug] ${e}`));
        launcher.on('data', (e) => console.log(`[MCLC Data] ${e}`));

        launcher.on('progress', (e) => {
            console.log(`[MCLC Progress] ${e.type} - ${Math.round(e.task / e.total * 100)}%`);
        });

        launcher.on('close', (code) => {
            console.log(`[Launcher] Game closed with code ${code}`);
        });

        // Launch the game
        launcher.launch(launchOptions).then(() => {
            // Success assumes the process started. MCLC launch returns promise when process spawns?
            // Actually MCLC launch returns a Promise<void> that resolves when the game process starts
            console.log('[Launcher] Game process started successfully');
            resolve({
                success: true,
                message: undefined // UI will not show message
            });
        }).catch((err) => {
            console.error('[Launcher] Error during launch:', err);
            resolve({
                success: false,
                error: err.message || 'Erreur lors du lancement du jeu'
            });
        });
    });
}
