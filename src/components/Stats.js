import React, { useMemo, useCallback } from 'react';
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
        if (!followers?.length && !unfollowers?.length) return null;

        const totalProfiles = (followers?.length || 0) + (unfollowers?.length || 0);
        if (totalProfiles === 0) return null;

        const retentionRate = ((followers?.length || 0) / totalProfiles) * 100;
        const churnRate = ((unfollowers?.length || 0) / totalProfiles) * 100;

        return {
            totalProfiles,
            retentionRate: Math.round(retentionRate * 100) / 100,
            churnRate: Math.round(churnRate * 100) / 100
        };
    }, [followers, unfollowers]);

    const sortedUnfollowers = useMemo(() => {
        return unfollowers
            ?.slice()
            .sort((a, b) => (b.unfollowedAt || 0) - (a.unfollowedAt || 0)) || [];
    }, [unfollowers]);

    const handleExportData = useCallback(() => {
        let url;
        try {
            const data = {
                followers,
                unfollowers,
                stats,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `unfollowers-stats-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            // Cleanup URL if it was created
            if (url) URL.revokeObjectURL(url);
        }
    }, [followers, unfollowers, stats]);

    const unfollowerColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text) => text ? (
                <a href={`https://instagram.com/${text}`} target="_blank" rel="noreferrer">{text}</a>
            ) : 'Unknown'
        },
        {
            title: 'Unfollowed Date',
            dataIndex: 'unfollowedAt',
            key: 'unfollowedAt',
            render: (date) => {
                try {
                    return date ? new Date(date).toLocaleDateString() : 'Unknown';
                } catch (error) {
                    return 'Invalid Date';
                }
            }
        }
    ];

    if (followersLoading || unfollowersLoading) {
        return <Spin size="large" />;
    }

    if (followersError || unfollowersError) {
        return <div>Error loading data. Please try again later.</div>;
    }

    if (!followers.length && !unfollowers.length) {
        return (
            <Empty
                description="No follower data available yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
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
                            dataSource={sortedUnfollowers}
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
