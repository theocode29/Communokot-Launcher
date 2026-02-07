/**
 * Type definitions for mod configuration files
 */

// Sodium configuration (sodium-options.json)
export interface SodiumConfig {
    quality: {
        graphics_quality: 'fast' | 'fancy' | 'default';
        clouds_quality: 'off' | 'fast' | 'fancy' | 'default';
        weather_quality: 'fast' | 'fancy' | 'default';
        leaves_quality: 'fast' | 'fancy' | 'default';
        enable_vignette: boolean;
        enable_fog: boolean;
    };
    advanced: {
        arena_memory_allocator: 'async' | 'swap';
        allow_direct_memory_access: boolean;
        enable_memory_tracing: boolean;
        use_advanced_staging_buffers: boolean;
        cpu_render_ahead_limit: number;
    };
    performance: {
        chunk_builder_threads: number;
        always_defer_chunk_updates: boolean;
        use_block_face_culling: boolean;
        use_compact_vertex_format: boolean;
        use_fog_occlusion: boolean;
        use_entity_culling: boolean;
        animate_only_visible_textures: boolean;
    };
    rendering: {
        render_distance: number;
        simulation_distance: number;
        entity_distance: number;
        brightness: number;
        gui_scale: number;
        fullscreen: boolean;
        v_sync: boolean;
        fps_limit: number;
    };
    notifications: {
        hide_donation_button: boolean;
    };
}

// Lithium configuration (lithium.properties)
export interface LithiumConfig {
    'mixin.ai.pathing': boolean;
    'mixin.ai.poi': boolean;
    'mixin.ai.task': boolean;
    'mixin.block.hopper': boolean;
    'mixin.chunk.serialization': boolean;
    'mixin.entity.collisions': boolean;
    'mixin.gen.cached_generator_settings': boolean;
    'mixin.world.block_entity_ticking': boolean;
    'mixin.world.chunk_ticking': boolean;
    'mixin.world.tick_scheduler': boolean;
}

// FerriteCore configuration (ferritecore-common.toml)
export interface FerriteCoreConfig {
    'mixin.blockstatecache': boolean;
    'mixin.flatten_states': boolean;
    'mixin.thread_local_random': boolean;
    'mixin.cache_multipart_models': boolean;
    'mixin.reduce_blockstate_cache_rebuilds': boolean;
}

// EntityCulling configuration (entityculling.json)
export interface EntityCullingConfig {
    tracingDistance: number;
    debugMode: boolean;
    skipMarkerArmorStands: boolean;
    tickCulling: boolean;
    sleepDelay: number;
    hitboxes: boolean;
    tracePlayers: boolean;
}

// ImmediatelyFast configuration (immediatelyfast.json)
export interface ImmediatelyFastConfig {
    experimental_screen_batching: boolean;
    map_atlas_generation: boolean;
    hud_batching: boolean;
    fast_buffer_upload: boolean;
    font_atlas_resizing: boolean;
}

// Union type for all configs
export type ModConfig = SodiumConfig | LithiumConfig | FerriteCoreConfig | EntityCullingConfig | ImmediatelyFastConfig;

// Preset type
export type PerformancePreset = 'low-end' | 'balanced' | 'high-end' | 'auto';

// Hardware detection result
export interface HardwareInfo {
    totalRamGB: number;
    cpuCores: number;
    gpuType: 'integrated' | 'dedicated' | 'unknown';
    gpuName: string;
    screenResolution: {
        width: number;
        height: number;
    };
    recommendedPreset: PerformancePreset;
    score: number; // 0-100
}

// Configuration metadata
export interface ConfigMetadata {
    version: string;
    lastAppliedPreset: PerformancePreset | null;
    lastModified: string; // ISO date
    hashes: {
        [filename: string]: string; // SHA-256 hash
    };
    userManaged: boolean;
}
