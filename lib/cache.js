const print = require('./print');
const cache = new Map();
function set(key, value, ttl) {
    if (typeof ttl !== 'number' || ttl <= 0) {
        print.warn(`[CACHE] Invalid TTL provided for key "${key}". Item not cached.`);
        return;
    }
    const expiration = Date.now() + ttl;
    cache.set(key, { value, expiration });
    print.info(`[CACHE] SET: ${key} (TTL: ${ttl}ms)`);
}
function get(key) {
    const data = cache.get(key);
    if (!data) {
        print.info(`[CACHE] MISS: ${key}`);
        return null;
    }
    if (Date.now() > data.expiration) {
        cache.delete(key);
        print.info(`[CACHE] EXPIRED (on get): ${key}`);
        return null;
    }
    print.info(`[CACHE] HIT: ${key}`);
    return data.value;
}
function has(key) {
    const data = cache.get(key);
    if (!data) return false;
    if (Date.now() > data.expiration) {
        cache.delete(key);
        return false;
    }
    return true;
}
function del(key) {
    const deleted = cache.delete(key);
    if (deleted) {
        print.info(`[CACHE] DELETED: ${key}`);
    }
}
function clear() {
    cache.clear();
    print.warn('[CACHE] Cleared');
}
module.exports = { set, get, has, del, clear };