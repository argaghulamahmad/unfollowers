import React, {useEffect, useState} from 'react';
import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification, Button, Divider, Space, List, Collapse, Empty, Input} from 'antd';
import {
    acceptedUploadedFilenames,
    followersJsonFileName,
    followingJsonFileName,
} from '../consts';
import {fetchGist, updateGist} from "../utils/githubUtils";
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
    const [gistId, setGistId] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [lastUpdateAt, setLastUpdateAt] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState(new Set());

    const { saveItem: saveFollower, clearAll: clearFollowers } = useIndexedDB(STORES.FOLLOWERS);
    const { saveItem: saveUnfollower, clearAll: clearUnfollowers } = useIndexedDB(STORES.UNFOLLOWERS);
    const { saveItem: saveConfig } = useIndexedDB(STORES.CONFIG);
    const { saveItem: saveProfile, clearAll: clearProfiles } = useIndexedDB(STORES.PROFILES);
    const { data: config } = useIndexedDB(STORES.CONFIG);
    const { data: allProfiles = [] } = useIndexedDB(STORES.PROFILES);
    const { data: followers = [] } = useIndexedDB(STORES.FOLLOWERS);
    const { data: unfollowers = [] } = useIndexedDB(STORES.UNFOLLOWERS);

    useEffect(() => {
        // Load config from IndexedDB
        const gistIdConfig = config.find(c => c.key === 'gistId');
        const githubTokenConfig = config.find(c => c.key === 'githubToken');
        const lastUpdateConfig = config.find(c => c.key === 'lastUpdateAt');

        if (gistIdConfig) setGistId(gistIdConfig.value);
        if (githubTokenConfig) setGithubToken(githubTokenConfig.value);
        if (lastUpdateConfig) setLastUpdateAt(lastUpdateConfig.value);
    }, [config]);

    useEffect(() => {
        // Save config to IndexedDB
        if (gistId) saveConfig({ key: 'gistId', value: gistId, id: 'gistId' });
        if (githubToken) saveConfig({ key: 'githubToken', value: githubToken, id: 'githubToken' });
    }, [gistId, githubToken, saveConfig]);

    const handleFetchGist = async () => {
        try {
            const followingsProfile = await fetchGist(gistId, githubToken, 'followings.json');
            const followersProfile = await fetchGist(gistId, githubToken, 'followers.json');
            const allProfilesData = await fetchGist(gistId, githubToken, 'allProfiles.json');
            const unfollowerProfiles = await fetchGist(gistId, githubToken, 'unfollowers.json');
            const followbackProfiles = await fetchGist(gistId, githubToken, 'followbacks.json');
            const mutualProfiles = await fetchGist(gistId, githubToken, 'mutuals.json');

            // Save all profiles to IndexedDB
            await Promise.all([
                ...followingsProfile.map(p => saveProfile(p)),
                ...followersProfile.map(p => saveProfile(p)),
                ...allProfilesData.map(p => saveProfile(p)),
                ...unfollowerProfiles.map(p => saveProfile(p)),
                ...followbackProfiles.map(p => saveProfile(p)),
                ...mutualProfiles.map(p => saveProfile(p))
            ]);

            notification.success({
                message: 'Gist data fetched successfully',
                description: 'All profile data has been imported'
            });
        } catch (error) {
            notification.error({
                message: 'Failed to fetch Gist',
                description: error.message
            });
        }
    };

    const handleUpdateGist = async () => {
        try {
            // Prepare data for Gist using the data from hooks
            const gistData = {
                'followers.json': JSON.stringify(followers),
                'followings.json': JSON.stringify(allProfiles.filter(p => !followers.find(f => f.id === p.id))),
                'allProfiles.json': JSON.stringify(allProfiles),
                'unfollowers.json': JSON.stringify(unfollowers)
            };

            // Execute all updates in parallel
            await Promise.all(
                Object.entries(gistData).map(([filename, content]) =>
                    updateGist(gistId, githubToken, filename, content)
                )
            );

            notification.success({
                message: 'Gist updated successfully',
                description: 'All profile data has been synced to GitHub Gist'
            });
        } catch (error) {
            notification.error({
                message: 'Failed to update Gist',
                description: error.message
            });
        }
    };

    const recomputeData = async allProfiles => {
        try {
            // Clear existing data
            await clearFollowers();
            await clearUnfollowers();

            // Get follower and following usernames from profiles
            const followerUsernames = allProfiles
                .filter(p => p.type === 'follower')
                .map(p => p.username);
            const followingUsernames = allProfiles
                .filter(p => p.type === 'following')
                .map(p => p.username);

            // Call WASM module for heavy computations
            const result = await window.processProfiles(
                JSON.stringify(allProfiles),
                JSON.stringify(followerUsernames),
                JSON.stringify(followingUsernames)
            );

            // Parse the result
            const processedData = JSON.parse(result);

            // Check for errors
            if (processedData.error) {
                throw new Error(processedData.error);
            }

            // Save processed data to IndexedDB
            await Promise.all([
                ...processedData.followerProfiles.map(p => saveFollower(p)),
                ...processedData.unfollowerProfiles.map(p => saveUnfollower(p))
            ]);

            // Update last update timestamp
            const timestamp = Date.now();
            await saveConfig({ key: 'lastUpdateAt', value: timestamp, id: 'lastUpdateAt' });
            setLastUpdateAt(timestamp);

            // Clear uploaded files tracking
            setUploadedFiles(new Set());

            // Redirect after processing is complete
            setTimeout(() => {
                window.location.href = '../';
            }, 1000);
            notification.info({
                message: 'Redirecting to home page in 1 second',
            });
        } catch (error) {
            notification.error({
                message: 'Failed to process profiles',
                description: error.message
            });
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
            const result = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (evt) => resolve(evt.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file, 'UTF-8');
            });

            const parsedResult = JSON.parse(result);
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

            notification.success({
                message: `File ${file.name} processed`,
                description: `${profiles.length} profiles updated!`,
            });

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

            return false; // Prevent default upload
        } catch (error) {
            notification.error({
                message: 'Error processing file',
                description: error.message
            });
            return false;
        }
    };

    return (
        <div>
            <div>
                {lastUpdateAt ? (
                    <div>Last update at {new Date(lastUpdateAt).toString()}</div>
                ) : (
                    <div>Upload your followers and following data to get started!</div>
                )}
            </div>
            <div>
                <Divider orientation="left">Upload Data</Divider>
                <Space direction="vertical" size="middle" style={{display: 'flex'}}>
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
            <div>
                <Divider orientation="left">Gist Credentials</Divider>
                <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                    <div>
                        <label>Gist ID:</label>
                        <Input
                            placeholder="Enter Gist ID"
                            value={gistId}
                            onChange={(e) => setGistId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>GitHub Token:</label>
                        <Input
                            placeholder="Enter GitHub Token"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '20px',
                    }}>
                        <Button style={{margin: '0 10px'}} type="primary" onClick={handleUpdateGist}>
                            Update Gist
                        </Button>
                        <Button style={{margin: '0 10px'}} type="primary" onClick={handleFetchGist}>
                            Fetch Gist
                        </Button>
                    </div>
                </Space>
            </div>
        </div>
    );
};

export default Sync;
