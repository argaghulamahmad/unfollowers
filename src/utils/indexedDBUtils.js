import { openNotification } from './notificationUtils';

const DB_NAME = 'unfollowersDB';
const DB_VERSION = 2;
const STORES = {
    FOLLOWERS: 'followers',
    UNFOLLOWERS: 'unfollowers',
    CONFIG: 'config',
    PROFILES: 'profiles'
};

const handleDBError = (error, operation) => {
    const message = `Failed to ${operation}`;
    console.error(message, error);
    openNotification('error', message);
    throw error;
};

// Initialize database
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => handleDBError(event.target.error, 'open database');

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            Object.values(STORES).forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
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
            request.onerror = () => handleDBError(request.error, 'save data');
        });
    } catch (error) {
        handleDBError(error, 'perform database operation');
    }
};

// Batch add/update operation
export const putBatchData = async (storeName, items) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            const results = [];
            items.forEach(item => {
                const request = store.put(item);
                request.onsuccess = () => results.push(request.result);
                request.onerror = () => handleDBError(request.error, 'save batch data');
            });

            transaction.oncomplete = () => resolve(results);
            transaction.onerror = () => handleDBError(transaction.error, 'complete batch operation');
        });
    } catch (error) {
        handleDBError(error, 'perform batch operation');
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
            request.onerror = () => handleDBError(request.error, 'fetch data');
        });
    } catch (error) {
        handleDBError(error, 'perform database operation');
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
            request.onerror = () => handleDBError(request.error, 'fetch data by ID');
        });
    } catch (error) {
        handleDBError(error, 'perform database operation');
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
            request.onerror = () => handleDBError(request.error, 'delete data');
        });
    } catch (error) {
        handleDBError(error, 'perform database operation');
    }
};

// Clear store operation
export const clearStore = async (storeName) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => handleDBError(request.error, 'clear store');
        });
    } catch (error) {
        handleDBError(error, 'perform database operation');
    }
};

export { STORES };