import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '../hooks/useGetAllPost'
import useGetSuggestedUsers from '../hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    return (
        <div className='flex justify-between gap-2'>
            <div className='w-full'>
                <Feed />
                <Outlet />
            </div>
            <div className='hidden md:flex float-right'>
                <RightSidebar />
            </div>
        </div>
    )
}

export default Home