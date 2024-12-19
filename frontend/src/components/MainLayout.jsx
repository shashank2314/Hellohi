import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'


const MainLayout = () => {
  console.log("hii");
  return (
    <div className='flex flex-row w-[95vw] md:w-[98vw] justify-between align-start'>
      <div className='w-[100px] md:w-[200px]'><LeftSidebar /></div>
      <div className='w-full'>
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout