import {InboxOutlined} from '@ant-design/icons';
import {useEffect, useState} from "react";
import {BackTop, Card, Divider, Input, List, notification, Select, Space, Upload} from "antd";
import Text from "antd/es/typography/Text";

const {Dragger} = Upload;

function Data() {
    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState('unfollowers');
    const [profiles, setProfiles] = useState([]);

    const {Option} = Select;

    const typeOfDataThatAskSelectMap = {
        unfollowers: 'Unfollowers',
        followbacks: 'Followbacks',
        mutual: 'Mutuals',
    }

    const handleTypeOfDataThatAskChangeEvent = (value) => {
        setTypeOfDataThatAsk(value)
    }

    useEffect(() => {
        console.log("")
        switch (typeOfDataThatAsk) {
            case "unfollowers":
                setProfiles(JSON.parse(localStorage.getItem('unfollower')))
                break;
            case "followbacks":
                setProfiles(JSON.parse(localStorage.getItem('followback')))
                break;
            case "mutual":
                setProfiles(JSON.parse(localStorage.getItem('mutual')))
                break;
            default:
                // code block
                console.error()
        }
    }, [typeOfDataThatAsk]);


    return (
        <div>
            <Space size={8} direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
                <Select
                    showSearch
                    placeholder="Find"
                    optionFilterProp="children"
                    defaultValue={typeOfDataThatAsk}
                    onChange={handleTypeOfDataThatAskChangeEvent}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Option value="unfollowers">Unfollowers</Option>
                    <Option value="followbacks">Followbacks</Option>
                    <Option value="mutual">Mutuals</Option>
                </Select>
            </Space>

            <Card>
                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        {typeOfDataThatAskSelectMap[typeOfDataThatAsk]}
                    </Divider>
                </div>
                <Text type="secondary" style={{paddingLeft: "5%"}} level={5}>Number
                    of {typeOfDataThatAskSelectMap[typeOfDataThatAsk]} is {profiles.length}</Text>
                <List style={{padding: "0 5% 0 5%"}} dataSource={profiles}
                      renderItem={username => (
                          <List.Item>
                              <List.Item.Meta
                                  title={<a href={`https://instagram.com/${username}`} rel="noreferrer nofollow"
                                            target="_blank">{username}</a>}
                              />
                          </List.Item>
                      )}/>
            </Card>

            <BackTop/>
        </div>
    );
}

const App = () => (
    <div>
        <Dragger {...{
            name: 'file',
            multiple: true,

            onDrop(e) {
                Array.from(e.dataTransfer.files).forEach(file => {
                    console.log(file)

                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");

                    if (file.name === "followers.json" || file.name === "following.json") {
                        reader.onload = function (evt) {
                            let result = evt.target.result;
                            switch (file.name) {
                                case "followers.json":
                                    // code block
                                    const {relationships_followers: followers} = JSON.parse(result)
                                    localStorage.setItem('followers', JSON.stringify(followers.map(item => {
                                        return item.string_list_data[0].value
                                    })));
                                    break;
                                case "following.json":
                                    // code block
                                    const {relationships_following: following} = JSON.parse(result)
                                    localStorage.setItem('following', JSON.stringify(following.map(item => {
                                        return item.string_list_data[0].value
                                    })));
                                    break;
                                default:
                                    // code block
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
        <Data/>
    </div>
);

export default App;
