import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { axiosC } from "../AxiosConfig";
import { LoginResponse, JWTDecoded } from "../types/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("User context not accessible");
  }
  const {
    username,
    isLoggedIn,
    setIsLoggedIn,
    setUsername,
    photo,
    setPhoto,
  } = userContext;




  const handleLogin = async (
    username: string,
    email: string,
    photo: string
  ) => {
    try {
      const response = await axiosC.post<LoginResponse>("/auth/login", {
        username,
        photo,
        email,
      });

      const res = response.data;
      if (res.success) {
        setIsLoggedIn(true);

        //Set Cookies
        Cookies.set("username",username, {
          expires: 1,
          path: "/",
        });
        Cookies.set("photo", photo, {
          expires: 1,
          path: "/",
        });
        toast.success("Login Successful");
        navigate("/");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.log("Error in login: ", err);
      const error = err as AxiosError;
      const res: LoginResponse | null = error.response
        ? (error.response?.data as LoginResponse)
        : null;
      toast.error(res ? res.message : "Try Again");
    }
  };

  const handleLogout = async () => {
    try {
      googleLogout();
      setIsLoggedIn(false);
      setUsername("");

      //Clear cookies
      Cookies.remove("username");
      Cookies.remove("photo");
      toast.success("Successfully Logged out");
    } catch (err) {
      console.log("Error while logout : ", err);
      const error = err as AxiosError;
      const res: LoginResponse | null = error.response
        ? (error.response?.data as LoginResponse)
        : null;
      toast.error(res ? res.message : "Try Again");
    }
  };

  return (
    !isLoggedIn ? (
      <div className="flex">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (!credentialResponse.credential) return;
            const decoded: JWTDecoded = jwtDecode(
              credentialResponse.credential
            );
            setPhoto(decoded.picture);
            console.log(decoded.picture);
            handleLogin(decoded.name, decoded.email, decoded.picture);
          }}
          onError={() => {
            toast.error("Login Failed");
          }}
          shape="pill"
          theme="filled_blue"
        />
      </div>
    ) : (
      <div className="flex justify-between">
        <div
          className="overflow-hidden cursor-pointer text-white text-2xl flex  items-center gap-5"
        >
          <img src={photo} alt="Profile" className=" border-2 border-slate-800 rounded-full w-[40px] h-[40px]" />
          {username}
        </div>
        <div
          className="bg-white text-slate-800 px-3  rounded-full border-2 border-slate-800 cursor-pointer flex-center"
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>
    )
  );
};

export default NavBar;
