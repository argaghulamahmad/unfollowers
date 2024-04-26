import jsonminify from 'jsonminify';
import {openNotification} from './notificationUtils';

export const fetchGist = async (gistId, githubToken, fileName) => {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        if (!response.ok) {
            throw new Error('Fetch failed');
        }

        const gistData = await response.json();
        const gistContent = jsonminify(gistData.files[fileName].content);

        openNotification('success', 'Fetch Gist successful');

        return gistContent;
    } catch (error) {
        console.error(error.message);
        openNotification('error', 'Fetch Gist failed');
    }
};

export const updateGist = async (gistId, githubToken, fileName, data) => {
    try {
        const minifiedContent = jsonminify(JSON.stringify(data));

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({
                files: {
                    [fileName]: {
                        content: minifiedContent,
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }

        openNotification('success', 'Update to Gist successful');
    } catch (error) {
        console.error(error.message);
        openNotification('error', 'Update to Gist failed');
    }
};
