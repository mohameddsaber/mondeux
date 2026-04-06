import jwt from 'jsonwebtoken';
import { appConfig } from '../config/env.js';

export function generateTokenAndSetCookie(userId,res) {
    const token = jwt.sign({ id: userId }, appConfig.jwtSecret, { expiresIn: "10d" });
    res.cookie("jwt", token, 
        { 
            httpOnly: true,
            sameSite: appConfig.authCookieSameSite,
            secure: appConfig.authCookieSecure,
            maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
         });
}
