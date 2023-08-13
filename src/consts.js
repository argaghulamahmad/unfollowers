const followersJsonFileName = 'followers.json';
const followingJsonFileName = 'following.json';

const acceptedUploadedFilenames = [followersJsonFileName, followingJsonFileName];

const typeOfDataThatAskSelectMap = {
    unfollowers: 'Unfollowers',
    followbacks: 'Followbacks',
    mutual: 'Mutuals',
    allProfiles: 'All profiles',
};

export {
    followersJsonFileName,
    followingJsonFileName,
    acceptedUploadedFilenames,
    typeOfDataThatAskSelectMap
};
