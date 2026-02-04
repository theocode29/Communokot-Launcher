import { ipcMain, IpcMainInvokeEvent } from 'electron';

type IpcHandler = (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown> | unknown;

/**
 * Registry of active IPC handlers for cleanup purposes.
 * Helps prevent memory leaks from orphaned listeners.
 */
const activeHandlers = new Map<string, IpcHandler>();

/**
 * Creates a safe IPC handler that can be easily cleaned up.
 * Returns a cleanup function to remove the handler.
 * 
 * @param channel - The IPC channel name
 * @param handler - The handler function
 * @returns Cleanup function to remove the handler
 */
export function createSafeIpcHandler(
    channel: string,
    handler: IpcHandler
): () => void {
    // Remove existing handler if present (prevents duplicates)
    if (activeHandlers.has(channel)) {
        ipcMain.removeHandler(channel);
    }

    ipcMain.handle(channel, handler);
    activeHandlers.set(channel, handler);

    return () => {
        ipcMain.removeHandler(channel);
        activeHandlers.delete(channel);
    };
}

/**
 * Cleans up all registered IPC handlers.
 * Useful for app shutdown or window destruction.
 */
export function cleanupAllIpcHandlers(): void {
    for (const channel of activeHandlers.keys()) {
        ipcMain.removeHandler(channel);
    }
    activeHandlers.clear();
}

/**
 * Gets the count of active IPC handlers.
 * Useful for debugging memory leaks.
 */
export function getActiveHandlerCount(): number {
    return activeHandlers.size;
}
