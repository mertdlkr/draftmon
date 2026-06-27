/**
 * Generic retry utility for async operations (e.g. RPC calls).
 *
 * @param fn        Async function to execute
 * @param retries   Number of additional attempts after the first failure (default: 3)
 * @param delayMs   Base delay between retries in ms — doubles each attempt (default: 500)
 */
export async function retryAsync<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 500,
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
            }
        }
    }
    throw lastError;
}
