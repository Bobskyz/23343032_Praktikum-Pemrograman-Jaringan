const request = require('postman-request');

// Simple in-memory cache to reduce API calls
const cache = new Map();
// Increase default TTL to 10 minutes to reduce repeated calls and avoid rate limits
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function cacheSet(key, value, ttl = DEFAULT_TTL) {
    cache.set(key, { value, expires: Date.now() + ttl });
}

// Helper untuk memanggil API mediastack dengan cache
// apiKey: string, options: { countries, languages, keywords, limit }
const mediastack = (apiKey, options = {}, callback) => {
    const base = 'http://api.mediastack.com/v1/news';
    const params = new URLSearchParams({ access_key: apiKey });
    if (options.languages) params.set('languages', options.languages);
    if (options.countries) params.set('countries', options.countries);
    if (options.keywords) params.set('keywords', options.keywords);
    if (options.limit) params.set('limit', String(options.limit));

    const url = `${base}?${params.toString()}`;

    // gunakan url sebagai kunci cache (termasuk API key)
    const cacheKey = `mediastack:${url}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
        return process.nextTick(() => callback(null, cached));
    }

    // If we recently detected a rate limit for this request shape, avoid calling API again
    const rateKey = `${cacheKey}:ratelimit`;
    const rateLimitFlag = cacheGet(rateKey);
    if (rateLimitFlag) {
        // If we have cached data (stale), it's already returned above. Otherwise respond with a clear message.
        return process.nextTick(() => callback('Rate limit in effect for news provider; please try again later.', null));
    }

    request({ url, json: true, timeout: 10000 }, (err, resp, body) => {
        if (err) return callback('Unable to connect to news service', null);

        // If the API returned a non-200 status, try to surface the provider message.
        if (resp.statusCode !== 200) {
            // If body contains an error object, use that message.
            const providerMsg = body && body.error && body.error.message ? body.error.message : null;

            // If server responded 422 (unprocessable), it can mean an invalid/unsupported param
            // (for example an unsupported language code). Try a best-effort retry without the
            // `languages` parameter and return that result instead.
            // Handle 422 (unprocessable) by retrying without `languages` (some plans don't support it)
            if (resp.statusCode === 422 && options.languages) {
                // build new params without languages
                const retryParams = new URLSearchParams({ access_key: apiKey });
                if (options.countries) retryParams.set('countries', options.countries);
                if (options.keywords) retryParams.set('keywords', options.keywords);
                if (options.limit) retryParams.set('limit', String(options.limit));
                const retryUrl = `${base}?${retryParams.toString()}`;

                request({ url: retryUrl, json: true, timeout: 10000 }, (err2, resp2, body2) => {
                    if (err2) return callback('Unable to connect to news service (retry)', null);
                    if (resp2.statusCode !== 200) {
                        const msg2 = body2 && body2.error && body2.error.message ? body2.error.message : `News API returned ${resp2.statusCode}`;
                        return callback(msg2, null);
                    }
                    if (!body2 || !body2.data) return callback('No data returned from news API (retry)', null);
                    cacheSet(cacheKey, body2.data, options.ttl || DEFAULT_TTL);
                    return callback(null, body2.data);
                });
                return;
            }

            // If provider indicates a rate limit or we got 429, set a temporary rate-limit flag
            const isRateLimit = resp.statusCode === 429 || (providerMsg && /exceed|limit/i.test(providerMsg));
            if (isRateLimit) {
                // mark this request shape as rate-limited for a short period (5 minutes)
                cacheSet(rateKey, true, 5 * 60 * 1000);
                // if we have cached data, return it (we already would have returned earlier). Otherwise return provider message.
                return callback(providerMsg || 'Rate limit exceeded for news provider', null);
            }

            const errMsg = providerMsg || `News API returned ${resp.statusCode}`;
            return callback(errMsg, null);
        }

        if (!body || !body.data) return callback('No data returned from news API', null);

        // simpan ke cache (TTL opsional)
        cacheSet(cacheKey, body.data, options.ttl || DEFAULT_TTL);

        callback(null, body.data);
    });
};

module.exports = mediastack;
// also provide named/default exports for environments that expect a default property
try {
    module.exports.default = mediastack;
} catch (e) {
    // ignore
}
