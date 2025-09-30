import express from 'express';
import dotenv from 'dotenv';
import connectBD from './db/connectiondb.js'
import userRoute from './routes/userRoutes.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
connectBD();
app.use(express.json());
app.use('/api/user', userRoute);

app.get('/', (req, res) =>{
    res.send("API is running");
})
app.listen(PORT, () =>{
    console.log(`server is running on port ${PORT}`)
})
