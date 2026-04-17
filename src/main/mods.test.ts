import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import axios from 'axios';
import { updateMods } from './mods';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    },
}));

const MIDNIGHT_PROJECT_ID = 'bXX9h73M';
const MIDNIGHT_LIB_PROJECT_ID = 'codAaoxh';

type MockScenario = 'normal' | 'missing-midnightcontrols';

let rootPath: string;
let scenario: MockScenario = 'normal';

function setupAxiosMock(): void {
    const mockedGet = vi.mocked(axios.get);
    mockedGet.mockImplementation(async (url: string, config?: { responseType?: string }) => {
        if (config?.responseType === 'stream') {
            return { data: Readable.from(['fake-jar-content']) };
        }

        const projectMatch = url.match(/\/v2\/project\/([^/]+)\/version\?/);
        if (!projectMatch) {
            throw new Error(`Unexpected Modrinth request URL: ${url}`);
        }

        const projectId = projectMatch[1];

        if (scenario === 'missing-midnightcontrols' && projectId === MIDNIGHT_PROJECT_ID) {
            return { data: [] };
        }

        const dependencies = projectId === MIDNIGHT_PROJECT_ID
            ? [{ project_id: MIDNIGHT_LIB_PROJECT_ID, dependency_type: 'required' }]
            : [];

        return {
            data: [{
                files: [{
                    primary: true,
                    filename: `mod-${projectId}.jar`,
                    url: `https://cdn.modrinth.com/data/${projectId}/mod-${projectId}.jar`,
                }],
                dependencies,
            }],
        };
    });
}

describe('updateMods controller mode orchestration', () => {
    beforeEach(() => {
        rootPath = mkdtempSync(join(tmpdir(), 'communokot-mods-test-'));
        mkdirSync(join(rootPath, 'mods'), { recursive: true });
        scenario = 'normal';
        vi.clearAllMocks();
        setupAxiosMock();
    });

    afterEach(() => {
        rmSync(rootPath, { recursive: true, force: true });
    });

    it('installs MidnightControls and required dependencies when controller mode is enabled', async () => {
        await updateMods(rootPath, undefined, { controllerModeEnabled: true });

        const modsPath = join(rootPath, 'mods');
        expect(existsSync(join(modsPath, `mod-${MIDNIGHT_PROJECT_ID}.jar`))).toBe(true);
        expect(existsSync(join(modsPath, `mod-${MIDNIGHT_LIB_PROJECT_ID}.jar`))).toBe(true);
    });

    it('removes MidnightControls and its dependencies when controller mode is disabled', async () => {
        const modsPath = join(rootPath, 'mods');
        writeFileSync(join(modsPath, `mod-${MIDNIGHT_PROJECT_ID}.jar`), 'stale-midnightcontrols');
        writeFileSync(join(modsPath, `mod-${MIDNIGHT_LIB_PROJECT_ID}.jar`), 'stale-midnightlib');

        await updateMods(rootPath, undefined, { controllerModeEnabled: false });

        expect(existsSync(join(modsPath, `mod-${MIDNIGHT_PROJECT_ID}.jar`))).toBe(false);
        expect(existsSync(join(modsPath, `mod-${MIDNIGHT_LIB_PROJECT_ID}.jar`))).toBe(false);

        const versionCalls = vi.mocked(axios.get).mock.calls
            .map(([url]) => String(url))
            .filter((url) => url.includes('/version?'));

        expect(versionCalls.some((url) => url.includes(`/project/${MIDNIGHT_PROJECT_ID}/version`))).toBe(false);
    });

    it('throws an explicit error when controller mode is enabled and MidnightControls cannot be resolved', async () => {
        scenario = 'missing-midnightcontrols';

        await expect(updateMods(rootPath, undefined, { controllerModeEnabled: true }))
            .rejects
            .toThrow(/MidnightControls/);
    });
});
