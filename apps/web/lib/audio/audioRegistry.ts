/**
 * Audio asset registry - placeholder paths for real mp3/wav
 * Drop files under /public/audio/ to enable; fail silently if missing.
 */
export const SOUND_REGISTRY = {
  sfx: {
    'ui.click': '/audio/sfx/ui/ui_click_01.mp3',
    'flow.answer_ok': '/audio/sfx/flow/flow_answer_ok_01.mp3',
    'flow.answer_fail': '/audio/sfx/flow/flow_answer_fail_01.mp3',
    'flow.skip': '/audio/sfx/flow/flow_skip_01.mp3',
    'reward.xp': '/audio/sfx/reward/xp_gain_01.mp3',
    'reward.level_up': '/audio/sfx/reward/level_up_01.mp3',
    'shop.purchase': '/audio/sfx/shop/purchase_01.mp3',
  } as Record<string, string>,
  music: {
    'music.retro.main': '/audio/music/packs/retro/retro_main_loop_01.mp3',
    'music.therapy.lofi': '/audio/music/packs/lofi/therapy_loop_01.mp3',
    'music.battle.arcade': '/audio/music/packs/arcade/battle_loop_01.mp3',
  } as Record<string, string>,
};
