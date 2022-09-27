import Dexie from 'dexie';

const db = new Dexie('LiSearch');

db.version(1).stores({
    profiles: '++id, username, connectedAt',
    mutual: '++id, username, connectedAt',
    unfollower: '++id, username, connectedAt',
    follower: '++id, username, connectedAt'
});

export default db
