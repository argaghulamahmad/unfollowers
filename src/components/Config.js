import React from 'react';
import { Button, Divider, Form, InputNumber, Space } from 'antd';
import { notification } from 'antd';

const initialValues = {
    feelLuckyGeneratorCounts: localStorage.getItem('config')
        ? JSON.parse(localStorage.getItem('config')).feelLuckyGeneratorCounts
        : 5,
};

const Config = () => {
    const onFinish = (configValues) => {
        localStorage.setItem('config', JSON.stringify(configValues));
        notification.success({
            message: 'Success',
            description: 'Config updated!',
        });
    };

    const handleResetRandomUsernames = () => {
        localStorage.removeItem('visitedRandomUsernames');
        notification.success({
            message: 'Success',
            description: 'Visited Random Profiles data has been reset!',
        });
    };

    const handleResetAllData = () => {
        localStorage.clear();
        notification.success({
            message: 'Success',
            description: 'All data cleared!',
        });
    };

    return (
        <div>
            <div>Customize your settings here!</div>
            <div>
                <Divider orientation="left">Config Setup</Divider>
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Form name="configForm" initialValues={initialValues} onFinish={onFinish}>
                        <Form.Item label="Feel Lucky Generator Counts">
                            <Form.Item name="feelLuckyGeneratorCounts" noStyle>
                                <InputNumber min={1} max={20} />
                            </Form.Item>
                            <span className="ant-form-text"> profiles</span>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" style={{ width: '100%' }} htmlType="submit">
                                Save Config
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
                <Divider orientation="left">Reset Data</Divider>
                <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                    <Button
                        type="danger"
                        style={{ width: '100%' }}
                        onClick={handleResetRandomUsernames}
                    >
                        Reset feel lucky generator
                    </Button>
                    <Button type="danger" style={{ width: '100%' }} onClick={handleResetAllData}>
                        Reset all data
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default Config;
