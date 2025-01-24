import React, { useMemo, useCallback } from 'react';
import { Card, Spin, Empty, Row, Col, Statistic, Button, List, Progress } from 'antd';
import { UserOutlined, UserDeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { STORES } from '../utils/indexedDBUtils';
import VirtualList from './VirtualList';

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

    const renderFollowerItem = (item) => (
        <List.Item>
            <List.Item.Meta
                avatar={<UserOutlined />}
                title={item.username}
                description={`Connected since: ${new Date(item.connectedAt).toLocaleDateString()}`}
            />
        </List.Item>
    );

    const renderUnfollowerItem = (item) => (
        <List.Item>
            <List.Item.Meta
                avatar={<UserDeleteOutlined />}
                title={item.username}
                description={`Unfollowed on: ${new Date(item.unfollowedAt).toLocaleDateString()}`}
            />
        </List.Item>
    );

    if (followersLoading || unfollowersLoading) {
        return <div className="loading-container"><Spin size="large" /></div>;
    }

    if (followersError || unfollowersError) {
        return <Empty description="Error loading data" />;
    }

    return (
        <div className="stats-container">
            {stats && (
                <Row gutter={16} className="stats-summary">
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total Profiles"
                                value={stats.totalProfiles}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Retention Rate"
                                value={stats.retentionRate}
                                suffix="%"
                                precision={2}
                            />
                            <Progress percent={stats.retentionRate} showInfo={false} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Churn Rate"
                                value={stats.churnRate}
                                suffix="%"
                                precision={2}
                            />
                            <Progress percent={stats.churnRate} showInfo={false} status="exception" />
                        </Card>
                    </Col>
                </Row>
            )}

            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={12}>
                    <Card title="Followers" extra={<span>{followers?.length || 0} followers</span>}>
                        <VirtualList
                            data={followers || []}
                            renderItem={renderFollowerItem}
                            className="followers-list"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Unfollowers" extra={<span>{unfollowers?.length || 0} unfollowers</span>}>
                        <VirtualList
                            data={sortedUnfollowers}
                            renderItem={renderUnfollowerItem}
                            className="unfollowers-list"
                        />
                    </Card>
                </Col>
            </Row>

            <Row justify="center" style={{ marginTop: '24px' }}>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportData}
                    disabled={!stats}
                >
                    Export Data
                </Button>
            </Row>
        </div>
    );
};

export default Stats;
