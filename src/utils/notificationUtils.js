import { notification } from "antd";

const VALID_TYPES = ['success', 'error', 'info', 'warning'];

export const openNotification = (type, message) => {
    if (!VALID_TYPES.includes(type)) {
        console.warn(`Invalid notification type: ${type}. Defaulting to 'info'`);
        type = 'info';
    }
    notification[type]({
        message,
        placement: 'topRight'
    });
};