import React, { useMemo } from 'react';
import { Card, Spin, Empty, Row, Col, Statistic, Button, Table, Progress } from 'antd';
import { UserOutlined, UserDeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { STORES } from '../utils/indexedDBUtils';

const Stats = () => {
    const {
        data: followers,
        loading: followersLoading,
        error: followersError
    } = useIndexedDB(STORES.FOLLOWERS);

    const {
        data: unfollowers,
        loading: unfollowersLoading,
        error: unfollowersError
    } = useIndexedDB(STORES.UNFOLLOWERS);

    const stats = useMemo(() => {
        if (!followers.length && !unfollowers.length) return null;

        const totalProfiles = followers.length + unfollowers.length;
        const retentionRate = (followers.length / totalProfiles) * 100;
        const churnRate = (unfollowers.length / totalProfiles) * 100;

        return {
            totalProfiles,
            retentionRate: Math.round(retentionRate * 100) / 100,
            churnRate: Math.round(churnRate * 100) / 100
        };
    }, [followers, unfollowers]);

    const unfollowerColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <a href={`https://instagram.com/${text}`} target="_blank" rel="noreferrer">{text}</a>
        },
        {
            title: 'Unfollowed Date',
            dataIndex: 'unfollowedAt',
            key: 'unfollowedAt',
            render: (date) => new Date(date).toLocaleDateString()
        }
    ];

    const handleExportData = () => {
        const data = {
            followers,
            unfollowers,
            stats,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unfollowers-stats-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (followersLoading || unfollowersLoading) {
        return <Spin size="large" />;
    }

    if (followersError || unfollowersError) {
        return <div>Error loading data. Please try again later.</div>;
    }

    return (
        <div className="stats-container">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportData}
                        style={{ marginBottom: 16 }}
                    >
                        Export Data
                    </Button>
                </Col>

                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Current Followers"
                            value={followers.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Total Unfollowers"
                            value={unfollowers.length}
                            prefix={<UserDeleteOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>

                {stats && (
                    <>
                        <Col xs={24} sm={12}>
                            <Card title="Follower Retention">
                                <Progress
                                    type="circle"
                                    percent={stats.retentionRate}
                                    format={percent => `${percent}%`}
                                    status="active"
                                />
                                <p style={{ marginTop: 16 }}>
                                    Of {stats.totalProfiles} total profiles tracked
                                </p>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Card title="Churn Rate">
                                <Progress
                                    type="circle"
                                    percent={stats.churnRate}
                                    format={percent => `${percent}%`}
                                    status="exception"
                                />
                                <p style={{ marginTop: 16 }}>
                                    Lost followers percentage
                                </p>
                            </Card>
                        </Col>
                    </>
                )}

                <Col span={24}>
                    <Card title="Recent Unfollowers">
                        <Table
                            dataSource={unfollowers.slice().sort((a, b) => b.unfollowedAt - a.unfollowedAt)}
                            columns={unfollowerColumns}
                            pagination={{ pageSize: 5 }}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Stats;
