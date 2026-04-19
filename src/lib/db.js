import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongodbUri, opts).then((instance) => {
      console.log('âœ… MongoDB connected successfully');
      return instance;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('âœ… MongoDB connected securely! Loaded Models:', Object.keys(mongoose.models));
  } catch (e) {
    console.error('âŒ MONGODB CONNECTION ERROR:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
