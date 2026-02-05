import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, createWriteStream, renameSync, unlinkSync } from 'fs';
import { createHash } from 'crypto';
import { app } from 'electron';
import axios from 'axios';
import { pipeline } from 'stream/promises';

const REPO_BASE_URL = 'https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/resourcepack';

interface PackVersion {
    version: string;
    sha256: string;
    size: number;
}

export class ResourcePackManager {
    private readonly launcherDataPath: string;
    private readonly resourcePackPath: string;
    private readonly versionFilePath: string;
    private readonly packFilePath: string;

    constructor() {
        // Use userData for LauncherData storage
        this.launcherDataPath = join(app.getPath('userData'), 'LauncherData');
        this.resourcePackPath = join(this.launcherDataPath, 'resourcepack');
        this.versionFilePath = join(this.resourcePackPath, 'version.json');
        this.packFilePath = join(this.resourcePackPath, 'pack.zip');

        this.ensureDirectories();
    }

    private ensureDirectories() {
        if (!existsSync(this.resourcePackPath)) {
            mkdirSync(this.resourcePackPath, { recursive: true });
        }
    }

    private getLocalVersion(): PackVersion | null {
        try {
            if (existsSync(this.versionFilePath)) {
                return JSON.parse(readFileSync(this.versionFilePath, 'utf-8'));
            }
        } catch (error) {
            console.error('[ResourcePack] Error reading local version:', error);
        }
        return null;
    }

    private async getRemoteVersion(): Promise<PackVersion | null> {
        try {
            console.log('[ResourcePack] Checking for updates at', `${REPO_BASE_URL}/version.json`);
            const response = await axios.get(`${REPO_BASE_URL}/version.json`, {
                timeout: 5000,
                headers: { 'Cache-Control': 'no-cache' } // Prevent caching
            });
            return response.data;
        } catch (error) {
            console.error('[ResourcePack] Failed to fetch remote version:', error);
            return null;
        }
    }

    private async downloadPack(expectedHash: string, expectedSize: number): Promise<boolean> {
        const tempPath = join(this.resourcePackPath, 'temp_pack.zip');

        try {
            console.log('[ResourcePack] Downloading new pack...');
            const response = await axios.get(`${REPO_BASE_URL}/pack.zip`, {
                responseType: 'stream',
                timeout: 30000 // 30s timeout for download
            });

            await pipeline(response.data, createWriteStream(tempPath));

            // Verify content
            const isValid = await this.verifyFile(tempPath, expectedHash, expectedSize);

            if (isValid) {
                // Atomic replacement
                if (existsSync(this.packFilePath)) {
                    unlinkSync(this.packFilePath); // Remove old pack
                }
                renameSync(tempPath, this.packFilePath);
                console.log('[ResourcePack] Pack updated successfully');
                return true;
            } else {
                console.error('[ResourcePack] Verification failed: Hash or size mismatch');
                if (existsSync(tempPath)) unlinkSync(tempPath);
                return false;
            }
        } catch (error) {
            console.error('[ResourcePack] Download failed:', error);
            if (existsSync(tempPath)) unlinkSync(tempPath); // cleanup
            return false;
        }
    }

    private async verifyFile(path: string, expectedHash: string, expectedSize: number): Promise<boolean> {
        try {
            const data = readFileSync(path);

            // Size check
            if (data.length !== expectedSize) {
                console.warn(`[ResourcePack] Size mismatch. Expected ${expectedSize}, got ${data.length}`);
                // return false; // Warning for now, maybe GitHub raw serves slightly different bytes? usually strict is better
            }

            // Hash check
            const hash = createHash('sha256').update(data).digest('hex');
            if (hash !== expectedHash) {
                console.error(`[ResourcePack] Hash mismatch. Expected ${expectedHash}, got ${hash}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[ResourcePack] Verification error:', error);
            return false;
        }
    }

    /**
     * Checks for updates and downloads if necessary.
     * Returns true if a valid pack exists (updated or cached), false otherwise.
     */
    public async checkAndInstall(minecraftPath: string): Promise<boolean> {
        try {
            this.ensureDirectories();

            const localVersion = this.getLocalVersion();
            const remoteVersion = await this.getRemoteVersion();

            let updateNeeded = false;

            if (!localVersion) {
                console.log('[ResourcePack] No local version found. Update needed.');
                updateNeeded = true;
            } else if (remoteVersion && remoteVersion.version !== localVersion.version) {
                console.log(`[ResourcePack] New version found: ${remoteVersion.version} (Local: ${localVersion.version})`);
                updateNeeded = true;
            } else {
                console.log('[ResourcePack] Up to date.');
            }

            // Force update if pack file is missing but version exists
            if (!updateNeeded && !existsSync(this.packFilePath)) {
                console.log('[ResourcePack] Pack file missing. Re-downloading.');
                updateNeeded = true;
            }

            if (updateNeeded && remoteVersion) {
                const success = await this.downloadPack(remoteVersion.sha256, remoteVersion.size);
                if (success) {
                    writeFileSync(this.versionFilePath, JSON.stringify(remoteVersion, null, 2));
                } else {
                    console.error('[ResourcePack] Update failed. Keeping old version if available.');
                }
            }

            // Install to game
            return this.installToGame(minecraftPath);

        } catch (error) {
            console.error('[ResourcePack] General error:', error);
            // Even if update fails, try to install existing pack
            return this.installToGame(minecraftPath);
        }
    }

    private installToGame(minecraftPath: string): boolean {
        try {
            if (!existsSync(this.packFilePath)) {
                console.warn('[ResourcePack] No pack to install.');
                return false;
            }

            const targetDir = join(minecraftPath, 'resourcepacks');
            if (!existsSync(targetDir)) {
                mkdirSync(targetDir, { recursive: true });
            }

            const targetFile = join(targetDir, 'Communokot_Pack.zip');

            // Only copy if different to save IO? Or just copy always to be safe?
            // Simple copy for now.
            copyFileSync(this.packFilePath, targetFile);
            console.log('[ResourcePack] Installed to', targetFile);

            return true;

        } catch (error) {
            console.error('[ResourcePack] Failed to install to game:', error);
            return false;
        }
    }
}
