const monsgoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment
process.env.NODE_ENV = 'test';

let monogoServerTest
beforeAll( async () => {
    console.log('Setting up test environment...');
    monogoServerTest = await MongoMemoryServer.create();
    const uri = await monogoServerTest.getUri();
    await monsgoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
});

afterEach( async () => {
    const collections = await monsgoose.connection.db.collections();
    for (const key in collections ){
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll( async () => {
    if (monsgoose.connection.readyState !== 0) {
        await monsgoose.disconnect();
    }
    if (monogoServerTest) {
        await monogoServerTest.stop();
    }
});