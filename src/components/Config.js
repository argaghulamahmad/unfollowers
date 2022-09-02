import {Button, Form, InputNumber, } from 'antd';

const Config = () => {
    return (
        <Form
            name="validate_other"
            initialValues={{
                'input-number': 7,
            }}
        >
            <Form.Item label="Feel Lucky Generator">
                <Form.Item name="input-number" noStyle>
                    <InputNumber min={1} max={20} />
                </Form.Item>
                <span className="ant-form-text"> profiles</span>
            </Form.Item>
            <Form.Item>
                <Button type="danger" style={{width: '100%'}}>
                    Reset feel lucky generator
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" style={{width: '100%'}}>
                    Save Config
                </Button>
            </Form.Item>
        </Form>
    );
}

export default Config;