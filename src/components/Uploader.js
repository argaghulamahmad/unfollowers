import React, {useEffect, useState} from 'react';
import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification, Button, Divider, Space, List, Collapse, Empty, Input} from 'antd';
import {
    acceptedUploadedFilenames,
    followersJsonFileName,
    followingJsonFileName,
} from '../consts';
import {fetchGist, updateGist} from "../utils/githubUtils";

const {Dragger} = Upload;
const {Panel} = Collapse;

class Profile {
    constructor(username, connectedAt) {
        this.username = username;
        this.connectedAt = connectedAt;
    }
}

const Uploader = () => {
    const [gistId, setGistId] = useState(localStorage.getItem('gistId'));
    const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken'));
    const [lastUpdateAt, setLastUpdateAt] = useState(
        JSON.parse(localStorage.getItem('lastUpdateAt'))
    );

    useEffect(() => {
        localStorage.setItem('gistId', gistId);
        localStorage.setItem('githubToken', githubToken);
    }, [gistId, githubToken]);

    const handleFetchGist = () => {
        const followingsProfile = fetchGist(gistId, githubToken, 'followings.json');
        const followersProfile = fetchGist(gistId, githubToken, 'followers.json');
        localStorage.setItem('followingsProfile', JSON.stringify(followingsProfile));
        localStorage.setItem('followersProfile', JSON.stringify(followersProfile));
    };

    const handleUpdateGist = () => {
        const followerProfiles = localStorage.getItem('followerProfiles');
        const followingProfiles = localStorage.getItem('followingProfiles');
        updateGist(gistId, githubToken, 'followings.json', followerProfiles);
        updateGist(gistId, githubToken, 'followings.json', followingProfiles);
    };


    const recomputeData = allProfiles => {
        const allProfilesMap = allProfiles.reduce((map, profile) => {
            map.set(profile.username, profile);
            return map;
        }, new Map());

        const allProfilesArray = Array.from(allProfilesMap.values());
        allProfilesArray.sort((a, b) => a.connectedAt - b.connectedAt);

        localStorage.setItem('allProfiles', JSON.stringify(allProfilesArray));
        localStorage.setItem('allProfilesTotal', allProfilesArray.length);

        const followerUsernames = JSON.parse(localStorage.getItem('followerUsernames')) || [];
        const followingUsernames = JSON.parse(localStorage.getItem('followingUsernames')) || [];

        const followbackUsernames = followerUsernames.filter(
            (username) => !followingUsernames.includes(username)
        );
        localStorage.setItem('followbackUsernames', JSON.stringify(followbackUsernames));

        const unfollowerUsernames = followingUsernames.filter(
            (username) => !followerUsernames.includes(username)
        );
        localStorage.setItem('unfollowerUsernames', JSON.stringify(unfollowerUsernames));

        const mutualUsernames = followingUsernames.filter((username) =>
            followerUsernames.includes(username)
        );
        localStorage.setItem('mutualUsernames', JSON.stringify(mutualUsernames));

        const followbackProfiles = followbackUsernames.map((username) => {
            const profile = allProfilesMap.get(username);
            return new Profile(username, profile.connectedAt);
        });
        localStorage.setItem('followbackProfiles', JSON.stringify(followbackProfiles));
        localStorage.setItem('followbacksProfilesTotal', followbackProfiles.length);

        const unfollowbackProfiles = unfollowerUsernames.map((username) => {
            const profile = allProfilesMap.get(username);
            return new Profile(username, profile.connectedAt);
        });
        localStorage.setItem('unfollowerProfiles', JSON.stringify(unfollowbackProfiles));
        localStorage.setItem('unfollowersProfilesTotal', unfollowbackProfiles.length);

        const mutualProfiles = mutualUsernames.map((username) => {
            const profile = allProfilesMap.get(username);
            return new Profile(username, profile.connectedAt);
        });
        localStorage.setItem('mutualProfiles', JSON.stringify(mutualProfiles));
        localStorage.setItem('mutualProfilesTotal', mutualProfiles.length);

        const currentTime = new Date().getTime();
        setLastUpdateAt(currentTime);
        localStorage.setItem('lastUpdateAt', JSON.stringify(currentTime));

        setTimeout(() => {
            window.location.href = '../';
        }, 1000);
        notification.info({
            message: 'Redirecting to home page in 1 second',
        });
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    };

    const buttonStyle = {
        margin: '0 10px 0 10px',
    };

    const handleUpload = (file) => {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        if (acceptedUploadedFilenames.includes(file.name)) {
            reader.onload = (evt) => {
                const result = evt.target.result;
                const storedAllProfiles = JSON.parse(localStorage.getItem('allProfiles')) || [];
                const allProfiles = [...storedAllProfiles];

                switch (file.name) {
                    case followersJsonFileName:
                        const followersJsonParsedResult = JSON.parse(result);
                        const followerProfiles = followersJsonParsedResult.map((item) => {
                            const data = item.string_list_data[0];
                            const {value: username} = data;
                            const {timestamp: connectedAt} = data;
                            return new Profile(username, connectedAt);
                        });

                        localStorage.setItem('followerProfiles', JSON.stringify(followerProfiles));
                        allProfiles.push(...followerProfiles);

                        localStorage.setItem(
                            'followerUsernames',
                            JSON.stringify(
                                followersJsonParsedResult.map((item) => item.string_list_data[0].value)
                            )
                        );

                        notification.success({
                            message: 'File followers.json valid',
                            description: 'Followers record updated!',
                        });
                        break;

                    case followingJsonFileName:
                        const followingJsonParsedResult = JSON.parse(result);
                        const followingProfiles = followingJsonParsedResult.map((item) => {
                            const data = item.string_list_data[0];
                            const {value: username} = data;
                            const {timestamp: connectedAt} = data;
                            return new Profile(username, connectedAt);
                        });

                        localStorage.setItem('followingProfiles', JSON.stringify(followingProfiles));
                        allProfiles.push(...followingProfiles);

                        localStorage.setItem(
                            'followingUsernames',
                            JSON.stringify(
                                followingJsonParsedResult.map((item) => item.string_list_data[0].value)
                            )
                        );

                        notification.success({
                            message: 'File following.json valid',
                            description: 'Following record updated!',
                        });
                        break;

                    default:
                        notification.error({
                            message: 'Not a valid json file',
                        });
                        break;
                }

                recomputeData(allProfiles);
            };

            reader.onerror = () => {
                notification.error({
                    message: 'Not a valid json file',
                });
            };
        } else {
            notification.error({
                message: 'Please drop following and followers json file',
            });
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
                        {...{
                            name: 'file',
                            multiple: true,
                            onDrop: (e) => {
                                Array.from(e.dataTransfer.files).forEach((file) => {
                                    handleUpload(file);
                                });
                            },
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">Drop followers and following json files here.</p>
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
                    <div style={buttonContainerStyle}>
                        <Button style={buttonStyle} type="primary" block onClick={handleUpdateGist}>
                            Update Gist
                        </Button>
                        <Button style={buttonStyle} type="primary" block onClick={handleFetchGist}>
                            Fetch Gist
                        </Button>
                    </div>
                </Space>
            </div>
        </div>
    );
};

export default Uploader;
