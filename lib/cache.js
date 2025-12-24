const print = require('./print');

const cache = new Map();

/**
 * Sets a value in the cache with an expiration time.
 * @param {string} key The key to store the data under.
 * @param {any} value The value to store.
 * @param {number} ttl Time to live in milliseconds.
 */
function set(key, value, ttl) {
    const expiration = Date.now() + ttl;
    cache.set(key, {
        value,
        expiration
    });
    print.info(`[CACHE] SET: ${key} (TTL: ${ttl}ms)`);

    setTimeout(() => {
        cache.delete(key);
        print.info(`[CACHE] EXPIRED: ${key}`);
    }, ttl);
}

/**
 * Gets a value from the cache.
 * @param {string} key The key to retrieve.
 * @returns {any|null} The cached value or null if not found or expired.
 */
function get(key) {
    const data = cache.get(key);
    if (!data) {
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

/**
 * Checks if a key exists in the cache.
 * @param {string} key The key to check.
 * @returns {boolean}
 */
function has(key) {
    return cache.has(key) && cache.get(key).expiration > Date.now();
}

/**
 * Deletes a key from the cache.
 * @param {string} key The key to delete.
 */
function del(key) {
    cache.delete(key);
    print.info(`[CACHE] DELETED: ${key}`);
}

/**
 * Clears the entire cache.
 */
function clear() {
    cache.clear();
    print.warn('[CACHE] Cleared');
}

module.exports = { set, get, has, del, clear };
