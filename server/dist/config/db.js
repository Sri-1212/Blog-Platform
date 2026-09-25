"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const env_1 = require("./env");
let mongoMemoryServer = null;
const connectDB = async () => {
    try {
        let uri = env_1.config.mongoUri;
        if (uri && uri.trim() !== '') {
            try {
                console.log(`📡 Attempting connection to MongoDB at: ${uri}`);
                await mongoose_1.default.connect(uri);
                console.log('✅ Connected to external MongoDB successfully.');
                return;
            }
            catch (err) {
                console.warn('⚠️ Failed to connect to configured MONGODB_URI. Falling back to in-memory MongoDB...');
            }
        }
        console.log('🚀 Initializing MongoMemoryServer (In-Memory MongoDB)...');
        mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        uri = mongoMemoryServer.getUri();
        await mongoose_1.default.connect(uri);
        console.log(`✅ Connected to in-memory MongoDB at: ${uri}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
};
exports.disconnectDB = disconnectDB;
