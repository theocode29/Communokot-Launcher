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

        console.log('[ResourcePack] Initialized paths:');
        console.log('  - Data path:', this.launcherDataPath);
        console.log('  - Pack path:', this.packFilePath);
        console.log('  - Version file:', this.versionFilePath);

        this.ensureDirectories();
    }

    private ensureDirectories() {
        if (!existsSync(this.resourcePackPath)) {
            console.log('[ResourcePack] Creating directories:', this.resourcePackPath);
            mkdirSync(this.resourcePackPath, { recursive: true });
        }
    }

    private getLocalVersion(): PackVersion | null {
        try {
            if (existsSync(this.versionFilePath)) {
                const version = JSON.parse(readFileSync(this.versionFilePath, 'utf-8'));
                console.log(`[ResourcePack] Local version found: ${version.version} (Hash: ${version.sha256.substring(0, 8)}...)`);
                return version;
            }
            console.log('[ResourcePack] No local version.json found.');
        } catch (error) {
            console.error('[ResourcePack] Error reading local version:', error);
        }
        return null;
    }

    private async getRemoteVersion(): Promise<PackVersion | null> {
        try {
            const url = `${REPO_BASE_URL}/version.json`;
            console.log('[ResourcePack] Fetching remote version from:', url);
            const response = await axios.get(url, {
                timeout: 5000,
                headers: { 'Cache-Control': 'no-cache' } // Prevent caching
            });
            const version = response.data;
            console.log(`[ResourcePack] Remote version: ${version.version} (Hash: ${version.sha256.substring(0, 8)}...)`);
            return version;
        } catch (error: any) {
            console.error('[ResourcePack] Failed to fetch remote version:', error.message);
            return null;
        }
    }

    private async downloadPack(expectedHash: string, expectedSize: number): Promise<boolean> {
        const tempPath = join(this.resourcePackPath, 'temp_pack.zip');

        try {
            console.log(`[ResourcePack] Downloading pack (Size: ${(expectedSize / 1024 / 1024).toFixed(2)} MB)...`);
            const response = await axios.get(`${REPO_BASE_URL}/pack.zip`, {
                responseType: 'stream',
                timeout: 30000 // 30s timeout for download
            });

            await pipeline(response.data, createWriteStream(tempPath));
            console.log('[ResourcePack] Download complete. Verifying integrity...');

            // Verify content
            const isValid = await this.verifyFile(tempPath, expectedHash, expectedSize);

            if (isValid) {
                console.log('[ResourcePack] Verification passed.');
                // Atomic replacement
                if (existsSync(this.packFilePath)) {
                    console.log('[ResourcePack] Removing old pack file.');
                    unlinkSync(this.packFilePath);
                }
                console.log('[ResourcePack] Installing new pack to data folder.');
                renameSync(tempPath, this.packFilePath);
                return true;
            } else {
                console.error('[ResourcePack] Verification failed. Deleting corrupted temporary file.');
                if (existsSync(tempPath)) unlinkSync(tempPath);
                return false;
            }
        } catch (error: any) {
            console.error('[ResourcePack] Download failed:', error.message);
            if (existsSync(tempPath)) unlinkSync(tempPath); // cleanup
            return false;
        }
    }

    private async verifyFile(path: string, expectedHash: string, expectedSize: number): Promise<boolean> {
        try {
            const data = readFileSync(path);
            const actualSize = data.length;

            console.log(`[ResourcePack] Verifying file: ${path}`);
            console.log(`  - Expected Size: ${expectedSize}, Actual: ${actualSize}`);

            // Size check
            if (actualSize !== expectedSize) {
                console.warn(`[ResourcePack] Size mismatch detected.`);
            }

            // Hash check
            const actualHash = createHash('sha256').update(data).digest('hex');
            console.log(`  - Expected Hash: ${expectedHash}`);
            console.log(`  - Actual Hash:   ${actualHash}`);

            if (actualHash !== expectedHash) {
                console.error(`[ResourcePack] Hash mismatch!`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[ResourcePack] Verification error:', error);
            return false;
        }
    }

    public async checkAndInstall(minecraftPath: string): Promise<boolean> {
        try {
            console.log('[ResourcePack] Starting checkAndInstall sequence.');
            this.ensureDirectories();

            const localVersion = this.getLocalVersion();
            const remoteVersion = await this.getRemoteVersion();

            let updateNeeded = false;

            if (!localVersion) {
                console.log('[ResourcePack] Update required: no local version found.');
                updateNeeded = true;
            } else if (remoteVersion && remoteVersion.version !== localVersion.version) {
                console.log(`[ResourcePack] Update required: version mismatch. ${localVersion.version} -> ${remoteVersion.version}`);
                updateNeeded = true;
            } else {
                console.log('[ResourcePack] Version is up to date.');
            }

            // Force update if pack file is missing but version exists
            if (!updateNeeded && !existsSync(this.packFilePath)) {
                console.log('[ResourcePack] Update required: pack.zip is missing from data folder.');
                updateNeeded = true;
            }

            if (updateNeeded) {
                if (remoteVersion) {
                    const success = await this.downloadPack(remoteVersion.sha256, remoteVersion.size);
                    if (success) {
                        console.log('[ResourcePack] Updating version.json with remote metadata.');
                        writeFileSync(this.versionFilePath, JSON.stringify(remoteVersion, null, 2));
                    } else {
                        console.error('[ResourcePack] Update process failed.');
                    }
                } else {
                    console.error('[ResourcePack] Update needed but remote metadata is unavailable.');
                }
            }

            // Install to game
            const installed = this.installToGame(minecraftPath);
            console.log(`[ResourcePack] Final installation status: ${installed ? 'SUCCESS' : 'FAILURE'}`);
            return installed;

        } catch (error) {
            console.error('[ResourcePack] General error during checkAndInstall:', error);
            return this.installToGame(minecraftPath);
        }
    }

    private installToGame(minecraftPath: string): boolean {
        try {
            if (!existsSync(this.packFilePath)) {
                console.warn('[ResourcePack] Cannot install to game: pack.zip not found in data folder.');
                return false;
            }

            const targetDir = join(minecraftPath, 'resourcepacks');
            const targetFile = join(targetDir, 'Communokot_Pack.zip');

            if (!existsSync(targetDir)) {
                console.log('[ResourcePack] Creating game resourcepacks directory:', targetDir);
                mkdirSync(targetDir, { recursive: true });
            }

            console.log('[ResourcePack] Copying pack to game folder:', targetFile);
            copyFileSync(this.packFilePath, targetFile);
            console.log('[ResourcePack] Copy successful.');

            return true;

        } catch (error) {
            console.error('[ResourcePack] Failed to install to game:', error);
            return false;
        }
    }
}
