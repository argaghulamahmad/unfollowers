import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, InputNumber, Space } from 'antd';
import { notification } from 'antd';
import { putData, getDataById, clearStore, STORES } from '../utils/indexedDBUtils';

const CONFIG_ID = 'main';
const VISITED_PROFILES_ID = 'visitedRandomUsernames';

const Config = () => {
    const [initialValues, setInitialValues] = useState({
        feelLuckyGeneratorCounts: 5,
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const config = await getDataById(STORES.CONFIG, CONFIG_ID);
                if (config) {
                    setInitialValues({
                        feelLuckyGeneratorCounts: config.feelLuckyGeneratorCounts,
                    });
                }
            } catch (error) {
                console.error('Error loading config:', error);
            }
        };
        loadConfig();
    }, []);

    const onFinish = async (configValues) => {
        try {
            await putData(STORES.CONFIG, {
                id: CONFIG_ID,
                ...configValues,
            });
            notification.success({
                message: 'Success',
                description: 'Config updated!',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to update config',
            });
        }
    };

    const handleResetRandomUsernames = async () => {
        try {
            await putData(STORES.CONFIG, {
                id: VISITED_PROFILES_ID,
                profiles: [],
            });
            notification.success({
                message: 'Success',
                description: 'Visited Random Profiles data has been reset!',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to reset visited profiles',
            });
        }
    };

    const handleResetAllData = async () => {
        try {
            await clearStore(STORES.FOLLOWERS);
            await clearStore(STORES.UNFOLLOWERS);
            await clearStore(STORES.CONFIG);
            await clearStore(STORES.PROFILES);
            notification.success({
                message: 'Success',
                description: 'All data cleared!',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to clear all data',
            });
        }
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
