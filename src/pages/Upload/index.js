import './index.css';
import React from 'react';
import {useKeycloak} from "@react-keycloak/web";
import {Upload, message} from 'antd';
import {InboxOutlined} from '@ant-design/icons';


let restApi = process.env.REACT_APP_REST_ENDPOINT;

function UploadFile() {
    const {Dragger} = Upload;
    const {keycloak} = useKeycloak();

    let preferredUsername = keycloak.idTokenParsed.preferred_username;

    const props = {
        name: 'file',
        multiple: true,
        action: `${restApi}/uploadFile?user_username=${preferredUsername}`,
        onChange(info) {
            const {status} = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined/>
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Upload your followers and followings json file here.
            </p>
        </Dragger>
    );
}

export default UploadFile;
