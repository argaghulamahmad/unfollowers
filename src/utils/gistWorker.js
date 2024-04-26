import jsonminify from 'jsonminify';

self.onmessage = async (event) => {
    const {type, data} = event.data;

    switch (type) {
        case 'fetchGist':
            await fetchGist(data.gistId, data.githubToken, data.fileName);
            break;
        case 'updateGist':
            await updateGist(data.gistId, data.githubToken, data.fileName, data.content);
            break;
        default:
            console.error('Invalid message type');
    }
};

const fetchGist = async (gistId, githubToken, fileName) => {
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

        self.postMessage({type: 'fetchSuccess', fileName, content: gistContent});
    } catch (error) {
        console.error(error.message);
        self.postMessage({type: 'fetchError', fileName});
    }
};

const updateGist = async (gistId, githubToken, fileName, data) => {
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

        self.postMessage({type: 'updateSuccess', fileName});
    } catch (error) {
        console.error(error.message);
        self.postMessage({type: 'updateError', fileName});
    }
};
