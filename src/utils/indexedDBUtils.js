import { openNotification } from './notificationUtils';

const DB_NAME = 'unfollowersDB';
const DB_VERSION = 2;
const STORES = {
    FOLLOWERS: 'followers',
    UNFOLLOWERS: 'unfollowers',
    CONFIG: 'config',
    PROFILES: 'profiles'
};

// Initialize database
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            openNotification('error', 'Failed to open database');
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.FOLLOWERS)) {
                db.createObjectStore(STORES.FOLLOWERS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.UNFOLLOWERS)) {
                db.createObjectStore(STORES.UNFOLLOWERS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.CONFIG)) {
                db.createObjectStore(STORES.CONFIG, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.PROFILES)) {
                db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
            }
        };
    });
};

// Generic add/update operation
export const putData = async (storeName, data) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error saving data:', request.error);
                openNotification('error', 'Failed to save data');
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
};

// Generic get all operation
export const getAllData = async (storeName) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error fetching data:', request.error);
                openNotification('error', 'Failed to fetch data');
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
};

// Generic get by ID operation
export const getDataById = async (storeName, id) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error fetching data:', request.error);
                openNotification('error', 'Failed to fetch data');
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
};

// Generic delete operation
export const deleteData = async (storeName, id) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Error deleting data:', request.error);
                openNotification('error', 'Failed to delete data');
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
};

// Clear all data in a store
export const clearStore = async (storeName) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Error clearing store:', request.error);
                openNotification('error', 'Failed to clear data');
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
};

export { STORES };