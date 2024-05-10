import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from './module/userModule'; 
import mongoose from 'mongoose';

declare module 'express-serve-static-core' {
    interface Request {
        user: any;  
    }
}

dotenv.config();

const app = express();

app.use(express.json());

app.get('/posts', authenticateToken, async (req: Request, res: Response) => {
    try {
        // Find the user in the database using the id from the authenticated user
        console.log(req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

mongoose.connect('mongodb+srv://dulanjankavindu:123&123@cluster0.vt3intt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0') // Connect to MongoDB
.then(() => {
    console.log('server connected to database');
    app.listen(3000, () => {
        console.log(`app is listening to port: ${3000}`);
    });
})
.catch((error) => {
    console.error(`Failed to connect to the database. Error: ${error.message}`);
});
