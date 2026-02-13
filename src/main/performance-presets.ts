/**
 * Performance preset definitions for Minecraft 1.21.11 optimization mods
 * Values aligned with research report: "Guide d'optimisation du client Minecraft"
 */

import type { SodiumConfig, LithiumConfig, FerriteCoreConfig, EntityCullingConfig, ImmediatelyFastConfig, ModernFixConfig, SodiumLeafCullingConfig } from './types/mod-configs';

// ============================================
// Sodium Presets
// Render distances aligned with report: Low=8, Balanced=12, High=16
// ============================================
export const SODIUM_PRESETS: Record<'low-end' | 'balanced' | 'high-end', Partial<SodiumConfig>> = {
    'low-end': {
        quality: {
            graphics_quality: 'fast',
            clouds_quality: 'off',
            weather_quality: 'fast',
            leaves_quality: 'fast',
            smooth_lighting: 'off',        // Report: OFF for Low
            particles: 'minimal',           // Report: reduced particles for Low
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
            render_distance: 8,             // Report: 6-8 chunks for Low
            simulation_distance: 6,
            entity_distance: 50,
            brightness: 50,
            gui_scale: 0, // Auto
            fullscreen: false,
            v_sync: false,                  // Report: vSync OFF for Low
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
            graphics_quality: 'fast',       // Report: Fast for Balanced too (better FPS/quality)
            clouds_quality: 'fast',
            weather_quality: 'fancy',
            leaves_quality: 'fancy',
            smooth_lighting: 'off',         // Report: OFF for FPS gain
            particles: 'decreased',         // Report: decreased for Balanced
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
            render_distance: 12,            // Report: 12-14 chunks for Balanced
            simulation_distance: 10,
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
            smooth_lighting: 'off',         // Report: OFF even for High (FPS priority)
            particles: 'all',               // Report: all particles for High
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
            render_distance: 16,            // Report: 16+ chunks for High
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

// ============================================
// Lithium Presets
// Report: config vide = tout actif = meilleure perf. Identique pour tous les tiers.
// ============================================
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

// ============================================
// FerriteCore Presets
// Report: no user config, always all ON. Identical across tiers.
// ============================================
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

// ============================================
// EntityCulling Presets
// Report: skipHiddenEntityRendering + skipHiddenBlockEntityRendering always ON
// tickCulling: ON Low/Balanced for CPU savings, OFF High to avoid animation side-effects
// ============================================
export const ENTITYCULLING_PRESETS: Record<'low-end' | 'balanced' | 'high-end', EntityCullingConfig> = {
    'low-end': {
        skipHiddenEntityRendering: true,       // Report: always ON
        skipHiddenBlockEntityRendering: true,   // Report: always ON
        tracingDistance: 64,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: true,                      // Report: ON for Low (aggressive CPU savings)
        sleepDelay: 10,
        hitboxes: false,
        tracePlayers: true,
    },
    'balanced': {
        skipHiddenEntityRendering: true,
        skipHiddenBlockEntityRendering: true,
        tracingDistance: 96,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: true,                      // Report: ON for Balanced
        sleepDelay: 5,
        hitboxes: false,
        tracePlayers: true,
    },
    'high-end': {
        skipHiddenEntityRendering: true,
        skipHiddenBlockEntityRendering: true,
        tracingDistance: 128,
        debugMode: false,
        skipMarkerArmorStands: true,
        tickCulling: false,                     // Report: OFF for High (avoid animation freezes)
        sleepDelay: 3,
        hitboxes: false,
        tracePlayers: true,
    }
};

// ============================================
// ImmediatelyFast Presets
// Report: core features always ON, experimental features only for Low
// ============================================
export const IMMEDIATELYFAST_PRESETS: Record<'low-end' | 'balanced' | 'high-end', ImmediatelyFastConfig> = {
    'low-end': {
        font_atlas_resizing: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_text_lookup: true,
        fast_buffer_upload: true,
        experimental_screen_batching: true,             // Report: ON for Low (extra CPU perf)
        experimental_disable_error_checking: true,      // Report: ON for Low (extra perf, minor risk)
        experimental_sign_text_buffering: false,
    },
    'balanced': {
        font_atlas_resizing: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_text_lookup: true,
        fast_buffer_upload: true,
        experimental_screen_batching: false,            // Report: OFF for Balanced (stability)
        experimental_disable_error_checking: false,     // Report: OFF for Balanced
        experimental_sign_text_buffering: false,
    },
    'high-end': {
        font_atlas_resizing: true,
        map_atlas_generation: true,
        hud_batching: true,
        fast_text_lookup: true,
        fast_buffer_upload: true,
        experimental_screen_batching: false,            // Report: OFF for High (stability priority)
        experimental_disable_error_checking: false,     // Report: OFF for High
        experimental_sign_text_buffering: false,
    }
};

// ============================================
// ModernFix Presets
// Report: dynamic_resources always ON, low_mem only ON for Low-end
// ============================================
export const MODERNFIX_PRESETS: Record<'low-end' | 'balanced' | 'high-end', ModernFixConfig> = {
    'low-end': {
        'mixin.perf.dynamic_resources': true,
        'mixin.perf.blast_search_trees': true,
        'mixin.perf.faster_item_rendering': true,
        'mixin.perf.deduplicate_location': true,
        'mixin.perf.compact_bit_storage': true,
        'mixin.opt.low_mem': true,                      // Report: ON for Low (aggressive memory savings)
        'mixin.bugfix.concurrency_fixes': true,
        'mixin.bugfix.world_leaks': true,
    },
    'balanced': {
        'mixin.perf.dynamic_resources': true,
        'mixin.perf.blast_search_trees': true,
        'mixin.perf.faster_item_rendering': true,
        'mixin.perf.deduplicate_location': true,
        'mixin.perf.compact_bit_storage': true,
        'mixin.opt.low_mem': false,                     // Report: OFF for Balanced
        'mixin.bugfix.concurrency_fixes': true,
        'mixin.bugfix.world_leaks': true,
    },
    'high-end': {
        'mixin.perf.dynamic_resources': true,
        'mixin.perf.blast_search_trees': true,
        'mixin.perf.faster_item_rendering': true,
        'mixin.perf.deduplicate_location': true,
        'mixin.perf.compact_bit_storage': true,
        'mixin.opt.low_mem': false,                     // Report: OFF for High
        'mixin.bugfix.concurrency_fixes': true,
        'mixin.bugfix.world_leaks': true,
    }
};

// ============================================
// SodiumLeafCulling Presets
// Report: solid_aggressive recommended for all profiles for max FPS
// solid for High if user prefers visual fidelity over FPS
// ============================================
export const SODIUMLEAFCULLING_PRESETS: Record<'low-end' | 'balanced' | 'high-end', SodiumLeafCullingConfig> = {
    'low-end': {
        mode: 'solid_aggressive',  // Report: max FPS
        debug: false,
    },
    'balanced': {
        mode: 'solid_aggressive',  // Report: solid_aggressive recommended everywhere
        debug: false,
    },
    'high-end': {
        mode: 'solid',             // Report: solid for visual fidelity on High
        debug: false,
    }
};

// Export all presets as a bundle
export const ALL_PRESETS = {
    sodium: SODIUM_PRESETS,
    lithium: LITHIUM_PRESETS,
    ferritecore: FERRITECORE_PRESETS,
    entityculling: ENTITYCULLING_PRESETS,
    immediatelyfast: IMMEDIATELYFAST_PRESETS,
    modernfix: MODERNFIX_PRESETS,
    sodiumleafculling: SODIUMLEAFCULLING_PRESETS,
};
