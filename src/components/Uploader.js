import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification} from "antd";

const {Dragger} = Upload;

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
                            switch (file.name) {
                                case "followers.json":
                                    const {relationships_followers: followers} = JSON.parse(result)
                                    localStorage.setItem('followers', JSON.stringify(followers.map(item => {
                                        return item.string_list_data[0].value
                                    })));
                                    notification.success({
                                        message: 'File followers.json valid',
                                        description: 'Followers record updated!',
                                    });
                                    break;
                                case "following.json":
                                    const {relationships_following: following} = JSON.parse(result)
                                    localStorage.setItem('following', JSON.stringify(following.map(item => {
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

                            const storedAllProfiles = JSON.parse(localStorage.getItem('allProfiles')) || [];
                            const followers = JSON.parse(localStorage.getItem('followers')) || [];
                            const following = JSON.parse(localStorage.getItem('following')) || [];

                            const followback = followers.filter(username => !following.includes(username))
                            const unfollower = following.filter(username => !followers.includes(username))
                            const mutual = following.filter(username => followers.includes(username))

                            let allProfiles = [...followers, ...following, storedAllProfiles];
                            allProfiles = allProfiles.filter((item, index) => allProfiles.indexOf(item) === index);

                            localStorage.setItem('followback', JSON.stringify(followback));
                            localStorage.setItem('unfollower', JSON.stringify(unfollower));
                            localStorage.setItem('mutual', JSON.stringify(mutual));
                            localStorage.setItem('allProfiles', JSON.stringify(allProfiles));

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
            <p className="ant-upload-text">Drop followers and following json file here</p>
        </Dragger>
        {/* todo put a copy to ask the user to download data from instagram backup download request */}
        {/* Please, download the data backup first, okay? */}
    </div>
);

export default Uploader;
