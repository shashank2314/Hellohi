import React from 'react'
import { Navigate,Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  if(!accessToken){
    return <Navigate to="/login" replace={true} />
  } 
  return <Outlet/>
}

export default ProtectedRoutes;