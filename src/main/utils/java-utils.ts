import { platform } from 'os';
import { join } from 'path';

/**
 * Resolves the Java executable name based on the current platform.
 * On Windows, returns 'javaw.exe' to prevent console window appearance.
 * On macOS/Linux, returns 'java'.
 * 
 * @param javaPath - Optional custom Java installation path
 * @returns The resolved Java executable path
 */
export function resolveJavaExecutable(javaPath?: string): string {
    if (!javaPath || javaPath === 'auto') {
        // Use system default with platform-specific binary
        const isWindows = platform() === 'win32';
        return isWindows ? 'javaw' : 'java';
    }

    // Custom path provided - check if it's a directory or executable
    const isWindows = platform() === 'win32';

    // If path ends with bin directory or java executable, extract base
    if (javaPath.includes('bin')) {
        const binIndex = javaPath.indexOf('bin');
        const basePath = javaPath.substring(0, binIndex);
        const binaryName = isWindows ? 'javaw.exe' : 'java';
        return join(basePath, 'bin', binaryName);
    }

    // If it's pointing to a JDK/JRE root, append bin/javaw or bin/java
    if (javaPath.toLowerCase().includes('jdk') || javaPath.toLowerCase().includes('jre')) {
        const binaryName = isWindows ? 'javaw.exe' : 'java';
        return join(javaPath, 'bin', binaryName);
    }

    // Otherwise assume it's already the full executable path, use as-is
    return javaPath;
}
