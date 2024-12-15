// import { useEffect } from 'react'
// import ChatPage from './components/ChatPage'
// import EditProfile from './components/EditProfile'
// import Home from './components/Home'
// import Login from './components/Login'
// import MainLayout from './components/MainLayout'
// import Profile from './components/Profile'
// import Signup from './components/Signup'
// import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import { io } from "socket.io-client";
// import { useDispatch, useSelector } from 'react-redux'
// import { setSocket } from './redux/socketSlice'
// import { setOnlineUsers } from './redux/chatSlice'
// import { setLikeNotification } from './redux/rtnSlice'
// import ProtectedRoutes from './components/ProtectedRoutes'


// const browserRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
//     children: [
//       {
//         path: '/',
//         element: <ProtectedRoutes><Home /></ProtectedRoutes>
//       },
//       {
//         path: '/profile/:id',
//         element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
//       },
//       {
//         path: '/account/edit',
//         element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
//       },
//       {
//         path: '/chat',
//         element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
//       },
//     ]
//   },
//   {
//     path: '/login',
//     element: <Login />
//   },
//   {
//     path: '/signup',
//     element: <Signup />
//   },
// ])

// function App() {
//   const { user } = useSelector(store => store.auth);
//   const { socket } = useSelector(store => store.socketio);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (user) {
//       const socketio = io(import.meta.env.VITE_SERVER_URL, {
//         query: {
//           userId: user?._id
//         },
//         transports: ['websocket']
//       });
//       dispatch(setSocket((socketio)));

//       // listen all the events
//       socketio.on('getOnlineUsers', (onlineUsers) => {
//         dispatch(setOnlineUsers(onlineUsers));
//       });

//       socketio.on('notification', (notification) => {
//         dispatch(setLikeNotification(notification));
//       });

//       return () => {
//         socketio.close();
//         dispatch(setSocket(null));
//       }
//     } else if (socket) {
//       // socket.close();
//       dispatch(setSocket(null));
//     }
//   }, [user, dispatch]);

//   return (
//     <>
//       <RouterProvider router={browserRouter} />
//     </>
//   )
// }

// export default App

import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import { connectSocket, disconnectSocket } from './socketService';
import ChatPage from './components/ChatPage';
import EditProfile from './components/EditProfile';
import Home from './components/Home';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import Profile from './components/Profile';
import Signup from './components/Signup';
import PersistLogin from './components/PersistLogin';
import ProtectedRoutes from './components/ProtectedRoutes';

const browserRouter = createBrowserRouter([
    {
        path: "/",
        element: <PersistLogin />,
        children: [
            {
                path: "/",
                element: <ProtectedRoutes />, // PersistLogin wraps everything
                children: [
                    {
                        path: "/", // MainLayout route
                        element: <MainLayout />,
                        children: [
                            { index: true, element: <Home /> }, // Default child (Home) at "/"
                            { path: "profile/:id", element: <Profile /> }, // "/profile/:id"
                            { path: "account/edit", element: <EditProfile /> }, // "/account/edit"
                            { path: "chat", element: <ChatPage /> }, // "/chat"
                        ],
                    },
                ],
            },

        ]
    },
    { path: "/login", element: <Login /> }, // Separate routes for login/signup
    { path: "/signup", element: <Signup /> }
]);

function App() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            if (!serverUrl) {
                console.error("VITE_SERVER_URL is not defined");
                return;
            }

            const socket = connectSocket(serverUrl, user._id);

            socket.on('getOnlineUsers', (onlineUsers) => {
                dispatch(setOnlineUsers(onlineUsers));
            });

            socket.on('notification', (notification) => {
                dispatch(setLikeNotification(notification));
            });

            return () => {
                socket.off('getOnlineUsers');
                socket.off('notification');
                disconnectSocket();
            };
        } else {
            disconnectSocket();
        }
    }, [user, dispatch]);

    return <RouterProvider router={browserRouter} />;
}

export default App;
