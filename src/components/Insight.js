import {useEffect, useState, useMemo, useCallback} from "react";
import {BackTop, Button, Card, Col, Divider, List, notification, Row, Select, Space} from "antd";
import Sync from "./Sync";
import {typeOfDataThatAskSelectMap} from "../consts";
import {Option} from "antd/es/mentions";
import { useIndexedDB } from '../hooks/useIndexedDB';
import { STORES } from '../utils/indexedDBUtils';

const Insight = () => {
    const { data: config } = useIndexedDB(STORES.CONFIG);
    const { data: profiles } = useIndexedDB(STORES.PROFILES);
    const { data: followers } = useIndexedDB(STORES.FOLLOWERS);
    const { data: unfollowers } = useIndexedDB(STORES.UNFOLLOWERS);

    const defaultTypeOfDataThatAsked = config.find(c => c.key === 'typeOfDataThatAsked')?.value || "unfollowers";
    const [typeOfDataThatAsk, setTypeOfDataThatAsk] = useState(defaultTypeOfDataThatAsked);
    const [displayProfiles, setDisplayProfiles] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: 'connectedAt',
        order: 'desc',
    });

    const sortProfiles = useCallback((profiles, sortConfig) => {
        if (!profiles) return [];

        const { key, order } = sortConfig;
        return [...profiles].sort((a, b) => {
            if (key === 'connectedAt') {
                const dateA = new Date(a.connectedAt);
                const dateB = new Date(b.connectedAt);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (key === 'username') {
                return order === 'asc'
                    ? a.username.localeCompare(b.username)
                    : b.username.localeCompare(a.username);
            }
            return 0;
        });
    }, []);

    const handleTypeOfDataThatAskChangeEvent = useCallback((value) => {
        setTypeOfDataThatAsk(value);

        let description = `You have selected ${typeOfDataThatAskSelectMap[value]} to be shown.`;
        if (value === 'unfollowers') {
            description += ` There are ${unfollowers.length} unfollowers.`;
        } else if (value === 'mutual') {
            description += ` There are ${followers.length} mutual followers.`;
        }

        notification.success({
            message: 'Success',
            description: description,
        });
    }, [followers.length, unfollowers.length]);

    const epochToDateTime = useCallback((epoch) => {
        let date = new Date(epoch);
        return date.toDateString();
    }, []);

    // Update displayed profiles when type changes or data updates
    useEffect(() => {
        let profilesToShow = [];
        switch (typeOfDataThatAsk) {
            case "unfollowers":
                profilesToShow = unfollowers;
                break;
            case "mutual":
                profilesToShow = followers;
                break;
            case "allProfiles":
                profilesToShow = profiles;
                break;
            default:
                console.error('Invalid type of data requested');
        }
        setDisplayProfiles(sortProfiles(profilesToShow, sortConfig));
    }, [typeOfDataThatAsk, profiles, followers, unfollowers, sortConfig, sortProfiles]);

    const homeTitleWordingMap = {
        "unfollowers": "unfollow you",
        "followbacks": "follow you back",
        "mutual": "mutual with you",
    };

    const openInstagramWithDelay = username => {
        const randomDelay = Math.floor(Math.random() * 6) + 5;
        setTimeout(() => {
            window.open(`https://www.instagram.com/${username}`, '_blank');
        }, randomDelay * 1000);
    };

    // Only show Sync if no profiles exist
    if (!profiles.length) {
        return <Sync/>;
    }

    return (
        <div>
            <div>
                {homeTitleWordingMap[typeOfDataThatAsk] ? (
                    <div>
                        See all {displayProfiles.length} profiles that {homeTitleWordingMap[typeOfDataThatAsk]}!
                    </div>
                ) : (
                    <div>See all profiles that stored into the app.</div>
                )}
            </div>

            <Divider orientation="left">Profiles</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card
                            hoverable
                            title="Unfollowers"
                            bordered={true}
                            onClick={() => handleTypeOfDataThatAskChangeEvent("unfollowers")}
                            style={{
                                boxShadow: typeOfDataThatAsk === "unfollowers" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                            }}
                        >
                            {unfollowers.length} profiles
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            hoverable
                            title="Mutuals"
                            bordered={true}
                            onClick={() => handleTypeOfDataThatAskChangeEvent("mutual")}
                            style={{
                                boxShadow: typeOfDataThatAsk === "mutual" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                            }}
                        >
                            {followers.length} profiles
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            hoverable
                            title="All Profiles"
                            bordered={true}
                            onClick={() => handleTypeOfDataThatAskChangeEvent("allProfiles")}
                            style={{
                                boxShadow: typeOfDataThatAsk === "allProfiles" ? "5px 8px 24px 5px rgba(208, 216, 243, 0.6)" : ""
                            }}
                        >
                            {profiles.length} profiles
                        </Card>
                    </Col>
                </Row>

                <Button
                    type="primary"
                    style={{width: '100%'}}
                    onClick={() => {
                        const randomProfiles = [];
                        const maxCount = 5;
                        const availableProfiles = [...displayProfiles];

                        for (let i = 0; i < maxCount && availableProfiles.length > 0; i++) {
                            const randomIndex = Math.floor(Math.random() * availableProfiles.length);
                            const profile = availableProfiles.splice(randomIndex, 1)[0];
                            randomProfiles.push(profile);
                        }

                        if (randomProfiles.length > 0) {
                            notification.success({
                                message: 'Success',
                                description: `${randomProfiles.length} ${typeOfDataThatAsk} profiles loaded!`,
                            });
                            randomProfiles.forEach(profile => {
                                openInstagramWithDelay(profile.username);
                            });
                        } else {
                            notification.info({
                                message: 'No more profiles to load!',
                                description: `There are no more ${typeOfDataThatAsk} profiles to load!`,
                            });
                        }
                    }}
                >
                    I feel lucky
                </Button>

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
                            <Select
                                defaultValue="connectedAt"
                                onChange={(value) => {
                                    setSortConfig({
                                        key: value,
                                        order: sortConfig.order
                                    });
                                }}
                            >
                                <Option value="username">Username</Option>
                                <Option value="connectedAt">Connected At</Option>
                            </Select>
                            <Select
                                defaultValue="desc"
                                onChange={(value) => {
                                    setSortConfig({
                                        key: sortConfig.key,
                                        order: value
                                    });
                                }}
                            >
                                <Option value="asc">Ascending</Option>
                                <Option value="desc">Descending</Option>
                            </Select>
                        </Space>
                    </div>
                    <List
                        style={{padding: "0 5% 0 5%"}}
                        dataSource={displayProfiles}
                        pagination={{
                            pageSize: 10,
                        }}
                        renderItem={profile => (
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <a
                                            href={`https://instagram.com/${profile.username}`}
                                            rel="noreferrer nofollow"
                                            target="_blank"
                                        >
                                            {profile.username}
                                        </a>
                                    }
                                    description={epochToDateTime(profile.connectedAt)}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Space>
            <BackTop/>
        </div>
    );
};

export default Insight;