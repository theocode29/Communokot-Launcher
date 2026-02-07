/**
 * Unit tests for config-manager.ts
 * Tests deep merge, atomic writes, properties/TOML parsing, and hash calculation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    deepMerge,
    calculateHash,
    parseProperties,
    stringifyProperties,
    parseToml,
    stringifyToml,
    validateJSON
} from './config-manager';

// ============================================
// Deep Merge Tests
// ============================================

describe('deepMerge', () => {
    it('should merge simple objects', () => {
        const target = { a: 1, b: 2 };
        const source = { b: 3, c: 4 };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
        const target = {
            quality: { graphics: 'fast', weather: 'off' },
            rendering: { distance: 8 }
        };
        const source = {
            quality: { graphics: 'fancy' },
            advanced: { vsync: true }
        };

        const result = deepMerge(target, source);

        expect(result).toEqual({
            quality: { graphics: 'fancy', weather: 'off' },
            rendering: { distance: 8 },
            advanced: { vsync: true }
        });
    });

    it('should preserve user modifications when flag is true', () => {
        const target = { a: 1, b: 2, c: 3 };
        const source = { a: 10, b: 20, d: 40 };

        const result = deepMerge(target, source, true);

        // Existing keys should be preserved
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);
        expect(result.c).toBe(3);
        // New key should be added
        expect(result.d).toBe(40);
    });

    it('should not modify original objects', () => {
        const target = { a: 1 };
        const source = { b: 2 };

        const result = deepMerge(target, source);

        expect(target).toEqual({ a: 1 });
        expect(source).toEqual({ b: 2 });
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle arrays correctly (replace, not merge)', () => {
        const target = { items: [1, 2, 3] };
        const source = { items: [4, 5] };

        const result = deepMerge(target, source);

        expect(result.items).toEqual([4, 5]);
    });

    it('should handle empty objects', () => {
        const target = {};
        const source = { a: 1 };

        const result = deepMerge(target, source);

        expect(result).toEqual({ a: 1 });
    });

    it('should handle deeply nested merges', () => {
        const target = {
            level1: {
                level2: {
                    level3: {
                        value: 'original'
                    }
                }
            }
        };
        const source = {
            level1: {
                level2: {
                    level3: {
                        newValue: 'added'
                    }
                }
            }
        };

        const result = deepMerge(target, source);

        expect(result.level1.level2.level3.value).toBe('original');
        expect(result.level1.level2.level3.newValue).toBe('added');
    });
});

// ============================================
// Hash Calculation Tests
// ============================================

describe('calculateHash', () => {
    it('should calculate consistent hashes', () => {
        const content = '{"test": true}';

        const hash1 = calculateHash(content);
        const hash2 = calculateHash(content);

        expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', () => {
        const hash1 = calculateHash('content1');
        const hash2 = calculateHash('content2');

        expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-character hex strings (SHA-256)', () => {
        const hash = calculateHash('any content');

        expect(hash).toHaveLength(64);
        expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it('should handle empty strings', () => {
        const hash = calculateHash('');

        expect(hash).toHaveLength(64);
    });
});

// ============================================
// Properties Parsing Tests
// ============================================

describe('parseProperties', () => {
    it('should parse simple properties', () => {
        const content = `
mixin.ai.pathing=true
mixin.entity.collisions=false
`;

        const result = parseProperties(content);

        expect(result['mixin.ai.pathing']).toBe(true);
        expect(result['mixin.entity.collisions']).toBe(false);
    });

    it('should ignore comments', () => {
        const content = `
# This is a comment
property=true
# Another comment
`;

        const result = parseProperties(content);

        expect(Object.keys(result)).toHaveLength(1);
        expect(result.property).toBe(true);
    });

    it('should handle empty lines', () => {
        const content = `
key1=true

key2=false

`;

        const result = parseProperties(content);

        expect(Object.keys(result)).toHaveLength(2);
    });

    it('should trim whitespace', () => {
        const content = '  key  =  true  ';

        const result = parseProperties(content);

        expect(result.key).toBe(true);
    });
});

describe('stringifyProperties', () => {
    it('should stringify to valid properties format', () => {
        const obj = {
            'key1': true,
            'key2': false
        };

        const result = stringifyProperties(obj);

        expect(result).toContain('key1=true');
        expect(result).toContain('key2=false');
    });

    it('should include header comment', () => {
        const result = stringifyProperties({ key: true });

        expect(result.startsWith('#')).toBe(true);
    });
});

// ============================================
// TOML Parsing Tests
// ============================================

describe('parseToml', () => {
    it('should parse boolean values', () => {
        const content = `
[mixin]
enabled = true
disabled = false
`;

        const result = parseToml(content);

        expect(result.enabled).toBe(true);
        expect(result.disabled).toBe(false);
    });

    it('should parse numeric values', () => {
        const content = `
count = 42
ratio = 3.14
`;

        const result = parseToml(content);

        expect(result.count).toBe(42);
        expect(result.ratio).toBe(3.14);
    });

    it('should parse string values', () => {
        const content = `
name = "test value"
simple = value
`;

        const result = parseToml(content);

        expect(result.name).toBe('test value');
        expect(result.simple).toBe('value');
    });

    it('should ignore section headers', () => {
        const content = `
[section]
key = true
`;

        const result = parseToml(content);

        expect(result['[section]']).toBeUndefined();
        expect(result.key).toBe(true);
    });

    it('should ignore comments', () => {
        const content = `
# Comment line
key = true
`;

        const result = parseToml(content);

        expect(Object.keys(result)).toHaveLength(1);
    });
});

describe('stringifyToml', () => {
    it('should stringify with section header', () => {
        const obj = { key: true };

        const result = stringifyToml(obj, 'mixin');

        expect(result).toContain('[mixin]');
        expect(result).toContain('key = true');
    });

    it('should handle mixed types', () => {
        const obj = {
            boolVal: true,
            numVal: 42,
            strVal: 'test'
        };

        const result = stringifyToml(obj);

        expect(result).toContain('boolVal = true');
        expect(result).toContain('numVal = 42');
        expect(result).toContain('strVal = test');
    });
});

// ============================================
// JSON Validation Tests
// ============================================

describe('validateJSON', () => {
    it('should validate correct JSON', () => {
        const valid = '{"key": "value", "number": 42}';

        const result = validateJSON(valid);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject invalid JSON', () => {
        const invalid = '{"key": value}';

        const result = validateJSON(invalid);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });

    it('should reject truncated JSON', () => {
        const truncated = '{"key":';

        const result = validateJSON(truncated);

        expect(result.valid).toBe(false);
    });

    it('should validate empty object', () => {
        const empty = '{}';

        const result = validateJSON(empty);

        expect(result.valid).toBe(true);
    });

    it('should validate arrays', () => {
        const array = '[1, 2, 3]';

        const result = validateJSON(array);

        expect(result.valid).toBe(true);
    });
});
