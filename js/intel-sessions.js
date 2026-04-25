'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: SESSION KILL ZONE ENGINE
// ───────────────────────────────────────────────────────────────────────────
// Tracks the active trading session in UTC and supplies a confidence
// multiplier that the master synthesis prompt should apply to any new
// signal. The Wingman sidebar already shows a session badge but does not
// gate signal acceptance on it. This module adds the multiplier so Lumen
// favours kill zone entries and de risks Asian session entries.
//
// Session windows (UTC):
//   Asian:                00:00 to 08:00      multiplier 0.5
//   London Open:          07:00 to 10:00      multiplier 1.2
//   New York Open:        12:00 to 15:00      multiplier 1.4
//   London-NY Overlap:    12:00 to 16:00      flag only
//   New York Close:       19:00 to 22:00      multiplier 0.7
//   Standard hours:       anything else       multiplier 1.0
//
// No cache. The function is cheap enough to call on every scan.
//
// Public API:
//   LumenIntel.session()                       returns analysis object
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  function compute(now) {
    var d = now ? new Date(now) : new Date();
    var hour = d.getUTCHours();
    var minute = d.getUTCMinutes();
    var sessions = [];
    var multiplier = 1.0;
    var label = 'standard_trading_hours';

    if (hour >= 0 && hour < 8)  { sessions.push('asian_session'); label = 'asian_session'; multiplier = 0.5; }
    if (hour >= 7 && hour < 10) { sessions.push('london_open_kill_zone'); label = 'london_open_kill_zone'; multiplier = Math.max(multiplier, 1.2); }
    if (hour >= 12 && hour < 15) { sessions.push('new_york_open_kill_zone'); label = 'new_york_open_kill_zone'; multiplier = Math.max(multiplier, 1.4); }
    if (hour >= 12 && hour < 16) { sessions.push('london_new_york_overlap'); }
    if (hour >= 19 && hour < 22) {
      sessions.push('new_york_close');
      // NY close suppression overrides the standard 1.0 baseline.
      multiplier = sessions.indexOf('london_open_kill_zone') >= 0 || sessions.indexOf('new_york_open_kill_zone') >= 0
        ? multiplier
        : 0.7;
      label = 'new_york_close';
    }
    if (!sessions.length) sessions.push('standard_trading_hours');

    var minutes_into_hour = minute;
    var minutes_to_next_session_change;
    if (hour < 7)       minutes_to_next_session_change = (7 - hour) * 60 - minute;
    else if (hour < 10) minutes_to_next_session_change = (10 - hour) * 60 - minute;
    else if (hour < 12) minutes_to_next_session_change = (12 - hour) * 60 - minute;
    else if (hour < 15) minutes_to_next_session_change = (15 - hour) * 60 - minute;
    else if (hour < 19) minutes_to_next_session_change = (19 - hour) * 60 - minute;
    else if (hour < 22) minutes_to_next_session_change = (22 - hour) * 60 - minute;
    else                minutes_to_next_session_change = (24 - hour) * 60 - minute;

    return {
      current_utc_hour: hour,
      current_utc_minute: minute,
      active_sessions: sessions,
      primary_session: label,
      signal_confidence_multiplier: multiplier,
      recommended_for_new_entries: multiplier >= 1.0,
      minutes_to_session_change: minutes_to_next_session_change,
      narrative: label === 'new_york_open_kill_zone'
        ? 'Peak liquidity window. Highest signal weight applied.'
        : label === 'london_open_kill_zone'
        ? 'London open kill zone. Elevated signal weight.'
        : label === 'asian_session'
        ? 'Asian session. Reduced signal weight; institutional activity is light.'
        : label === 'new_york_close'
        ? 'New York close. Reduced signal weight; position squaring distorts price.'
        : 'Standard hours. Baseline signal weight.'
    };
  }

  ROOT.session = compute;
})();
