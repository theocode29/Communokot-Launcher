import { spawn, exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';

export interface LaunchOptions {
    username: string;
    ram: number;
    javaPath?: string;
    minecraftPath?: string;
}

export interface LaunchResult {
    success: boolean;
    error?: string;
}

const MC_SERVER = 'mc1949282.fmcs.cloud';
const MC_PORT = 25565;
const MC_VERSION = '1.21.11';

/**
 * Find Java executable path automatically
 */
async function findJavaPath(): Promise<string | null> {
    const os = platform();

    // Common Java locations
    const javaPaths: string[] = [];

    if (os === 'darwin') {
        javaPaths.push(
            '/usr/bin/java',
            '/Library/Java/JavaVirtualMachines/*/Contents/Home/bin/java',
            join(homedir(), '.sdkman/candidates/java/current/bin/java'),
        );
    } else if (os === 'win32') {
        javaPaths.push(
            'C:\\Program Files\\Java\\*\\bin\\java.exe',
            'C:\\Program Files (x86)\\Java\\*\\bin\\java.exe',
            join(process.env.JAVA_HOME || '', 'bin', 'java.exe'),
        );
    } else {
        javaPaths.push(
            '/usr/bin/java',
            '/usr/lib/jvm/*/bin/java',
        );
    }

    // Try to find java in PATH first
    return new Promise((resolve) => {
        const cmd = os === 'win32' ? 'where java' : 'which java';
        exec(cmd, (error, stdout) => {
            if (!error && stdout.trim()) {
                resolve(stdout.trim().split('\n')[0]);
            } else {
                // Check common paths
                for (const p of javaPaths) {
                    if (!p.includes('*') && existsSync(p)) {
                        resolve(p);
                        return;
                    }
                }
                resolve(null);
            }
        });
    });
}

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
 * Launch Minecraft with the specified options
 */
export async function launchMinecraft(options: LaunchOptions): Promise<LaunchResult> {
    const { username, ram, javaPath, minecraftPath } = options;

    // Validate username
    if (!username || username.trim().length === 0) {
        return { success: false, error: 'Username cannot be empty' };
    }

    // Find Java
    let java = javaPath;
    if (!java || java === 'auto') {
        java = await findJavaPath();
        if (!java) {
            return { success: false, error: 'Java not found. Please install Java or specify the path manually.' };
        }
    }

    // Check if Java exists
    if (!existsSync(java)) {
        return { success: false, error: `Java executable not found at: ${java}` };
    }

    // Get Minecraft path
    const mcPath = minecraftPath || getDefaultMinecraftPath();

    // Check if Minecraft is installed
    if (!existsSync(mcPath)) {
        return { success: false, error: `Minecraft installation not found at: ${mcPath}` };
    }

    // Build the launcher command
    // For offline/cracked mode, we use the official launcher with quickPlayMultiplayer
    const os = platform();
    let launcherPath: string;

    if (os === 'darwin') {
        launcherPath = '/Applications/Minecraft.app/Contents/MacOS/launcher';
        // Alternative: Use the minecraft-launcher command directly
        if (!existsSync(launcherPath)) {
            launcherPath = join(mcPath, 'launcher', 'minecraft-launcher');
        }
    } else if (os === 'win32') {
        launcherPath = join(process.env.LOCALAPPDATA || '', 'Packages', 'Microsoft.4297127D64EC6_8wekyb3d8bbwe', 'LocalCache', 'Local', 'runtime', 'java-runtime-gamma', 'windows-x64', 'java-runtime-gamma', 'bin', 'java.exe');
        // Standard launcher path
        if (!existsSync(launcherPath)) {
            launcherPath = join(process.env.APPDATA || '', '.minecraft', 'launcher', 'MinecraftLauncher.exe');
        }
    } else {
        launcherPath = 'minecraft-launcher';
    }

    // Build arguments for direct game launch
    const args: string[] = [
        `--quickPlayMultiplayer=${MC_SERVER}:${MC_PORT}`,
        '--fullscreen',
        `--version=${MC_VERSION}`,
    ];

    console.log(`Launching Minecraft with: ${launcherPath} ${args.join(' ')}`);

    try {
        // Try launching with the Minecraft launcher
        const child = spawn(launcherPath, args, {
            detached: true,
            stdio: 'ignore',
            cwd: mcPath,
            env: {
                ...process.env,
                _JAVA_OPTIONS: `-Xmx${ram}G`,
            },
        });

        child.unref();

        return { success: true };
    } catch (error) {
        // If launcher fails, try opening Minecraft via system
        try {
            const openCmd = os === 'darwin' ? 'open' : os === 'win32' ? 'start' : 'xdg-open';
            const mcApp = os === 'darwin' ? 'minecraft://' : os === 'win32' ? 'minecraft://' : 'minecraft://';

            exec(`${openCmd} "${mcApp}"`, (err) => {
                if (err) {
                    console.error('Failed to open Minecraft:', err);
                }
            });

            return {
                success: true,
                error: 'Launched via system. You may need to connect to the server manually.'
            };
        } catch (fallbackError) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to launch Minecraft'
            };
        }
    }
}
