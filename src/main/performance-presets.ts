/**
 * Performance preset definitions for Minecraft 1.21.1 optimization mods
 */

import type { SodiumConfig, LithiumConfig, FerriteCoreConfig, EntityCullingConfig, ImmediatelyFastConfig } from './types/mod-configs';

// Sodium Presets
export const SODIUM_PRESETS: Record<'low-end' | 'balanced' | 'high-end', Partial<SodiumConfig>> = {
    'low-end': {
        quality: {
            graphics_quality: 'fast',
            clouds_quality: 'off',
            weather_quality: 'fast',
            leaves_quality: 'fast',
            enable_vignette: false,
            enable_fog: false,
        },
        performance: {
            chunk_builder_threads: 0, // Auto
            always_defer_chunk_updates: true,
            use_block_face_culling: true,
            use_compact_vertex_format: true,
            use_fog_occlusion: true,
            use_entity_culling: true,
            animate_only_visible_textures: true,
        },
        rendering: {
            render_distance: 4,
            simulation_distance: 5,
            entity_distance: 50,
            brightness: 50,
            gui_scale: 0, // Auto
            fullscreen: false,
            v_sync: false,
            fps_limit: 60,
        },
        advanced: {
            arena_memory_allocator: 'async',
            allow_direct_memory_access: true,
            enable_memory_tracing: false,
            use_advanced_staging_buffers: true,
            cpu_render_ahead_limit: 1,
        },
        notifications: {
            hide_donation_button: true,
        }
    },
    'balanced': {
        quality: {
            graphics_quality: 'default',
            clouds_quality: 'fast',
            weather_quality: 'fancy',
            leaves_quality: 'fancy',
            enable_vignette: true,
            enable_fog: true,
        },
        performance: {
            chunk_builder_threads: 0,
            always_defer_chunk_updates: false,
            use_block_face_culling: true,
            use_compact_vertex_format: true,
            use_fog_occlusion: true,
            use_entity_culling: true,
            animate_only_visible_textures: false,
        },
        rendering: {
            render_distance: 8,
            simulation_distance: 8,
            entity_distance: 100,
            brightness: 50,
            gui_scale: 0,
            fullscreen: false,
            v_sync: false,
            fps_limit: 120,
        },
        advanced: {
            arena_memory_allocator: 'async',
            allow_direct_memory_access: true,
            enable_memory_tracing: false,
            use_advanced_staging_buffers: true,
            cpu_render_ahead_limit: 2,
        },
        notifications: {
            hide_donation_button: true,
        }
    },
    'high-end': {
        quality: {
            graphics_quality: 'fancy',
            clouds_quality: 'fancy',
            weather_quality: 'fancy',
            leaves_quality: 'fancy',
            enable_vignette: true,
            enable_fog: true,
        },
        performance: {
            chunk_builder_threads: 0,
            always_defer_chunk_updates: false,
            use_block_face_culling: true,
            use_compact_vertex_format: true,
            use_fog_occlusion: true,
            use_entity_culling: true,
            animate_only_visible_textures: false,
        },
        rendering: {
            render_distance: 12,
            simulation_distance: 12,
            entity_distance: 150,
            brightness: 50,
            gui_scale: 0,
            fullscreen: false,
            v_sync: false,
            fps_limit: 240,
        },
        advanced: {
            arena_memory_allocator: 'async',
            allow_direct_memory_access: true,
            enable_memory_tracing: false,
            use_advanced_staging_buffers: true,
            cpu_render_ahead_limit: 3,
        },
        notifications: {
            hide_donation_button: true,
        }
    }
};

// Lithium Presets (mostly the same across presets, all optimizations enabled)
export const LITHIUM_PRESETS: Record<'low-end' | 'balanced' | 'high-end', LithiumConfig> = {
    'low-end': {
        'mixin.ai.pathing': true,
        'mixin.ai.poi': true,
        'mixin.ai.task': true,
        'mixin.block.hopper': true,
        'mixin.chunk.serialization': true,
        'mixin.entity.collisions': true,
        'mixin.gen.cached_generator_settings': true,
        'mixin.world.block_entity_ticking': true,
        'mixin.world.chunk_ticking': true,
        'mixin.world.tick_scheduler': true,
    },
    'balanced': {
        'mixin.ai.pathing': true,
        'mixin.ai.poi': true,
        'mixin.ai.task': true,
        'mixin.block.hopper': true,
        'mixin.chunk.serialization': true,
        'mixin.entity.collisions': true,
        'mixin.gen.cached_generator_settings': true,
        'mixin.world.block_entity_ticking': true,
        'mixin.world.chunk_ticking': true,
        'mixin.world.tick_scheduler': true,
    },
    'high-end': {
        'mixin.ai.pathing': true,
        'mixin.ai.poi': true,
        'mixin.ai.task': true,
        'mixin.block.hopper': true,
        'mixin.chunk.serialization': true,
        'mixin.entity.collisions': true,
        'mixin.gen.cached_generator_settings': true,
        'mixin.world.block_entity_ticking': true,
        'mixin.world.chunk_ticking': true,
        'mixin.world.tick_scheduler': true,
    }
};

// FerriteCore Presets (all optimizations enabled)
export const FERRITECORE_PRESETS: Record<'low-end' | 'balanced' | 'high-end', FerriteCoreConfig> = {
    'low-end': {
        'mixin.blockstatecache': true,
        'mixin.flatten_states': true,
        'mixin.thread_local_random': true,
        'mixin.cache_multipart_models': true,
        'mixin.reduce_blockstate_cache_rebuilds': true,
    },
    'balanced': {
        'mixin.blockstatecache': true,
        'mixin.flatten_states': true,
        'mixin.thread_local_random': true,
        'mixin.cache_multipart_models': true,
        'mixin.reduce_blockstate_cache_rebuilds': true,
    },
    'high-end': {
        'mixin.blockstatecache': true,
        'mixin.flatten_states': true,
        'mixin.thread_local_random': true,
        'mixin.cache_multipart_models': true,
        'mixin.reduce_blockstate_cache_rebuilds': true,
    }
};

// EntityCulling Presets
export const ENTITYCULLING_PRESETS: Record<'low-end' | 'balanced' | 'high-end', EntityCullingConfig> = {
    'low-end': {
        tracingDistance: 64,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: true,
        sleepDelay: 10,
        hitboxes: false,
        tracePlayers: true,
    },
    'balanced': {
        tracingDistance: 96,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: true,
        sleepDelay: 5,
        hitboxes: false,
        tracePlayers: true,
    },
    'high-end': {
        tracingDistance: 128,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: false,
        sleepDelay: 3,
        hitboxes: false,
        tracePlayers: true,
    }
};

// ImmediatelyFast Presets
export const IMMEDIATELYFAST_PRESETS: Record<'low-end' | 'balanced' | 'high-end', ImmediatelyFastConfig> = {
    'low-end': {
        experimental_screen_batching: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_buffer_upload: true,
        font_atlas_resizing: true,
    },
    'balanced': {
        experimental_screen_batching: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_buffer_upload: true,
        font_atlas_resizing: true,
    },
    'high-end': {
        experimental_screen_batching: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_buffer_upload: true,
        font_atlas_resizing: true,
    }
};

// Export all presets as a bundle
export const ALL_PRESETS = {
    sodium: SODIUM_PRESETS,
    lithium: LITHIUM_PRESETS,
    ferritecore: FERRITECORE_PRESETS,
    entityculling: ENTITYCULLING_PRESETS,
    immediatelyfast: IMMEDIATELYFAST_PRESETS,
};
