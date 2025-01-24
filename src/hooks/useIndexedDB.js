import { useState, useEffect, useCallback } from 'react';
import { getAllData, putData, deleteData, clearStore, STORES } from '../utils/indexedDBUtils';
import { openNotification } from '../utils/notificationUtils';

export const useIndexedDB = (storeName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all data from the store
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllData(storeName);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err.message);
            openNotification('error', `Failed to fetch ${storeName}`);
        } finally {
            setLoading(false);
        }
    }, [storeName]);

    // Add or update an item
    const saveItem = async (item) => {
        try {
            setLoading(true);
            await putData(storeName, item);
            await fetchData(); // Refresh the data
            openNotification('success', 'Data saved successfully');
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete an item
    const removeItem = async (id) => {
        try {
            setLoading(true);
            await deleteData(storeName, id);
            await fetchData(); // Refresh the data
            openNotification('success', 'Item deleted successfully');
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Clear all items from the store
    const clearAll = async () => {
        try {
            setLoading(true);
            await clearStore(storeName);
            setData([]);
            openNotification('success', 'All data cleared successfully');
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        saveItem,
        removeItem,
        clearAll,
        refreshData: fetchData
    };
};