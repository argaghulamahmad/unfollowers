import React, {useState} from 'react';
import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification, Button, Divider, Space, Progress} from 'antd';
import {
    acceptedUploadedFilenames,
    followersJsonFileName,
    followingJsonFileName,
} from '../consts';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { STORES } from '../utils/indexedDBUtils';

const {Dragger} = Upload;
class Profile {
    constructor(username, connectedAt) {
        this.username = username;
        this.connectedAt = connectedAt;
        this.id = username; // Required for IndexedDB
    }
}

const Sync = () => {
    const [uploadedFiles, setUploadedFiles] = useState(new Set());
    const [progress, setProgress] = useState({
        status: '',
        percent: 0,
        subStatus: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const { saveItem: saveFollower, clearAll: clearFollowers } = useIndexedDB(STORES.FOLLOWERS);
    const { saveItem: saveUnfollower, clearAll: clearUnfollowers } = useIndexedDB(STORES.UNFOLLOWERS);
    const { saveItem: saveConfig, data: configData } = useIndexedDB(STORES.CONFIG);
    const { saveItem: saveProfile, clearAll: clearProfiles } = useIndexedDB(STORES.PROFILES);
    const { data: allProfiles = [] } = useIndexedDB(STORES.PROFILES);
    const { data: followers = [] } = useIndexedDB(STORES.FOLLOWERS);
    const { data: unfollowers = [] } = useIndexedDB(STORES.UNFOLLOWERS);

    // Get config values from IndexedDB
    const lastUpdateAt = configData.find(c => c.id === 'lastUpdateAt')?.value || null;

    // If we have data in any store, show the last update time and counts
    const hasData = allProfiles.length > 0 || followers.length > 0 || unfollowers.length > 0;

    const recomputeData = async allProfiles => {
        setIsProcessing(true);
        try {
            setProgress({ status: 'Clearing existing data', percent: 5, subStatus: 'Preparing database...' });
            // Clear existing data
            await clearFollowers();
            await clearUnfollowers();
            await clearProfiles();

            setProgress({ status: 'Processing profiles', percent: 10, subStatus: 'Analyzing data...' });
            // Get follower and following usernames from profiles
            const followerUsernames = allProfiles
                .filter(p => p.type === 'follower')
                .map(p => p.username);
            const followingUsernames = allProfiles
                .filter(p => p.type === 'following')
                .map(p => p.username);

            setProgress({ status: 'Running WASM computations', percent: 30, subStatus: 'Finding unfollowers and mutuals...' });
            // Call WASM module for heavy computations
            const result = await window.processProfiles(
                JSON.stringify(allProfiles),
                JSON.stringify(followerUsernames),
                JSON.stringify(followingUsernames)
            );
            console.log('Result:', result);
            console.log('WASM processing complete');

            setProgress({ status: 'Processing results', percent: 60, subStatus: 'Analyzing results...' });
            // Parse the result
            const processedData = JSON.parse(result);

            // Check for errors
            if (processedData.error) {
                throw new Error(processedData.error);
            }

            setProgress({ status: 'Saving profiles', percent: 70, subStatus: 'Updating database...' });
            // First save all profiles to the PROFILES store
            await Promise.all(
                allProfiles.map(p => saveProfile({
                    ...p,
                    id: p.username
                }))
            );

            setProgress({ status: 'Saving results', percent: 85, subStatus: 'Almost done...' });
            // Save processed data to respective stores
            const savePromises = [
                // Save followers (mutual followers)
                ...processedData.mutualProfiles.map(p => saveFollower({
                    ...p,
                    id: p.username,
                    type: 'mutual',
                    connectedAt: allProfiles.find(ap => ap.username === p.username)?.connectedAt || Date.now()
                })),
                // Save unfollowers
                ...processedData.unfollowerProfiles.map(p => saveUnfollower({
                    ...p,
                    id: p.username,
                    type: 'unfollower',
                    connectedAt: allProfiles.find(ap => ap.username === p.username)?.connectedAt || Date.now(),
                    unfollowedAt: Date.now()
                }))
            ];

            await Promise.all(savePromises);

            setProgress({ status: 'Finalizing', percent: 95, subStatus: 'Wrapping up...' });
            // Update last update timestamp
            const timestamp = Date.now();
            await saveConfig({ key: 'lastUpdateAt', value: timestamp, id: 'lastUpdateAt' });

            setProgress({ status: 'Complete', percent: 100, subStatus: 'Done!' });

            // Show final success notification with stats
            notification.success({
                message: 'Processing complete',
                description: `Found ${processedData.mutualProfiles.length} mutual followers and ${processedData.unfollowerProfiles.length} unfollowers.`,
            });

            // Clear uploaded files tracking
            setUploadedFiles(new Set());

            // Redirect after processing is complete
            setTimeout(() => {
                window.location.href = '../';
            }, 2000);

            notification.info({
                message: 'Redirecting',
                description: 'Taking you to the results page...',
            });
        } catch (error) {
            notification.error({
                message: 'Failed to process profiles',
                description: error.message
            });
            setProgress({ status: 'Error', percent: 0, subStatus: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpload = async (file) => {
        if (!acceptedUploadedFilenames.includes(file.name)) {
            notification.error({
                message: 'Invalid file',
                description: 'Please upload followers.json or following.json files'
            });
            return false;
        }

        try {
            setProgress({ status: 'Reading file', percent: 0, subStatus: `Reading ${file.name}...` });
            const result = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (evt) => resolve(evt.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file, 'UTF-8');
            });

            setProgress({ status: 'Parsing file', percent: 30, subStatus: 'Processing JSON data...' });
            const parsedResult = JSON.parse(result);

            setProgress({ status: 'Creating profiles', percent: 60, subStatus: 'Converting data...' });
            const profiles = parsedResult.map((item) => {
                const data = item.string_list_data[0];
                const {value: username} = data;
                const connectedAt = data.timestamp * 1000;
                return new Profile(username, connectedAt);
            });

            // Remove existing profiles of this type
            const isFollowerFile = file.name === followersJsonFileName;
            const updatedProfiles = allProfiles.filter(p =>
                isFollowerFile ? p.type !== 'follower' : p.type !== 'following'
            );

            setProgress({ status: 'Saving profiles', percent: 80, subStatus: 'Updating database...' });
            // Save new profiles
            await Promise.all(
                profiles.map(p => saveProfile({
                    ...p,
                    type: isFollowerFile ? 'follower' : 'following',
                    id: p.username
                }))
            );

            // Add file to uploaded files set
            const newUploadedFiles = new Set(uploadedFiles);
            newUploadedFiles.add(file.name);
            setUploadedFiles(newUploadedFiles);

            setProgress({ status: 'Complete', percent: 100, subStatus: 'File processed successfully' });

            // Only show notification for the second file upload
            if (newUploadedFiles.size === 2) {
                notification.success({
                    message: 'Files processed',
                    description: 'Both files uploaded successfully. Processing data...',
                });
            }

            // Only recompute data when both files are uploaded
            if (newUploadedFiles.size === 2) {
                const allUpdatedProfiles = [...updatedProfiles, ...profiles];
                await recomputeData(allUpdatedProfiles);
            } else {
                notification.info({
                    message: 'Upload remaining file',
                    description: `Please upload ${isFollowerFile ? 'following.json' : 'followers.json'} to complete the process.`
                });
            }

            return false;
        } catch (error) {
            notification.error({
                message: 'Error processing file',
                description: error.message
            });
            setProgress({ status: 'Error', percent: 0, subStatus: error.message });
            return false;
        }
    };

    return (
        <div>
            <div>
                {lastUpdateAt ? (
                    <div>
                        Last update at {new Date(lastUpdateAt).toString()}
                        {hasData && (
                            <div>a
                                Current stats: {followers.length} mutuals, {unfollowers.length} unfollowers, {allProfiles.length} total profiles
                            </div>
                        )}
                    </div>
                ) : (
                    <div>Upload your followers and following data to get started!</div>
                )}
            </div>
            <div>
                <Divider orientation="left">Upload Data</Divider>
                <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                    {(progress.percent > 0 || isProcessing) && (
                        <div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong>{progress.status}</strong>
                                <div style={{ fontSize: '12px', color: '#666' }}>{progress.subStatus}</div>
                            </div>
                            <Progress percent={progress.percent} status={progress.status === 'Error' ? 'exception' : undefined} />
                        </div>
                    )}

                    <Button
                        type="primary"
                        style={{width: '100%'}}
                        onClick={() => {
                            window.open('https://www.instagram.com/download/request/');
                        }}
                    >
                        Ask for backup data here
                    </Button>

                    <Button
                        type="secondary"
                        style={{width: '100%', whiteSpace: 'normal', height: 'auto'}}
                        onClick={() => {
                            window.open('https://mail.google.com/mail/u/0/#inbox');
                        }}
                    >
                        Download backup data from the email that Instagram sent to your account's email
                    </Button>

                    <Dragger
                        multiple={true}
                        beforeUpload={handleUpload}
                        accept=".json"
                        showUploadList={false}
                        disabled={isProcessing}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">Click or drag followers.json and following.json files here</p>
                        <p className="ant-upload-hint">
                            Upload the JSON files from your Instagram data download
                        </p>
                    </Dragger>
                </Space>
            </div>
        </div>
    );
};

export default Sync;
