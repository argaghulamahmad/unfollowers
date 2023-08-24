import React from 'react';
import { Card, Col, Divider, Row, Space, Table, Tabs } from 'antd';
import Uploader from './Uploader';

const getDifferenceBetweenFollowerAndFollowing = () => {
    const followersProfiles = JSON.parse(localStorage.getItem('followerUsernames'));
    const followingProfiles = JSON.parse(localStorage.getItem('followingUsernames'));

    const isFollowersBiggerThanFollowing = followersProfiles.length - followingProfiles.length;
    const discrepancies = isFollowersBiggerThanFollowing > 0
        ? followersProfiles.filter(username => !followingProfiles.includes(username))
        : followingProfiles.filter(username => !followersProfiles.includes(username));

    const wording = (isFollowersBiggerThanFollowing > 0
            ? "You have more followers than followings."
            : "You have more followings than followers.") +
        ` A total of ${discrepancies.length} ${discrepancies.length > 1 ? "profiles" : "profile"}.`;

    return {
        discrepanciesLength: discrepancies.length,
        isFollowersBiggerThanFollowing: isFollowersBiggerThanFollowing > 0,
        profileDiscrepancies: discrepancies,
        wording: wording,
    };
};

const tableCols = [
    {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: 'Connected At',
        dataIndex: 'connectedAt',
        key: 'connectedAt',
    },
];

const FollowerFollowingCard = ({ title, profiles }) => (
    <Col span={12}>
        <Card title={title} bordered={true}>
            {profiles.length} profiles
        </Card>
    </Col>
);

const StatsCard = ({ content }) => (
    <Card style={{ width: '100%' }}>{content}</Card>
);

const StatsTabPane = ({ tabKey, dataSource }) => (
    <Tabs.TabPane tab={tabKey} key={tabKey}>
        <Table dataSource={dataSource} columns={tableCols} />
    </Tabs.TabPane>
);

const Stats = () => {
    return JSON.parse(localStorage.getItem('allProfiles')) ? (
        <div>
            <Divider orientation="left">Stats</Divider>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Row gutter={16}>
                    <FollowerFollowingCard
                        title="Follower"
                        profiles={JSON.parse(localStorage.getItem('followerProfiles'))}
                    />
                    <FollowerFollowingCard
                        title="Following"
                        profiles={JSON.parse(localStorage.getItem('followingProfiles'))}
                    />
                </Row>
                <StatsCard content={getDifferenceBetweenFollowerAndFollowing().wording} />
            </Space>
        </div>
    ) : (
        <Uploader />
    );
};

export default Stats;
