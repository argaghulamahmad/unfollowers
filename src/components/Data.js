import {useEffect, useState} from "react";
import {BackTop, Card, Divider, List, Select, Space} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Data = () => {
    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState('unfollowers');
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [followback, setFollowback] = useState([]);
    const [unfollower, setUnfollower] = useState([]);
    const [mutual, setMutual] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);

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
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))

        setUnfollower(JSON.parse(localStorage.getItem('unfollower')))
        setFollowback(JSON.parse(localStorage.getItem('followback')))
        setMutual(JSON.parse(localStorage.getItem('mutual')))
        setAllProfiles(JSON.parse(localStorage.getItem('allProfiles')));

        switch (typeOfDataThatAsk) {
            case "unfollowers":
                setProfiles(unfollower)
                break;
            case "followbacks":
                setProfiles(followback)
                break;
            case "mutual":
                setProfiles(mutual)
                break;
            case "allProfiles":
                setProfiles(allProfiles)
                break;
            default:
                console.error()
        }
    }, [typeOfDataThatAsk, unfollower, followback, mutual, allProfiles]);


    return (
        profiles ? <div>
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
                    <Option value="allProfiles">All Profiles</Option>
                </Select>
            </Space>

            <Card>
                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        {typeOfDataThatAskSelectMap[typeOfDataThatAsk]}
                    </Divider>
                </div>
                <Text type="secondary" style={{paddingLeft: "5%"}} level={5}>Number
                    of {typeOfDataThatAskSelectMap[typeOfDataThatAsk]} is {profiles.length}. {(profiles.length/mutual.length).toFixed(2)}</Text>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
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
        </div> : <Uploader/>
    );
}

export default Data;