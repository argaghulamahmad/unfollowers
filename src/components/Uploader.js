import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification} from "antd";

const {Dragger} = Upload;

class Profile {
    constructor(username, connectedAt) {
        this.username = username;
        this.connectedAt = connectedAt;
    }
}

const Uploader = () => (
    <div>
        <Dragger {...{
            name: 'file',
            multiple: true,

            onDrop(e) {
                Array.from(e.dataTransfer.files).forEach(file => {
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");

                    if (file.name === "followers.json" || file.name === "following.json") {
                        reader.onload = function (evt) {
                            let result = evt.target.result;

                            const storedAllProfiles = JSON.parse(localStorage.getItem('allProfiles')) || [];
                            let allProfiles = []

                            switch (file.name) {
                                case "followers.json":
                                    const {relationships_followers: followersJsonParsedResult} = JSON.parse(result)

                                    let followerProfiles = followersJsonParsedResult.map(item => {
                                        let data = item.string_list_data[0];
                                        let {value: username} = data;
                                        let {timestamp: connectedAt} = data;
                                        return new Profile(username, connectedAt)
                                    });
                                    localStorage.setItem('followerProfiles', JSON.stringify(followerProfiles));

                                    allProfiles = storedAllProfiles.concat(followerProfiles);
                                    allProfiles = allProfiles.filter((item, index) => allProfiles.indexOf(item) === index);
                                    localStorage.setItem('allProfiles', JSON.stringify(allProfiles));

                                    localStorage.setItem('followerUsernames', JSON.stringify(followersJsonParsedResult.map(item => {
                                        return item.string_list_data[0].value
                                    })));

                                    notification.success({
                                        message: 'File followers.json valid',
                                        description: 'Followers record updated!',
                                    });
                                    break;
                                case "following.json":
                                    const {relationships_following: followingJsonParsedResult} = JSON.parse(result)

                                    let followingProfiles = followingJsonParsedResult.map(item => {
                                        let data = item.string_list_data[0];
                                        let {value: username} = data;
                                        let {timestamp: connectedAt} = data;
                                        return new Profile(username, connectedAt)
                                    });
                                    localStorage.setItem('followingProfiles', JSON.stringify(followingProfiles));

                                    allProfiles = storedAllProfiles.concat(followingProfiles);
                                    allProfiles = allProfiles.filter((item, index) => allProfiles.indexOf(item) === index);
                                    localStorage.setItem('allProfiles', JSON.stringify(allProfiles));

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

                            const followerUsernames = JSON.parse(localStorage.getItem('followerUsernames')) || [];
                            const followingUsernames = JSON.parse(localStorage.getItem('followingUsernames')) || [];

                            const followbackUsernames = followerUsernames.filter(username => !followingUsernames.includes(username))
                            const unfollowerUsernames = followingUsernames.filter(username => !followerUsernames.includes(username))
                            const mutualUsernames = followingUsernames.filter(username => followerUsernames.includes(username))

                            localStorage.setItem('followbackUsernames', JSON.stringify(followbackUsernames));
                            localStorage.setItem('unfollowerUsernames', JSON.stringify(unfollowerUsernames));
                            localStorage.setItem('mutualUsernames', JSON.stringify(mutualUsernames));

                            localStorage.setItem('lastUpdateAt', (new Date()).toDateString())
                        }
                        reader.onerror = function (evt) {
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
            <p>Download first <a href="https://www.instagram.com/download/request/">here</a></p>
        </Dragger>
    </div>
);

export default Uploader;
