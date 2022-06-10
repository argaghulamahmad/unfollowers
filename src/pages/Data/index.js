import './index.css';
import React, {useEffect, useState} from 'react';
import {BackTop, Card, Divider, Input, List, notification, Select, Space} from "antd";
import Text from "antd/es/typography/Text";
import useGetProfiles from "../../hooks/useGetProfiles";
import useGetLatestUpdatedAt from "../../hooks/useGetLatestUpdatedAt";
import CanLogout from "../../helpers/CanLogout";
import {useKeycloak} from "@react-keycloak/web";


function Home() {
    const {keycloak} = useKeycloak();
    let preferredUsername = keycloak.idTokenParsed.preferred_username;

    const [profiles, setProfiles] = useState([]);
    const [latestUpdatedAt, setLatestUpdatedAt] = useState("");
    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState('unfollowers');
    const [username, setUsername] = useState(preferredUsername)

    const {Option} = Select;

    const typeOfDataThatAskSelectMap = {
        unfollowers: 'Unfollowers',
        followbacks: 'Followbacks',
        mutual: 'Mutuals',
    }

    const quoteTextMap = {
        unfollowers: <p>
            "The uncomfortable truth is that the <u>majority of people</u> are going to have <u>high degrees of
            friction</u> and
            projection when you meet them. With most of the people you meet, things are <u>simply not going to work no
            matter what you do or say</u>. This is to be <u>expected</u>. And this is <u>fine</u>. You are going to
            be <u><b>incompatible
            with
            most of the people in the world</b></u> and to hold any <u>hopes of being highly compatible with most is an
            illusion
            of
            grandeur and a figment of your own narcissistic tendency</u>." ~ Mark Manson
        </p>,
        followbacks: <p>"The better you are at <u>surrounding yourself with people of <b>high potential</b></u>, the <u>greater
            your <b>chance for success</b></u>." ~ John C. Maxwell</p>,
        mutual: <p>"<u>Everybody isn't your friend</u>. <u>Just because they hang around you and laugh</u> with you <u>doesn't
            mean they're for you</u>. <u>Just because they say they got got your back</u>, <u>doesn't mean they won't
            stab you
            in it</u>. People pretend well. Jealousy sometimes doesn't live far. So know your circle. At the end of the
            day <b>real situations expose fake people so pay attention</b>." ~ Trent Shelton</p>,
    }

    const {getProfilesLoading, getProfilesError, getProfilesLoad} = useGetProfiles(({data}) => {
        setProfiles(data);
    });

    if (getProfilesError && !getProfilesLoading) {
        notification.error({
            message: 'Profiles Data Not Found',
            description: 'an error occurred while contacting the server',
        });
    }

    const {
        getLatestUpdatedAtLoading,
        getLatestUpdatedAtError,
        getLatestUpdatedAtLoad
    } = useGetLatestUpdatedAt(({data}) => {
        setLatestUpdatedAt(data);
    });

    if (getLatestUpdatedAtError && !getLatestUpdatedAtLoading) {
        notification.error({
            message: 'Latest Updated At Data Not Found',
            description: 'an error occurred while contacting the server',
        });
    }

    const getNumberOfDaysDiffEpochWithToday = (epoch) => {
        let inputDate = new Date(epoch * 1000);
        let todayDate = new Date();
        let diffTime = Math.abs(inputDate - todayDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const convertEpochToTimestamp = (epoch) => {
        return (new Date(epoch * 1000)).toString()
    }

    const numberOfFollowedDaysLabel = (days, typeOfDataThatAsk) => {
        if (days > 7 && typeOfDataThatAsk === "unfollowers") {
            return <u style={{color: "red"}}>{days}</u>
        } else {
            return <u>{days}</u>
        }
    }

    function handleTypeOfDataThatAskChangeEvent(value) {
        setTypeOfDataThatAsk(value)
    }

    function handleUsernameInputEnterEvent(event) {
        let username = event.target.value;
        setUsername(username)
    }

    function getFormattedDateTime(datetime) {
        return (new Date(datetime)).toString()
    }

    useEffect(() => {
        let getProfilesParam = {
            "req": {
                "type": typeOfDataThatAsk,
                "username": username
            }
        };

        let getLatestUpdatedAtParam = {
            "req": {
                "username": username
            }
        };

        getProfilesLoad(
            getProfilesParam
        )

        getLatestUpdatedAtLoad(
            getLatestUpdatedAtParam
        )
    }, [typeOfDataThatAsk, username, getProfilesLoad, getLatestUpdatedAtLoad]);

    return (
        <div>
            <Space size={8} direction="horizontal" style={{width: '100%', justifyContent: 'center'}}>
                <Input placeholder="Instagram username" defaultValue={username} disabled
                       onPressEnter={handleUsernameInputEnterEvent}/>
                <CanLogout/>
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

            {profiles.length > 0 && <Card loading={getLatestUpdatedAtLoading} bordered={false}>
                Last updated at {getFormattedDateTime(latestUpdatedAt)}
            </Card>}

            <Card loading={getProfilesLoading} bordered={false}>
                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        The truth is
                    </Divider>
                    {quoteTextMap[typeOfDataThatAsk]}
                </div>
            </Card>

            <Card loading={getProfilesLoading}>
                <div style={{fontSize: "12px"}}>
                    <Divider orientation="left" plain>
                        {typeOfDataThatAskSelectMap[typeOfDataThatAsk]} of {username}
                    </Divider>
                </div>
                <Text type="secondary" style={{paddingLeft: "5%"}} level={5}>Number
                    of {typeOfDataThatAskSelectMap[typeOfDataThatAsk]} is {profiles.length}</Text>
                <List style={{padding: "0 5% 0 5%"}} loading={getProfilesLoading} dataSource={profiles}
                      renderItem={profile => (
                          <List.Item>
                              <List.Item.Meta
                                  title={<a href={profile.Link} rel="noreferrer nofollow"
                                            target="_blank">{profile.Username}</a>}
                                  description={<p style={{fontSize: "12px"}}>Number of days since followed
                                      at <u>{convertEpochToTimestamp(profile.Epoch)}</u> is {numberOfFollowedDaysLabel(getNumberOfDaysDiffEpochWithToday(profile.Epoch), typeOfDataThatAsk)} days.
                                  </p>}
                              />
                          </List.Item>
                      )}/>
            </Card>

            <BackTop/>
        </div>
    );
}

export default Home;
