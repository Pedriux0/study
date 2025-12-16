//lib/storage/localStorageClient.ts 
/**
 * isBrowser is a helper to avoid window when on the server
 * Next.js renders for both client and server sides
 * protect us from runtime errors
 */
const isBrowser = typeof window !== "undefined";

/**
 * loadFromLocalStorage reads a value from the localStorage and saves it as JSON
 *  IF :  
 * -NOT BROWSER = FALLBACK
 * -NOT KEY = FALLBACK
 * avoids try and catchs repetition
 */
export function loadFromLocalStorage<T>(key: string, fallback: T): T {
    if (!isBrowser) {
        return fallback;
    }
    try {
        const rawValue = window.localStorage.getItem(key);
        if (rawValue === null) {
            return fallback;
        }
        return JSON.parse(rawValue) as T;
    } catch (error) {
        console.warn(`[localstorage] failed to load the key = "${key}", returning fallback `, error);
    }
    return fallback;
}
/**
 * saveToLocalStorage make the provided value to string and save it under a key
 *  -IF:
 *    NOT BROWSER = Does nothings
 *    Serialization fails = logs warning and continue
 * 
 * Failing silently is okay becuase is a study tool and local 
 * persistence is good to get, this is not critical intfrastructure 
 * just helpful
 */
export function saveToLocalStorage<T>(key: string, value:T):void{
    if(!isBrowser) {
        return; 
        console.log("Not valid");
    }
    try{
        const serialized = JSON.stringify(value);
        //Key and value is saved locally
        window.localStorage.setItem(key, serialized);
    } catch(error){
        console.warn(`[localStorage] Failed to save the key "{$key}"`,error);
    }
}
