import React, { useRef, useState } from 'react';
import { Card, Upload, Button, Space, Progress, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { STORES } from '../utils/indexedDBUtils';

const DataManagement = () => {
    const [importProgress, setImportProgress] = useState(0);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef();

    const { clearAll: clearFollowers } = useIndexedDB(STORES.FOLLOWERS);
    const { clearAll: clearUnfollowers } = useIndexedDB(STORES.UNFOLLOWERS);
    const {
        saveItem: saveFollower,
        data: followers
    } = useIndexedDB(STORES.FOLLOWERS);
    const {
        saveItem: saveUnfollower,
        data: unfollowers
    } = useIndexedDB(STORES.UNFOLLOWERS);

    const handleImport = async (file) => {
        setImporting(true);
        setError(null);
        setImportProgress(0);

        try {
            const content = await file.text();
            const data = JSON.parse(content);

            // Validate import data
            if (!data.followers || !data.unfollowers) {
                throw new Error('Invalid import file format');
            }

            // Clear existing data
            await clearFollowers();
            await clearUnfollowers();

            // Import followers
            const totalItems = data.followers.length + data.unfollowers.length;
            let processed = 0;

            for (const follower of data.followers) {
                await saveFollower(follower);
                processed++;
                setImportProgress((processed / totalItems) * 100);
            }

            // Import unfollowers
            for (const unfollower of data.unfollowers) {
                await saveUnfollower(unfollower);
                processed++;
                setImportProgress((processed / totalItems) * 100);
            }

            setImportProgress(100);
        } catch (err) {
            setError(err.message);
        } finally {
            setImporting(false);
        }

        return false; // Prevent default upload behavior
    };

    const handleClearAll = async () => {
        try {
            // Clear IndexedDB data
            await clearFollowers();
            await clearUnfollowers();

            // Clear localStorage data
            localStorage.removeItem('followerProfiles');
            localStorage.removeItem('followingProfiles');
            localStorage.removeItem('allProfiles');
            localStorage.removeItem('unfollowerProfiles');
            localStorage.removeItem('followbackProfiles');
            localStorage.removeItem('mutualProfiles');
            localStorage.removeItem('followerUsernames');
            localStorage.removeItem('followingUsernames');
            localStorage.removeItem('lastUpdateAt');

            // Force reload to ensure all components are updated
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Card title="Data Management">
            <Space direction="vertical" style={{ width: '100%' }}>
                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                <div>
                    <h4>Current Data Status:</h4>
                    <p>{followers.length} followers and {unfollowers.length} unfollowers stored</p>
                </div>

                <Upload
                    beforeUpload={handleImport}
                    showUploadList={false}
                    accept=".json"
                >
                    <Button
                        icon={<UploadOutlined />}
                        loading={importing}
                        disabled={importing}
                    >
                        Import Data
                    </Button>
                </Upload>

                {importing && (
                    <Progress
                        percent={Math.round(importProgress)}
                        status={importProgress === 100 ? 'success' : 'active'}
                    />
                )}

                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleClearAll}
                    disabled={importing || (!followers.length && !unfollowers.length)}
                >
                    Clear All Data
                </Button>
            </Space>
        </Card>
    );
};

export default DataManagement;