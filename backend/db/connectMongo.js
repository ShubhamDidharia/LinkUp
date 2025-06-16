import mongoose from "mongoose";

const connectMongo = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        //conn is an object that contains the connection details upon successful connection
        console.log(`mongoDB connected to : ${conn.connection.host} , ${conn.connection.name}`);
        console.log("MongoDB connected successfully");

    }
    catch(err){
        console.error(`error connecting to mongoDB: ${err.message}`);
        process.exit(1);
    }
}
export default connectMongo;