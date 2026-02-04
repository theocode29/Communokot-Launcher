import axios from 'axios';

const API_URL = 'https://api.freemcserver.net/v4/server/1949282/ping';
const TIMEOUT = 10000; // 10 seconds timeout

export interface ServerStatus {
    online: boolean;
    players?: {
        online: number;
        max: number;
    };
    latency?: number;
    version?: string;
    motd?: string;
}

interface FreeMCServerResponse {
    success: boolean;
    data?: {
        online: boolean;
        players?: {
            online: number;
            max: number;
            list?: string[];
        };
        version?: {
            name: string;
            protocol: number;
        };
        motd?: {
            raw: string;
        };
    };
}

/**
 * Check server status using the freemcserver.net API
 */
export async function checkServerStatus(): Promise<ServerStatus> {
    const startTime = Date.now();

    try {
        const response = await axios.get<FreeMCServerResponse>(API_URL, {
            timeout: TIMEOUT,
        });

        const latency = Date.now() - startTime;

        if (response.data.success && response.data.data) {
            const { data } = response.data;

            console.log('[ServerStatus] API response:', JSON.stringify(data, null, 2));

            return {
                online: data.online,
                latency,
                players: data.players ? {
                    online: data.players.online,
                    max: data.players.max,
                } : undefined,
                version: data.version?.name,
                motd: data.motd?.raw,
            };
        } else {
            console.log('[ServerStatus] API returned success=false');
            return { online: false };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('[ServerStatus] API Axios error:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status
            });
        } else {
            console.error('[ServerStatus] API unknown error:', error);
        }
        return { online: false };
    }
}
