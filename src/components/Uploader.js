import {InboxOutlined} from '@ant-design/icons';
import {Upload} from "antd";

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
                                    break;
                                case "following.json":
                                    const {relationships_following: following} = JSON.parse(result)
                                    localStorage.setItem('following', JSON.stringify(following.map(item => {
                                        return item.string_list_data[0].value
                                    })));
                                    break;
                                default:
                                    console.error()
                            }
                            const followers = JSON.parse(localStorage.getItem('followers'));
                            const following = JSON.parse(localStorage.getItem('following'));

                            const followback = followers.filter(username => !following.includes(username))
                            const unfollower = following.filter(username => !followers.includes(username))
                            const mutual = following.filter(username => followers.includes(username))

                            localStorage.setItem('followback', JSON.stringify(followback));
                            localStorage.setItem('unfollower', JSON.stringify(unfollower));
                            localStorage.setItem('mutual', JSON.stringify(mutual));
                        }
                        reader.onerror = function (evt) {
                            console.error()
                        }
                    } else {
                        console.error()
                    }
                });
            },
        }}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                band files
            </p>
        </Dragger>
    </div>
);

export default Uploader;
