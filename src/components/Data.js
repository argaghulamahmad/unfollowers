import {useEffect, useState} from "react";
import {BackTop, Button, Card, Col, Divider, List, notification, Row, Select, Space} from "antd";
import Uploader from "./Uploader";
import {typeOfDataThatAskSelectMap} from "../consts";
import {Option} from "antd/es/mentions";

const Data = () => {
    const defaultTypeOfDataThatAsked = localStorage.getItem("typeOfDataThatAsked") || "unfollowers";

    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState(defaultTypeOfDataThatAsked);

    const [profiles, setProfiles] = useState([]);

    const [sortConfig, setSortConfig] = useState({
        key: 'connectedAt',
        direction: 'desc',
    });

    const sortProfiles = (profiles, sortConfig) => {
        const {key, direction} = sortConfig;

        if (key === 'connectedAt') {
            return [...profiles].sort((a, b) => {
                if (direction === 'asc') {
                    return new Date(a.connectedAt) - new Date(b.connectedAt);
                } else if (direction === 'desc') {
                    return new Date(b.connectedAt) - new Date(a.connectedAt);
                }
            });
        } else if (key === 'username') {
            return [...profiles].sort((a, b) => {
                if (direction === 'asc') {
                    return a.username.localeCompare(b.username);
                } else if (direction === 'desc') {
                    return b.username.localeCompare(a.username);
                }
            });
        }
    }

    const handleTypeOfDataThatAskChangeEvent = (value) => {
        localStorage.setItem("typeOfDataThatAsked", value);
        setTypeOfDataThatAsk(value)

        let localStorageKey = `${value.replace("Profiles", "")}ProfilesTotal`;
        let description = "You have selected " + typeOfDataThatAskSelectMap[value] + " to be shown. There are " + localStorage.getItem(localStorageKey) + " " + typeOfDataThatAskSelectMap[value] + " in total.";

        notification.success({
            message: 'Success', description: description,
        })
    }

    const epochToDateTime = (epoch) => {
        let date = new Date(epoch * 1000);
        return date.toDateString();
    }

    useEffect(() => {
        setSortConfig({
            key: 'connectedAt',
            direction: 'desc',
        })

        const renderUnfollowerDataAtInit = () => {
            let unfollowerProfiles = JSON.parse(localStorage.getItem('unfollowerProfiles'));
            unfollowerProfiles = sortProfiles(unfollowerProfiles, sortConfig);
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
                    setProfiles(sortProfiles(unfollowerProfiles, sortConfig));
                    break;
                case "followbacks":
                    setProfiles(sortProfiles(followbackProfiles, sortConfig));
                    break;
                case "mutual":
                    setProfiles(sortProfiles(mutualProfiles, sortConfig));
                    break;
                case "allProfiles":
                    setProfiles(sortProfiles(allProfiles, sortConfig));
                    break;
                default:
                    console.error()
            }
        };

        setProfilesByTypeOfDataThatAsk();
    }, [typeOfDataThatAsk]);

    const homeTitleWordingMap = {
        "unfollowers": "unfollow you", "followbacks": "follow you back", "mutual": "mutual with you",
    }

    return (profiles && profiles.length > 0 ? <div>
        <div>
            {homeTitleWordingMap[typeOfDataThatAsk] ? <div>
                See all {profiles.length} profiles that {homeTitleWordingMap[typeOfDataThatAsk]}!
            </div> : <div>See all profiles that stored into the app.</div>}
        </div>

        <Divider orientation="left">Profiles</Divider>
        <Space direction="vertical" size="middle" style={{display: 'flex'}}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card hoverable title="Unfollowers" bordered={true} onClick={() => {
                        handleTypeOfDataThatAskChangeEvent("unfollowers")
                    }}
                          style={{
                              boxShadow: typeOfDataThatAsk === "unfollowers" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                          }}
                    >
                        {JSON.parse(localStorage.getItem('unfollowerProfiles')).length} profiles
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable title="Mutuals" bordered={true} onClick={() => {
                        handleTypeOfDataThatAskChangeEvent("mutual")
                    }}
                          style={{
                              boxShadow: typeOfDataThatAsk === "mutual" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                          }}
                    >
                        {JSON.parse(localStorage.getItem('mutualProfiles')).length} profiles
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable title="Followbacks" bordered={true} onClick={() => {
                        handleTypeOfDataThatAskChangeEvent("followbacks")
                    }}
                          style={{
                              boxShadow: typeOfDataThatAsk === "followbacks" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                          }}
                    >
                        {JSON.parse(localStorage.getItem('followbackProfiles')).length} profiles
                    </Card>
                </Col>
            </Row>

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
                                description: `There is no more ${typeOfDataThatAsk} profiles to load! Reset feel lucky generator data to load random profiles again.`,
                            })
                        }

                        visitedRandomUsernames = visitedRandomUsernames.concat(randomUsernames);
                        localStorage.setItem('visitedRandomUsernames', JSON.stringify(visitedRandomUsernames));

                        randomUsernames.forEach(username => {
                            window.open(`https://www.instagram.com/${username}`, '_blank');
                        })
                    }}>I feel lucky</Button>


            <Card>
                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        {typeOfDataThatAskSelectMap[typeOfDataThatAsk]}
                    </Divider>
                </div>
                <Space direction="vertical" size="middle">
                </Space>
                <div style={{
                    textAlign: 'right',
                }}>
                    <Space direction="horizontal" size="small">
                        sort by:
                        <Select defaultValue="connectedAt" onChange={(value) => {

                        }}>
                            <Option value="username">Username</Option>
                            <Option value="connectedAt">Connected At</Option>
                        </Select>
                        <Select defaultValue="desc" onChange={(value) => {
                            console.log(value)
                        }}>
                            <Option value="asc">Ascending</Option>
                            <Option value="desc">Descending</Option>
                        </Select>
                    </Space>
                </div>
                <List style={{padding: "0 5% 0 5%"}} dataSource={profiles}
                      pagination={{
                          pageSize: 10,
                      }}
                      renderItem={profile => (<List.Item>
                          <List.Item.Meta
                              title={<a href={`https://instagram.com/${profile.username}`}
                                        rel="noreferrer nofollow"
                                        target="_blank">{profile.username}</a>}
                              description={epochToDateTime(profile.connectedAt)}
                          />
                      </List.Item>)}/>
            </Card>
        </Space>
        <BackTop/>
    </div> : <Uploader/>);
}

export default Data;