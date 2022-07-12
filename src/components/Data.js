import {useEffect, useState} from "react";
import {BackTop, Card, Divider, List, Select, Space} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Data = () => {
    const defaultTypeOfDataThatAsked = "unfollowers";

    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState(defaultTypeOfDataThatAsked);

    const [lastUpdateAt, setLastUpdateAt] = useState("");

    const [profiles, setProfiles] = useState([]);

    const {Option} = Select;

    const typeOfDataThatAskSelectMap = {
        unfollowers: 'Unfollowers',
        followbacks: 'Followbacks',
        mutual: 'Mutuals',
        allProfiles: 'All profiles',
    }

    const handleTypeOfDataThatAskChangeEvent = (value) => {
        setTypeOfDataThatAsk(value)
    }

    const getPercentOfProfilesOfMutual = () => {
        let mutual = JSON.parse(localStorage.getItem('mutualUsernames')) || [];

        let percentOfProfilesWithMutual = (profiles.length / mutual.length).toFixed(5);
        return `${percentOfProfilesWithMutual}%`;
    }

    const getDifferenceBetweenFollowerAndFollowing = () => {
        let followersProfiles = JSON.parse(localStorage.getItem('followerUsernames'));
        let followingProfiles = JSON.parse(localStorage.getItem('followingUsernames'));

        let profilesDifference = followersProfiles.filter(username => !followingProfiles.includes(username));
        return profilesDifference.length;
    }

    useEffect(() => {
        const renderUnfollowerDataAtInit = () => {
            setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
            let unfollowerProfiles = JSON.parse(localStorage.getItem('unfollowerProfiles'));
            setProfiles(unfollowerProfiles)
        };

        renderUnfollowerDataAtInit();
    }, []);

    useEffect(() => {
        const setProfilesByTypeOfDataThatAsk = () => {
            let unfollowerProfiles = JSON.parse(localStorage.getItem('unfollowerProfiles'));
            let followbackProfiles = JSON.parse(localStorage.getItem('followbackProfiles'));
            let mutualProfiles = JSON.parse(localStorage.getItem('mutualProfiles'));
            let allProfiles = JSON.parse(localStorage.getItem('allProfiles'));

            switch (typeOfDataThatAsk) {
                case "unfollowers":
                    setProfiles(unfollowerProfiles)
                    break;
                case "followbacks":
                    setProfiles(followbackProfiles)
                    break;
                case "mutual":
                    setProfiles(mutualProfiles)
                    break;
                case "allProfiles":
                    setProfiles(allProfiles)
                    break;
                default:
                    console.error()
            }
        };

        setProfilesByTypeOfDataThatAsk();
    }, [typeOfDataThatAsk]);


    return (
        profiles && profiles.length > 0 ? <div>
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
                <Text>
                    Number of diff between follower and following: {getDifferenceBetweenFollowerAndFollowing()}
                </Text>

                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        {typeOfDataThatAskSelectMap[typeOfDataThatAsk]}
                    </Divider>
                </div>
                <Text type="secondary" style={{paddingLeft: "5%"}} level={5}>Number
                    of {typeOfDataThatAskSelectMap[typeOfDataThatAsk]} is {profiles.length}. {
                        typeOfDataThatAsk === "unfollowers" ? `${getPercentOfProfilesOfMutual()} unfolllow of mutual.` : ""
                    }</Text>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                <List style={{padding: "0 5% 0 5%"}} dataSource={profiles}
                      renderItem={profile => (
                          <List.Item>
                              <List.Item.Meta
                                  title={<a href={`https://instagram.com/${profile.username}`} rel="noreferrer nofollow"
                                            target="_blank">{profile.username}</a>}
                              />
                          </List.Item>
                      )}/>
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Data;