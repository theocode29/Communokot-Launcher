import * as net from 'net';

const MC_SERVER = 'mc1949282.fmcs.cloud';
const MC_PORT = 25565;
const TIMEOUT = 5000; // 5 seconds timeout

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

/**
 * Ping a Minecraft server using the MC protocol
 * This sends a status request packet and parses the response
 */
export async function checkServerStatus(): Promise<ServerStatus> {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const socket = new net.Socket();
        console.log(`[ServerStatus] Checking ${MC_SERVER}:${MC_PORT}...`);

        let resolved = false;
        const finish = (status: ServerStatus) => {
            if (!resolved) {
                resolved = true;
                socket.destroy();
                resolve(status);
            }
        };

        socket.setTimeout(TIMEOUT);

        socket.on('timeout', () => {
            console.log('[ServerStatus] Connection timed out');
            finish({ online: false });
        });

        socket.on('error', (err) => {
            console.error('[ServerStatus] Socket error:', err);
            finish({ online: false });
        });

        socket.on('close', () => {
            if (!resolved) {
                finish({ online: false });
            }
        });

        socket.connect(MC_PORT, MC_SERVER, () => {
            console.log('[ServerStatus] Connected, sending handshake...');
            const latency = Date.now() - startTime;

            // Build handshake packet
            const hostBuffer = Buffer.from(MC_SERVER, 'utf8');
            const handshakeData = Buffer.concat([
                Buffer.from([0x00]), // Packet ID (Handshake)
                writeVarInt(-1), // Protocol version (-1 for status)
                writeVarInt(hostBuffer.length),
                hostBuffer,
                Buffer.from([MC_PORT >> 8, MC_PORT & 0xFF]), // Port (big endian)
                Buffer.from([0x01]), // Next state (1 = status)
            ]);

            const handshakePacket = Buffer.concat([
                writeVarInt(handshakeData.length),
                handshakeData,
            ]);

            // Status request packet  
            const statusRequest = Buffer.from([0x01, 0x00]);

            socket.write(Buffer.concat([handshakePacket, statusRequest]));

            let dataBuffer = Buffer.alloc(0);

            socket.on('data', (data) => {
                console.log(`[ServerStatus] Received data: ${data.length} bytes`);
                dataBuffer = Buffer.concat([dataBuffer, data]);

                try {
                    // Try to parse the response
                    const { value: packetLength, bytesRead: lengthBytes } = readVarInt(dataBuffer, 0);

                    if (dataBuffer.length >= lengthBytes + packetLength) {
                        const { bytesRead: idBytes } = readVarInt(dataBuffer, lengthBytes);
                        const { value: jsonLength, bytesRead: jsonLengthBytes } = readVarInt(dataBuffer, lengthBytes + idBytes);

                        const jsonStart = lengthBytes + idBytes + jsonLengthBytes;
                        const jsonData = dataBuffer.slice(jsonStart, jsonStart + jsonLength).toString('utf8');

                        try {
                            const status = JSON.parse(jsonData);
                            finish({
                                online: true,
                                latency,
                                players: status.players ? {
                                    online: status.players.online || 0,
                                    max: status.players.max || 0,
                                } : undefined,
                                version: status.version?.name,
                                motd: typeof status.description === 'string'
                                    ? status.description
                                    : status.description?.text,
                            });
                            console.log('[ServerStatus] Parsed invalid status:', status);
                        } catch {
                            // JSON parse failed but server responded
                            finish({ online: true, latency });
                        }
                    }
                } catch {
                    // Parsing failed, but connection worked
                    finish({ online: true, latency });
                }
            });
        });
    });
}

// VarInt helpers for MC protocol
function writeVarInt(value: number): Buffer {
    const bytes: number[] = [];
    do {
        let byte = value & 0x7F;
        value >>>= 7;
        if (value !== 0) {
            byte |= 0x80;
        }
        bytes.push(byte);
    } while (value !== 0);
    return Buffer.from(bytes);
}

function readVarInt(buffer: Buffer, offset: number): { value: number; bytesRead: number } {
    let value = 0;
    let bytesRead = 0;
    let currentByte: number;

    do {
        currentByte = buffer[offset + bytesRead];
        value |= (currentByte & 0x7F) << (7 * bytesRead);
        bytesRead++;
        if (bytesRead > 5) {
            throw new Error('VarInt too big');
        }
    } while ((currentByte & 0x80) !== 0);

    return { value, bytesRead };
}
