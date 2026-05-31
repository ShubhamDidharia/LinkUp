import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    // Generate JWT token
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: '1d' 
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("jwt",token,{
        httpOnly:true,  // Prevents client-side JavaScript from accessing the cookie
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: isProduction ? 'none' : 'strict', // Allow cross-site auth between Vercel and Render in production
        secure: isProduction // Use secure cookies in production
        }
    );

}