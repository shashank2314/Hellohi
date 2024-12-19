import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser, setSuggestedUsers } from '@/redux/authSlice';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector((store) => store.auth);
    const { user } = useSelector((store) => store.auth);
    const [loadingStates, setLoadingStates] = useState({});
    const dispatch = useDispatch();

    const followorUnfollowHandler = async (id) => {
        try {
            setLoadingStates((prev) => ({ ...prev, [id]: true }));
            const BASE_URL = import.meta.env.VITE_SERVER_URL;
            const res = await axios.post(
                `${BASE_URL}/api/v1/user/followorunfollow/${id}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSuggestedUsers(res.data.suggestedUsers));
                dispatch(setAuthUser(res.data.user));
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            console.log(error);
            toast.error(errorMessage);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="flex flex-col justify-start items-start gap-2">
            <div className="flex justify-center gap-3 items-end">
                <h1 className="font-semi-bold text-gray-900">Suggested for you</h1>
                <div className="font-medium cursor-pointer">See All</div>
            </div>
            {suggestedUsers.map((suggestedUser) => {
                const isLoading = loadingStates[suggestedUser._id];
                const isFollowing = suggestedUser.followers.includes(user._id);
                return (
                    <div key={suggestedUser._id} className="flex items-center gap-6 justify-between my-5">
                        <div className="flex items-center gap-2">
                            <Link className="text-black" to={`/profile/${suggestedUser._id}`}>
                                <Avatar>
                                    <AvatarImage src={suggestedUser.profilePicture} alt="post_image" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className="font-semibold text-sm">
                                    <Link className="text-black" to={`/profile/${suggestedUser._id}`}>
                                        {suggestedUser.username}
                                    </Link>
                                </h1>
                                <span className="text-gray-600 text-sm">
                                    {suggestedUser.bio || 'Bio here...'}
                                </span>
                            </div>
                        </div>
                        {isLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <span
                                onClick={() => followorUnfollowHandler(suggestedUser._id)}
                                className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]"
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SuggestedUsers;
