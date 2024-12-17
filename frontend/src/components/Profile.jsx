import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className="flex justify-center px-4">
      <div className="flex flex-col gap-12 max-w-4xl w-full p-4">
        {/* Profile Header */}
        <div className="flex flex-wrap items-center gap-8">
          {/* Avatar Section */}
          <section className="flex justify-center w-full lg:w-auto">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile?.profilePicture} alt="Profile photo" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>

          {/* User Info Section */}
          <section className="flex flex-col gap-5 w-full lg:flex-1">
            {/* Username and Action Buttons */}
            <span className="font-bold text-2xl">{userProfile?.username}</span>
            <div className="flex items-center gap-2 flex-wrap">
              {isLoggedInUserProfile ? (
                <>
                  <Link to="/account/edit">
                    <Button variant="secondary" className="hover:bg-gray-200 h-8">Edit profile</Button>
                  </Link>
                  <Button variant="secondary" className="hover:bg-gray-200 h-8">View archive</Button>
                  <Button variant="secondary" className="hover:bg-gray-200 h-8">Ad tools</Button>
                </>
              ) : (
                isFollowing ? (
                  <>
                    <Button variant="secondary" className="h-8">Unfollow</Button>
                    <Button variant="secondary" className="h-8">Message</Button>
                  </>
                ) : (
                  <Button className="bg-[#0095F6] hover:bg-[#3192d2] h-8">Follow</Button>
                )
              )}
            </div>

            {/* Followers/Following Stats */}
            <div className="flex items-center gap-4">
              <p><span className="font-semibold">{userProfile?.posts?.length || 0}</span> posts</p>
              <p><span className="font-semibold">{userProfile?.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold">{userProfile?.following?.length || 0}</span> following</p>
            </div>

            {/* Bio Section */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{userProfile?.bio || 'bio here...'}</span>
              <Badge className="w-fit" variant="secondary">
                <AtSign />
                <span className="pl-1">{userProfile?.username}</span>
              </Badge>
            </div>
          </section>
        </div>

        {/* Posts Section */}
        <div className="border-t border-t-gray-200">
          {/* Tabs */}
          <div className="flex justify-center gap-8 text-sm py-4">
            <span
              className={`py-2 cursor-pointer ${activeTab === 'posts' ? 'font-bold border-b-2 border-black' : ''}`}
              onClick={() => handleTabChange('posts')}
            >
              POSTS
            </span>
            <span
              className={`py-2 cursor-pointer ${activeTab === 'saved' ? 'font-bold border-b-2 border-black' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              SAVED
            </span>
            <span className="py-2 cursor-pointer">REELS</span>
            <span className="py-2 cursor-pointer">TAGS</span>
          </div>

          {/* Posts Flex Layout */}
          <div className="flex flex-wrap gap-2 justify-start">
            {displayedPost?.map((post) => (
              <div key={post?._id} className="relative group cursor-pointer flex-shrink-0">
                <img
                  src={post.image}
                  alt="Post"
                  className="rounded-sm w-40 h-40 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-white space-x-4">
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <Heart />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <MessageCircle />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500">No posts to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
