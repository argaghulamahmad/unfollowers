import {useEffect, useState} from "react";
import {BackTop, Button, Card, Col, Divider, List, notification, Row, Select, Space} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {typeOfDataThatAskSelectMap} from "../consts";

const Data = () => {
    const defaultTypeOfDataThatAsked = "unfollowers";

    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState(defaultTypeOfDataThatAsked);

    const [lastUpdateAt, setLastUpdateAt] = useState("");

    const [profiles, setProfiles] = useState([]);

    const {Option} = Select;

    const handleTypeOfDataThatAskChangeEvent = (value) => {
        setTypeOfDataThatAsk(value)
        notification.success({
            message: 'Success',
            description: `${profiles.length} profiles loaded!`,
        })
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

    const epochToDateTime = (epoch) => {
        let date = new Date(epoch * 1000);
        return date.toDateString();
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

    const homeTitleWordingMap = {
        "unfollowers": "unfollow you",
        "followbacks": "follow you back",
        "mutual": "mutual with you",
    }

    return (
        profiles && profiles.length > 0 ? <div>
            <div>
                {homeTitleWordingMap[typeOfDataThatAsk] ?
                    <div>
                        See all {profiles.length} profiles that {homeTitleWordingMap[typeOfDataThatAsk]}!
                    </div> : <div>See all profiles that stored into the app.</div>
                }
            </div>

            <Divider orientation="left">Stats</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card hoverable title="Unfollowers" bordered={true}>
                            {JSON.parse(localStorage.getItem('unfollowerProfiles')).length} profiles
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card hoverable title="Mutuals" bordered={true}>
                            {JSON.parse(localStorage.getItem('mutualProfiles')).length} profiles
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card hoverable title="Followbacks" bordered={true}>
                            {JSON.parse(localStorage.getItem('unfollowerProfiles')).length} profiles
                        </Card>
                    </Col>
                </Row>
                <Card hoverable={true} style={{width: '100%'}}>
                    {getDifferenceBetweenFollowerAndFollowing()} profiles in follower that not in following
                </Card>
            </Space>

            <Divider orientation="left">Profiles</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Button type="primary"
                        style={{width: '100%'}}
                        onClick={() => {
                            let randomUsernames = [];

                            let visitedRandomUsernames = JSON.parse(localStorage.getItem('visitedRandomUsernames')) || [];
                            let unvisitedRandomProfiles = profiles.filter(profile => !visitedRandomUsernames.includes(profile.username));
                            let unvisitedRandomProfileUsernames = unvisitedRandomProfiles.map(profile => profile.username);
                            let uniqueUnvisitedRandomProfileUsernames = [...new Set(unvisitedRandomProfileUsernames)];

                            let feelLuckyGeneratorCounts = JSON.parse(localStorage.getItem('config'))?.feelLuckyGeneratorCounts || 5;
                            for (let i = 0; i < feelLuckyGeneratorCounts; i++) {
                                if (uniqueUnvisitedRandomProfileUsernames.length > 0) {
                                    let randomProfileUsername = uniqueUnvisitedRandomProfileUsernames.splice(Math.floor(Math.random() * uniqueUnvisitedRandomProfileUsernames.length), 1)[0];
                                    randomUsernames.push(randomProfileUsername);
                                }
                            }

                            if (randomUsernames.length > 0) {
                                notification.success({
                                    message: 'Success',
                                    description: `${randomUsernames.length} ${typeOfDataThatAsk} profiles loaded!`,
                                })
                            } else {
                                notification.info({
                                    message: 'There is no more profiles to load!',
                                    description: `There is no more ${typeOfDataThatAsk} profiles to load! Reset data to load random profiles again.`,
                                })
                            }

                            visitedRandomUsernames = visitedRandomUsernames.concat(randomUsernames);
                            localStorage.setItem('visitedRandomUsernames', JSON.stringify(visitedRandomUsernames));

                            randomUsernames.forEach(username => {
                                window.open(`https://www.instagram.com/${username}`, '_blank');
                            })
                        }}>I feel lucky</Button>

                <Select
                    showSearch
                    placeholder="Find"
                    optionFilterProp="children"
                    defaultValue={typeOfDataThatAsk}
                    onChange={handleTypeOfDataThatAskChangeEvent}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    style={{width: '100%'}}
                >
                    <Option value="unfollowers">Unfollowers</Option>
                    <Option value="followbacks">Followbacks</Option>
                    <Option value="mutual">Mutuals</Option>
                    <Option value="allProfiles">All Profiles</Option>
                </Select>

                <Card>
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
                          pagination={{
                              pageSize: 10,
                          }}
                          renderItem={profile => (
                              <List.Item>
                                  <List.Item.Meta
                                      title={<a href={`https://instagram.com/${profile.username}`}
                                                rel="noreferrer nofollow"
                                                target="_blank">{profile.username}</a>}
                                      description={epochToDateTime(profile.connectedAt)}
                                  />
                              </List.Item>
                          )}/>
                </Card>
            </Space>
            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Data;