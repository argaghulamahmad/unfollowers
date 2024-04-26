const recomputeData = (allProfiles) => {
    const allProfilesMap = allProfiles.reduce((map, profile) => {
        map.set(profile.username, profile);
        return map;
    }, new Map());

    const allProfilesArray = Array.from(allProfilesMap.values());
    allProfilesArray.sort((a, b) => a.connectedAt - b.connectedAt);

    const followerUsernames = JSON.parse(localStorage.getItem('followerUsernames')) || [];
    const followingUsernames = JSON.parse(localStorage.getItem('followingUsernames')) || [];

    const followbackUsernames = followerUsernames.filter(
        (username) => !followingUsernames.includes(username)
    );

    const unfollowerUsernames = followingUsernames.filter(
        (username) => !followerUsernames.includes(username)
    );

    const mutualUsernames = followingUsernames.filter((username) =>
        followerUsernames.includes(username)
    );

    const followbackProfiles = followbackUsernames.map((username) => {
        const profile = allProfilesMap.get(username);
        return { username, connectedAt: profile.connectedAt };
    });

    const unfollowbackProfiles = unfollowerUsernames.map((username) => {
        const profile = allProfilesMap.get(username);
        return { username, connectedAt: profile.connectedAt };
    });

    const mutualProfiles = mutualUsernames.map((username) => {
        const profile = allProfilesMap.get(username);
        return { username, connectedAt: profile.connectedAt };
    });

    const currentTime = new Date().getTime();

    postMessage({
        type: 'recomputeSuccess',
        data: {
            allProfiles: allProfilesArray,
            followbackUsernames,
            unfollowerUsernames,
            mutualUsernames,
            followbackProfiles,
            unfollowbackProfiles,
            mutualProfiles,
            lastUpdateAt: currentTime,
        },
    });
};

onmessage = (event) => {
    const { allProfiles } = event.data;
    recomputeData(allProfiles);
};
