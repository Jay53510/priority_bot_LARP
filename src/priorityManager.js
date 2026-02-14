const { PRIORITY_DURATION_MS, COOLDOWN_DURATION_MS } = require('./constants');

// Global in-memory state: one priority flow for the whole bot process.
const state = {
  isActive: false,
  startedAt: null,
  expiresAt: null,
  cooldownUntil: null,
  timeoutId: null
};

function now() {
  return Date.now();
}

function formatDuration(ms) {
  if (ms <= 0) return '0m 0s';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function clearTimer() {
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
}

function getCooldownRemainingMs() {
  if (!state.cooldownUntil) return 0;
  return Math.max(0, state.cooldownUntil - now());
}

function clearExpiredCooldown() {
  if (state.cooldownUntil && now() >= state.cooldownUntil) {
    state.cooldownUntil = null;
  }
}

function startPriority(onExpire) {
  const currentTime = now();

  if (state.isActive) {
    return { ok: false, reason: 'already_active' };
  }

  clearExpiredCooldown();

  if (state.cooldownUntil && currentTime < state.cooldownUntil) {
    return {
      ok: false,
      reason: 'cooldown_active',
      remainingMs: state.cooldownUntil - currentTime
    };
  }

  state.isActive = true;
  state.startedAt = currentTime;
  state.expiresAt = currentTime + PRIORITY_DURATION_MS;

  state.timeoutId = setTimeout(() => {
    if (state.isActive) {
      endPriority();
      onExpire();
    }
  }, PRIORITY_DURATION_MS);

  return {
    ok: true,
    expiresAt: state.expiresAt
  };
}

function endPriority() {
  if (!state.isActive) {
    return { ok: false, reason: 'not_active' };
  }

  clearTimer();
  state.isActive = false;
  state.startedAt = null;
  state.expiresAt = null;
  state.cooldownUntil = now() + COOLDOWN_DURATION_MS;

  return { ok: true, cooldownUntil: state.cooldownUntil };
}

function getStatus() {
  clearExpiredCooldown();

  const currentTime = now();
  const remainingPriorityMs = state.isActive && state.expiresAt
    ? Math.max(0, state.expiresAt - currentTime)
    : 0;
  const cooldownRemainingMs = getCooldownRemainingMs();

  return {
    isActive: state.isActive,
    remainingPriorityMs,
    cooldownRemainingMs,
    remainingPriorityText: state.isActive ? formatDuration(remainingPriorityMs) : 'N/A',
    cooldownRemainingText: cooldownRemainingMs > 0 ? formatDuration(cooldownRemainingMs) : 'None'
  };
}

module.exports = {
  startPriority,
  endPriority,
  getStatus,
  formatDuration,
  getCooldownRemainingMs
};
