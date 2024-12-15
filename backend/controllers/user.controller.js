import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import dotenv from "dotenv";
import { RefreshToken } from "../models/refreshToken.model.js";
dotenv.config();
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const accessToken = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        const refreshToken = await jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET_KEY, { expiresIn: '10d' });
        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        const refreshTokenInstance = await RefreshToken.create({refreshToken});
        console.log("refreshTokenInstance",refreshTokenInstance);
        user.refreshToken.push(refreshTokenInstance._id);
        user.posts = populatedPosts;
        await user.save();
        return res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 10 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user:{
                _id:user._id,
                username: user.username,
                email: user.email,
                profilePicture:user.profilePicture,
                bio:user.bio,
                gender:user.gender,
                followers:user.followers,
                following:user.following,
                posts:user.posts,
                bookmarks:user.bookmarks
            },
            accessToken:accessToken
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({
            message: "Unauthorized request",
            success: false,
        });
    }

    try {
        // Verify incoming refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_SECRET_KEY
        );

        const user = await User.findById(decodedToken?.userId).populate('refreshToken');
        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token",
                success: false,
            });
        }

        // Remove the old refresh token
        user.refreshToken = user.refreshToken.filter(token => token.refreshToken !== incomingRefreshToken);
        await RefreshToken.deleteOne({ refreshToken: incomingRefreshToken });

        // Generate new tokens
        const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET_KEY, { expiresIn: '10d' });

        // Save the new refresh token
        const refreshTokenInstance = await RefreshToken.create({ refreshToken });
        user.refreshToken.push(refreshTokenInstance._id);
        await user.save();

        return res
            .status(200)
            .cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 })
            .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 10 * 24 * 60 * 60 * 1000 })
            .json({
                message: "Access token refreshed",
                success: true,
                accessToken: accessToken,
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        // res.clearCookie('accessToken');
        // res.clearCookie('refreshToken');

        const refreshToken = req.cookies.refreshToken;
        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET_KEY
        )
        const user = await User.findById(decodedToken?.userId).populate('refreshToken')
        user.refreshToken = user.refreshToken.filter(token => token.refreshToken !== refreshToken);
        await user.save();
        await RefreshToken.deleteOne({ refreshToken });
        return res.cookie("accessToken", "", { maxAge: 0 }).cookie("refreshToken", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // patel
        const jiskoFollowKrunga = req.params.id; // shivani
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // mai check krunga ki follow krna hai ya unfollow
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if (isFollowing) {
            // unfollow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            // follow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', success: false });
    }
}