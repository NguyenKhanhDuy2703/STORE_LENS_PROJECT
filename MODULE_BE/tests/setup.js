const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment
process.env.NODE_ENV = 'test';

let mongoServerTest;
beforeAll(async () => {
    console.log('Setting up test environment...');
    mongoServerTest = await MongoMemoryServer.create();
    const uri = await mongoServerTest.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    if (mongoose.connection.readyState !== 1) {
        return;
    }

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServerTest) {
        await mongoServerTest.stop();
    }
});