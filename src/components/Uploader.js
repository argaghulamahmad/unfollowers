import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification, Button, Divider, Space, List, Card, Collapse} from "antd";
import {acceptedUploadedFilenames, followersJsonFileName, followingJsonFileName} from "../consts";

const {Dragger} = Upload;
const {Panel} = Collapse;

class Profile {
    constructor(username, connectedAt) {
        this.username = username;
        this.connectedAt = connectedAt;
    }
}

const Uploader = () => (
    <div>
        <div>
            {
                localStorage.getItem('lastUpdateAt') ? (
                    <div>
                        Last update at {localStorage.getItem('lastUpdateAt')}
                    </div>
                ) : (
                    <div>
                        Upload your followers and following data to get started!
                    </div>
                )
            }
        </div>
        <div>
            <Divider orientation="left">Upload Data</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>

                <Button type="primary" style={{width: '100%'}} onClick={() => {
                    window.open('https://www.instagram.com/download/request/');
                }}>Ask for backup data here</Button>

                <Button type="secondary" style={{width: '100%', whiteSpace: "normal", height: 'auto'}} onClick={() => {
                    window.open('https://mail.google.com/mail/u/0/#inbox');
                }}>Download backup data from email that instagram sent to your instagram account's email</Button>

                <Dragger {...{
                    name: 'file',
                    multiple: true,

                    onDrop(e) {
                        Array.from(e.dataTransfer.files).forEach(file => {
                            const reader = new FileReader();
                            reader.readAsText(file, "UTF-8");
                            if (acceptedUploadedFilenames.includes(file.name)) {
                                reader.onload = evt => {
                                    let result = evt.target.result;

                                    const storedAllProfiles = JSON.parse(localStorage.getItem('allProfiles')) || [];
                                    let allProfiles = []
                                    allProfiles = allProfiles.concat(storedAllProfiles)

                                    switch (file.name) {
                                        case followersJsonFileName:
                                            const {relationships_followers: followersJsonParsedResult} = JSON.parse(result)

                                            let followerProfiles = followersJsonParsedResult.map(item => {
                                                let data = item.string_list_data[0];
                                                let {value: username} = data;
                                                let {timestamp: connectedAt} = data;
                                                return new Profile(username, connectedAt)
                                            });
                                            localStorage.setItem('followerProfiles', JSON.stringify(followerProfiles));

                                            allProfiles = allProfiles.concat(followerProfiles);

                                            localStorage.setItem('followerUsernames', JSON.stringify(followersJsonParsedResult.map(item => {
                                                return item.string_list_data[0].value
                                            })));

                                            notification.success({
                                                message: 'File followers.json valid',
                                                description: 'Followers record updated!',
                                            });
                                            break;
                                        case followingJsonFileName:
                                            const {relationships_following: followingJsonParsedResult} = JSON.parse(result)

                                            let followingProfiles = followingJsonParsedResult.map(item => {
                                                let data = item.string_list_data[0];
                                                let {value: username} = data;
                                                let {timestamp: connectedAt} = data;
                                                return new Profile(username, connectedAt)
                                            });
                                            localStorage.setItem('followingProfiles', JSON.stringify(followingProfiles));

                                            allProfiles = allProfiles.concat(followingProfiles);

                                            localStorage.setItem('followingUsernames', JSON.stringify(followingJsonParsedResult.map(item => {
                                                return item.string_list_data[0].value
                                            })));

                                            notification.success({
                                                message: 'File following.json valid',
                                                description: 'Following record updated!',
                                            });
                                            break;
                                        default:
                                            notification.error({
                                                message: 'Not valid json file',
                                            });
                                    }

                                    const allProfilesMap = allProfiles.reduce((map, profile) => {
                                        map.set(profile.username, profile);
                                        return map;
                                    }, new Map());

                                    const allProfilesArray = Array.from(allProfilesMap.values());
                                    allProfilesArray.sort((a, b) => {
                                        return a.connectedAt - b.connectedAt;
                                    });

                                    localStorage.setItem('allProfiles', JSON.stringify(allProfilesArray));

                                    const followerUsernames = JSON.parse(localStorage.getItem('followerUsernames')) || [];
                                    const followingUsernames = JSON.parse(localStorage.getItem('followingUsernames')) || [];

                                    const followbackUsernames = followerUsernames.filter(username => !followingUsernames.includes(username))
                                    localStorage.setItem('followbackUsernames', JSON.stringify(followbackUsernames));

                                    const unfollowerUsernames = followingUsernames.filter(username => !followerUsernames.includes(username))
                                    localStorage.setItem('unfollowerUsernames', JSON.stringify(unfollowerUsernames));

                                    const mutualUsernames = followingUsernames.filter(username => followerUsernames.includes(username))
                                    localStorage.setItem('mutualUsernames', JSON.stringify(mutualUsernames));

                                    const followbackProfiles = followbackUsernames.map(username => {
                                        const profile = allProfilesMap.get(username);
                                        return new Profile(username, profile.connectedAt)
                                    })
                                    localStorage.setItem('followbackProfiles', JSON.stringify(followbackProfiles));

                                    const unfollowbackProfiles = unfollowerUsernames.map(username => {
                                        const profile = allProfilesMap.get(username);
                                        return new Profile(username, profile.connectedAt)
                                    })
                                    localStorage.setItem('unfollowerProfiles', JSON.stringify(unfollowbackProfiles));

                                    const mutualProfiles = mutualUsernames.map(username => {
                                        const profile = allProfilesMap.get(username);
                                        return new Profile(username, profile.connectedAt)
                                    })
                                    localStorage.setItem('mutualProfiles', JSON.stringify(mutualProfiles));

                                    localStorage.setItem('lastUpdateAt', (new Date()).toDateString())
                                }
                                reader.onerror = () => {
                                    notification.error({
                                        message: 'Not valid json file',
                                    });
                                }
                            } else {
                                notification.error({
                                    message: 'Please drop following and followers json file',
                                });
                            }
                        });
                    },
                }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Drop followers and following json file here.</p>
                </Dragger>
            </Space>
        </div>
        <div>
            <Divider orientation="left">Current Data</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Collapse defaultActiveKey={['1']}>
                    <Panel header="Local storage keys" key="1">
                        <List>
                            {
                                Object.entries(localStorage).map(([key]) => {
                                    return (
                                        <List.Item>
                                            {key}
                                        </List.Item>
                                    )
                                })
                            }
                        </List>
                    </Panel>
                </Collapse>
            </Space>
        </div>
    </div>
);

export default Uploader;
