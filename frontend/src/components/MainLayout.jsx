import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'


const MainLayout = () => {
  console.log("hii");
  return (
    <div className='flex flex-row w-[99vw] justify-between align-start'>
      <div className='float-left w-full relative'><LeftSidebar /></div>
      <div className='float-right w-full relative'>
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout