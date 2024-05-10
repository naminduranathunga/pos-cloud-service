import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from './module/userModule'; // Import the User model
import bcrypt from 'bcryptjs';
import mongoose, { Document } from 'mongoose';

dotenv.config();

const app = express();

app.use(express.json());

interface IUser extends Document {
    username: string;
    password: string;
}

let refreshTokens: string[] = [];

app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username }) as IUser; // Find the user in the database
        if (!user) throw new Error("User does not exist");

        const valid = await bcrypt.compare(password, user.password); // Compare the provided password with the hashed password in the database
        if (!valid) throw new Error("Password not correct");

        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET as string);

        refreshTokens.push(refreshToken); // This should save the refresh token in the database
        res.json({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (err: any) {
        res.send({
            error: `${err.message}`,
        });
    }
});

app.post('/signin', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username: username }) as IUser;

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving

        if (user) {
            // If the user exists, update their details
            user.password = hashedPassword;
        } else {
            // If the user doesn't exist, create a new user
            user = new User({ username: username, password: hashedPassword }) as IUser;
        }

        await user.save();

        res.json({ message: 'User added/updated successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

function generateAccessToken(user: IUser) {
    return jwt.sign({ id: user._id, name: user.username }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '60s' });
}

mongoose.connect('mongodb+srv://dulanjankavindu:123&123@cluster0.vt3intt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0') // Connect to MongoDB
.then(() => {
    console.log('authServer connected to database');
    app.listen(4000, () => {
        console.log(`app is listening to port: ${4000}`);
    });
})
.catch((error) => {
    console.error(`Failed to connect to the database. Error: ${error.message}`);
});
