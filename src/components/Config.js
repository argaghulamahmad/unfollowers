import {Button, Form, InputNumber,} from 'antd';
import {notification} from 'antd';


const Config = () => {
    return (
        <div>
            <Form
                name="validate_other"
                initialValues={{
                    'feelLuckyGeneratorNumbers': 7,
                }}
                onFinish={(configValues   ) => {
                    localStorage.setItem('config', JSON.stringify(configValues));
                    notification.success({
                        message: 'Success',
                        description: 'Config updated!',
                    });}
                }
            >
                <Form.Item label="Feel Lucky Generator">
                    <Form.Item name="feelLuckyGeneratorNumbers" noStyle>
                        <InputNumber min={1} max={20}/>
                    </Form.Item>
                    <span className="ant-form-text"> profiles</span>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" style={{width: '100%'}} htmlType="submit">
                        Save Config
                    </Button>
                </Form.Item>
            </Form>

            <div>
                <Button type="danger" style={{width: '100%'}} onClick={
                    () => {
                        localStorage.removeItem("visitedRandomProfiles");
                        notification.success({
                            message: 'Success',
                            description: 'Visited Random Profiles data updated!',
                        })
                    }
                }>
                    Reset feel lucky generator
                </Button>
                <div style={{marginBottom: "12px"}}></div>
                <Button type="danger" style={{width: '100%'}} onClick={
                    () => {
                        localStorage.clear();
                        notification.success({
                            message: 'Success',
                            description: 'All data cleared!',
                        })
                    }
                }>
                    Reset all data
                </Button>
            </div>
        </div>
    );
}

export default Config;