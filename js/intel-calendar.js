'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: ECONOMIC CALENDAR
// ───────────────────────────────────────────────────────────────────────────
// Pulls today's economic events from the TradingView free CORS endpoint
// (already used by the Markets tab calendar). Adds two flags Lumen needs:
//
//   pre_event_caution: true within the two hour window before any HIGH
//                       impact event. New entries should be flagged.
//   post_event_opportunity: true within the thirty minute window after a
//                       HIGH impact release while the actual is known.
//
// Cache: localStorage 15 minutes. The TradingView feed itself updates as
// events publish so a fresh pull every fifteen minutes captures actuals
// without hammering the endpoint.
//
// Public API:
//   await LumenIntel.calendar()        returns analysis object
//   LumenIntel.calendar.cached()       returns last cached payload
//   LumenIntel.calendar.clear()        wipes the local cache
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var CACHE_KEY = 'wm_intel_calendar';
  var TTL_MS = 15 * 60 * 1000;

  var COUNTRY_TO_INSTRUMENTS = {
    US: ['DXY','XAUUSD','XAGUSD','SPX500','NAS100','US30','USOIL','EURUSD','USDJPY','GBPUSD','USDCAD','AUDUSD','BTCUSD','ETHUSD'],
    EU: ['EURUSD','EURGBP','EURJPY','GER40'],
    GB: ['GBPUSD','EURGBP','GBPJPY','UK100'],
    JP: ['USDJPY','EURJPY','GBPJPY','JPN225'],
    AU: ['AUDUSD','AUDJPY','XAUUSD'],
    CA: ['USDCAD','USOIL','CADJPY'],
    CH: ['USDCHF','EURCHF','XAUUSD']
  };

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      if (Date.now() - (p._fetchedAt || 0) > TTL_MS) return null;
      return p;
    } catch (_) { return null; }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(
        Object.assign({}, payload, { _fetchedAt: Date.now() })
      ));
    } catch (_) {}
  }

  function fallback(reason) {
    return {
      pre_event_caution: false,
      post_event_opportunity: false,
      next_event: null,
      minutes_to_next: null,
      events_today_high: 0,
      narrative: 'Calendar unavailable. ' + reason,
      source: 'unavailable'
    };
  }

  async function compute(instrument) {
    var cached = readCache();
    if (cached) return decorate(cached, instrument);

    try {
      var todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      var todayEnd   = new Date().toISOString().slice(0, 10) + 'T23:59:59.000Z';
      var url = 'https://economic-calendar.tradingview.com/events?from=' + todayStart
        + '&to=' + todayEnd
        + '&countries=US,GB,EU,JP,AU,CA,CH&minImportance=0';
      var r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error('calendar status ' + r.status);
      var data = await r.json();
      var events = (data.result || []).map(function (ev) {
        var date = new Date(ev.date);
        return {
          scheduled_at_utc: ev.date,
          scheduled_ms: date.getTime(),
          event_name: ev.title || ev.indicator || 'Economic Event',
          country: ev.country || '',
          impact_level: ev.importance >= 2 ? 'high' : ev.importance === 1 ? 'medium' : 'low',
          forecast: ev.forecast,
          actual: ev.actual,
          previous: ev.previous
        };
      });

      var payload = {
        events: events,
        events_today_high: events.filter(function (e) { return e.impact_level === 'high'; }).length,
        source: 'tradingview-calendar'
      };
      writeCache(payload);
      return decorate(payload, instrument);
    } catch (e) {
      return fallback('feed failed: ' + e.message);
    }
  }

  function decorate(payload, instrument) {
    var now = Date.now();
    var pre = false, post = false, postCtx = null, nextEv = null, minutesToNext = null;

    var relevantEvents = payload.events;
    if (instrument) {
      relevantEvents = payload.events.filter(function (ev) {
        var insts = COUNTRY_TO_INSTRUMENTS[ev.country] || [];
        return ev.impact_level === 'high' && insts.indexOf(instrument) >= 0;
      });
    }

    for (var i = 0; i < relevantEvents.length; i++) {
      var ev = relevantEvents[i];
      var minutesToEvent = (ev.scheduled_ms - now) / 60000;
      var minutesSince = (now - ev.scheduled_ms) / 60000;

      if (minutesToEvent > 0 && minutesToEvent <= 120) {
        pre = true;
        if (!nextEv || minutesToEvent < minutesToNext) {
          nextEv = ev;
          minutesToNext = Math.round(minutesToEvent);
        }
      }
      if (minutesSince > 0 && minutesSince <= 30 && ev.actual != null) {
        post = true;
        var dev = (ev.forecast != null) ? Number(ev.actual) - Number(ev.forecast) : null;
        postCtx = {
          event_name: ev.event_name,
          deviation: dev,
          deviation_direction: dev == null ? 'unknown' : dev > 0 ? 'beat' : dev < 0 ? 'miss' : 'in_line',
          actual: ev.actual,
          forecast: ev.forecast,
          minutes_since: Math.round(minutesSince)
        };
      }
    }

    return {
      pre_event_caution: pre,
      post_event_opportunity: post,
      next_event: nextEv ? {
        event_name: nextEv.event_name,
        country: nextEv.country,
        impact_level: nextEv.impact_level,
        scheduled_at_utc: nextEv.scheduled_at_utc,
        forecast: nextEv.forecast,
        previous: nextEv.previous
      } : null,
      minutes_to_next: minutesToNext,
      post_event_context: postCtx,
      events_today_high: payload.events_today_high || 0,
      instrument_filtered: !!instrument,
      narrative: pre
        ? ('Pre event caution: ' + (nextEv ? nextEv.event_name : 'high impact event') + ' in ' + minutesToNext + ' minutes.')
        : post
        ? ('Post event opportunity: ' + postCtx.event_name + ' actual ' + postCtx.actual + ' vs forecast ' + postCtx.forecast + '.')
        : 'No high impact event in the immediate window.',
      source: payload.source
    };
  }

  ROOT.calendar = compute;
  ROOT.calendar.cached = readCache;
  ROOT.calendar.clear = function () { try { localStorage.removeItem(CACHE_KEY); } catch (_) {} };
})();
