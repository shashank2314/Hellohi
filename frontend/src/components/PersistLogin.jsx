// import { Outlet, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";

// const PersistLogin = () => {
//     const [isLoading, setIsLoading] = useState(true);
//     const accessToken = sessionStorage.getItem("accessToken");
//     console.log("accessToken", accessToken);
//     const navigate = useNavigate();
//     useEffect(() => {
//         let isMounted = true;
//         const verifyRefreshToken = async () => {
//             try {
//                 const res = await axios.get(import.meta.env.VITE_SERVER_URL + `/api/v1/user/refreshtoken`, { withCredentials: true });
//                 if (res.data.success) {
//                     sessionStorage.setItem("accessToken", res.data.accessToken);
//                 }
//                 else {
//                     navigate('/login');
//                 }
//             }
//             catch (err) {
//                 navigate('/login');
//                 console.error(err);
//             }
//             finally {
//                 isMounted && setIsLoading(false);
//             }
//         }

//         !accessToken ? verifyRefreshToken() : setIsLoading(false);
//         return () => isMounted = false;
//     }, [])

//     useEffect(() => {
//         console.log(`isLoading: ${isLoading}`)
//     }, [isLoading])

//     return (
//         <>
//             {
//                 isLoading
//                     ? <p>Loading...</p>
//                     : <Outlet />
//             }
//         </>
//     )
// }

// export default PersistLogin
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(sessionStorage.getItem("accessToken"));
    const navigate = useNavigate();
    const location = useLocation();

    const publicRoutes = ["/login", "/signup"]; // Define public routes

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                if (!serverUrl) throw new Error("VITE_SERVER_URL is not defined");

                const res = await axios.get(`${serverUrl}/api/v1/user/refreshtoken`, { withCredentials: true });
                if (res.data.success) {
                    sessionStorage.setItem("accessToken", res.data.accessToken);
                    setAccessToken(res.data.accessToken); // Update state
                } else {
                    navigate("/login");
                }
            } catch (err) {
                console.error("Error verifying refresh token:", err);
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        // Skip refresh token verification for public routes
        if (publicRoutes.includes(location.pathname)) {
            setIsLoading(false);
        } else if (!accessToken) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }
    }, [accessToken, location.pathname, navigate]);

    return (
        <>
            {isLoading ? <p>Loading...</p> : <Outlet />}
        </>
    );
};

export default PersistLogin;
