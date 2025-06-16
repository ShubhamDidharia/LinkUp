import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    // Generate JWT token
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: '1d' 
    });

    res.cookie("jwt",token,{
        httpOnly:true,  // Prevents client-side JavaScript from accessing the cookie
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict', // Helps prevent CSRF attacks --> csrf attacks are when a malicious site tricks a user into performing actions on another site where they are authenticated 
        secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
        }
    );

}