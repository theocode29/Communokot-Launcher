import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveJavaExecutable } from './java-utils';
import { platform } from 'os';

// Mock the os module
vi.mock('os', async () => {
    return {
        platform: vi.fn(),
        homedir: vi.fn().mockReturnValue('/home/user')
    };
});

describe('resolveJavaExecutable', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return javaw on Windows when javaPath is auto', () => {
        vi.mocked(platform).mockReturnValue('win32');
        expect(resolveJavaExecutable('auto')).toBe('javaw');
    });

    it('should return javaw on Windows when javaPath is undefined', () => {
        vi.mocked(platform).mockReturnValue('win32');
        expect(resolveJavaExecutable()).toBe('javaw');
    });

    it('should return java on macOS when javaPath is auto', () => {
        vi.mocked(platform).mockReturnValue('darwin');
        expect(resolveJavaExecutable('auto')).toBe('java');
    });

    it('should return java on Linux when javaPath is auto', () => {
        vi.mocked(platform).mockReturnValue('linux');
        expect(resolveJavaExecutable('auto')).toBe('java');
    });

    it('should handle custom JDK path on Windows', () => {
        vi.mocked(platform).mockReturnValue('win32');
        const result = resolveJavaExecutable('C:\\Program Files\\Java\\jdk-17');
        expect(result).toContain('javaw.exe');
        expect(result).toContain('bin');
    });

    it('should handle custom JDK path on macOS', () => {
        vi.mocked(platform).mockReturnValue('darwin');
        const result = resolveJavaExecutable('/Library/Java/JavaVirtualMachines/jdk-17.jdk');
        expect(result).toContain('java');
        expect(result).toContain('bin');
        expect(result).not.toContain('javaw');
    });

    it('should handle custom path with bin directory on Windows', () => {
        vi.mocked(platform).mockReturnValue('win32');
        const result = resolveJavaExecutable('C:\\Java\\jdk\\bin\\java.exe');
        expect(result).toContain('javaw.exe');
        expect(result).toContain('bin');
    });

    it('should handle custom path with bin directory on macOS', () => {
        vi.mocked(platform).mockReturnValue('darwin');
        const result = resolveJavaExecutable('/usr/lib/jvm/java-17/bin/java');
        expect(result).toContain('java');
        expect(result).toContain('bin');
        expect(result).not.toContain('javaw');
    });

    it('should return full path as-is if not recognized pattern', () => {
        vi.mocked(platform).mockReturnValue('win32');
        const customPath = 'C:\\custom\\path\\to\\javaw.exe';
        expect(resolveJavaExecutable(customPath)).toBe(customPath);
    });

    it('should handle JRE path on Windows', () => {
        vi.mocked(platform).mockReturnValue('win32');
        const result = resolveJavaExecutable('C:\\Program Files\\Java\\jre-17');
        expect(result).toContain('javaw.exe');
    });
});
