import mongoose from 'mongoose';

const connectDB = async () => {
  try {
  
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("✅ MongoDB Connected Successfully");
    console.log("✅ Database Name:", mongoose.connection.db.databaseName);
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
    console.log("❌ Error Code:", error.code);
    console.log("❌ Full Error:", error);
  }
};

export default connectDB;
