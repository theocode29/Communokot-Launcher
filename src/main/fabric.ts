import { join } from 'path';
import { existsSync, createWriteStream } from 'fs';
import { spawn } from 'child_process';
import axios from 'axios';
import { pipeline } from 'stream/promises';

const FABRIC_INSTALLER_URL = 'https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.0/fabric-installer-1.0.0.jar';
const MINECRAFT_VERSION = '1.21.11';
const FABRIC_LOADER_VERSION = '0.18.0'; // Updated to 0.18.0 for 1.21.11 compatibility
const FABRIC_PROFILE_NAME = `fabric-loader-${FABRIC_LOADER_VERSION}-${MINECRAFT_VERSION}`;

/**
 * Downloads a file from a URL to a destination path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    await pipeline(response.data, createWriteStream(destPath));
}

// Callback type definition
export type ProgressCallback = (task: string, progress: number) => void;

/**
 * Ensures Fabric is installed for the target Minecraft version.
 * Returns the version ID to launch.
 */
export async function ensureFabricInstalled(rootPath: string, javaPath: string = 'java', onProgress?: ProgressCallback): Promise<string> {
    const versionsPath = join(rootPath, 'versions');
    const fabricVersionPath = join(versionsPath, FABRIC_PROFILE_NAME);
    const installerPath = join(rootPath, 'fabric-installer.jar');

    const javaExecutable = javaPath === 'auto' ? 'java' : javaPath;

    console.log(`[Fabric] Checking for existing installation at: ${fabricVersionPath}`);

    if (existsSync(fabricVersionPath)) {
        console.log(`[Fabric] Version ${FABRIC_PROFILE_NAME} found. Skipping install.`);
        return FABRIC_PROFILE_NAME;
    }

    console.log(`[Fabric] Version ${FABRIC_PROFILE_NAME} not found. Installing...`);
    onProgress?.("Installation de Fabric Loader...", 10);

    // Download installer
    console.log(`[Fabric] Downloading installer to ${installerPath} from ${FABRIC_INSTALLER_URL}`);
    onProgress?.("Téléchargement de l'installateur Fabric...", 20);

    try {
        await downloadFile(FABRIC_INSTALLER_URL, installerPath);
        console.log('[Fabric] Installer downloaded successfully.');
    } catch (error) {
        console.error('[Fabric] Failed to download installer:', error);
        throw new Error('Impossible de télécharger l\'installateur Fabric.');
    }

    // Run installer
    onProgress?.("Configuration de Fabric...", 40);
    console.log('[Fabric] Running installer...');
    console.log(`[Fabric] Command: "${javaExecutable}" -jar "${installerPath}" client -mcversion ${MINECRAFT_VERSION} -loader ${FABRIC_LOADER_VERSION} -dir "${rootPath}" -noprofile`);

    return new Promise((resolve, reject) => {
        const process = spawn(javaExecutable, [
            '-jar',
            installerPath,
            'client',
            '-mcversion', MINECRAFT_VERSION,
            '-loader', FABRIC_LOADER_VERSION,
            '-dir', rootPath,
            '-noprofile' // Don't create launcher profile in official launcher
        ]);

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            const line = data.toString();
            stdout += line;
            console.log(`[Fabric Installer] ${line.trim()}`);
        });

        process.stderr.on('data', (data) => {
            const line = data.toString();
            stderr += line;
            console.error(`[Fabric Installer ERR] ${line.trim()}`);
        });

        process.on('close', (code) => {
            console.log(`[Fabric] Installer process exited with code ${code}`);
            if (code === 0) {
                onProgress?.("Fabric installé avec succès", 50);
                resolve(FABRIC_PROFILE_NAME);
            } else {
                console.error(`[Fabric] Installer failed with code ${code}`);
                // Basic diagnosis hint
                let errorMsg = `L'installation de Fabric a échoué (Code ${code}).`;
                if (stderr.includes('Unable to access jarfile')) {
                    errorMsg += ' Jarfile inaccessible.';
                }
                reject(new Error(errorMsg));
            }
        });

        process.on('error', (err) => {
            console.error('[Fabric] Failed to spawn installer process:', err);
            reject(new Error(`Impossible de lancer l'installateur Fabric: ${err.message}`));
        });
    });
}
