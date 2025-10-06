import jwt from 'jsonwebtoken';

export function generateTokenAndSetCookie(userId,res) {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "10d" });
    res.cookie("jwt", token, 
        { 
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
         });
}
