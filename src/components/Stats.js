import {Card, Col, Divider, Row, Space, Table, Tabs} from "antd";

const getDifferenceBetweenFollowerAndFollowing = () => {
    let followersProfiles = JSON.parse(localStorage.getItem('followerUsernames'));
    let followingProfiles = JSON.parse(localStorage.getItem('followingUsernames'));

    let isFollowersBiggerThanFollowing = followersProfiles.length - followingProfiles.length;
    let discrepancies = isFollowersBiggerThanFollowing > 0 ? followersProfiles.filter(username => !followingProfiles.includes(username)) : followingProfiles.filter(username => !followersProfiles.includes(username));
    let wording = (isFollowersBiggerThanFollowing > 0 ? "You have more followers than followings." : "You have more followings than followers.") + " A total is " + discrepancies.length + (discrepancies > 1 ? " profile." : " profiles.");

    return {
        discrepanciesLength: discrepancies.length,
        isFollowersBiggerThanFollowing: isFollowersBiggerThanFollowing > 0,
        profileDiscrepancies: discrepancies,
        wording: wording
    };
}

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
    }
]

const Stats = () => {
    return (
        <div>
            <Divider orientation="left">Stats</Divider>
            <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card hoverable title="Follower" bordered={true}>
                            {JSON.parse(localStorage.getItem('followerProfiles')).length} profiles
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card hoverable title="Following" bordered={true}>
                            {JSON.parse(localStorage.getItem('followingProfiles')).length} profiles
                        </Card>
                    </Col>
                </Row>
                <Card hoverable={true} style={{width: '100%'}}>
                    {getDifferenceBetweenFollowerAndFollowing().wording}
                </Card>
            </Space>

            <Divider orientation="left">Data</Divider>

            <Tabs defaultActiveKey="1" tabPosition={'right'}>
                <Tabs.TabPane tab="Following" key="1">
                    <Table dataSource={JSON.parse(localStorage.getItem("followingProfiles"))} columns={tableCols}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Follower" key="2">
                    <Table dataSource={JSON.parse(localStorage.getItem("followerProfiles"))} columns={tableCols}/>
                </Tabs.TabPane>
            </Tabs>
        </div>
    )
}

export default Stats;