import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/userContext";
import { CircleX, LogOut, SquareMenu } from "lucide-react";
import { axiosC } from "../AxiosConfig";
import { LoginResponse, JWTDecoded } from "../types/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import gsap from "gsap";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [toggleOpen, setToggleOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const mobileNavref = useRef<HTMLDivElement | null>(null);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("User context not accessible");
  }
  const {
    isLoggedIn,
    setIsLoggedIn,
    setUsername,
    photo,
    setPhoto,
  } = userContext;

  useEffect(() => {
    const handleWidth = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, []);

  useEffect(() => {
    // Set initial position when component mounts
    if (mobileNavref.current) {
      gsap.set(mobileNavref.current, {
        x: "-100%",
      });
    }
  }, []);

  useEffect(() => {
    if (!mobileNavref.current) return;
    gsap.killTweensOf(mobileNavref.current);
    gsap.to(mobileNavref.current, {
      x: toggleOpen ? "0%" : "-100%",
      duration: 0.3,
      ease: "power2.out",
    });
  }, [toggleOpen]);

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

  const handleStart = () => {
    if (!isLoggedIn) {
      toast.warn("Login to Play");
      return;
    }
    // setHasSocket(true);
    navigate("/wait");
  };

  return (
    <section className="w-full">
      {width > 640 ? (
        <section className="w-full py-3 px-5 flex justify-between bg-white text-slate-800 items-center">
          <div onClick={() => navigate("/")} className="flex-center">
            <img src="/logo.svg" className="w-[40px] cursor-pointer" />
            <label className="text-2xl cursor-pointer">
              Chess<span className="text-lg">.io</span>
            </label>
          </div>
          {!isLoggedIn ? (
            <div className="flex">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  const decoded: JWTDecoded = jwtDecode(
                    credentialResponse.credential
                  );
                  setPhoto(decoded.picture);
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
            <div className="flex gap-3">
              <div
                className=" border-2 border-slate-800 rounded-full overflow-hidden cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <img src={photo} alt="Profile" className="w-[40px] h-[40px]" />
              </div>
              <div
                className="bg-white text-slate-800 px-3  rounded-full border-2 border-slate-800 cursor-pointer flex-center"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="fixed z-10 text-white  w-[100vw] bg-transparent h-full">
          <div
            onClick={() => setToggleOpen(true)}
            className="absolute p-4 cursor-pointer z-0"
          >
            <SquareMenu size={"40px"} />
          </div>
          <div
            className="w-full flex flex-col gap-5 bg-black bg-opacity-60 h-full absolute z-[5]"
            ref={mobileNavref}
          >
            <div
              className=" absolute right-0 p-4 cursor-pointer"
              onClick={() => setToggleOpen(false)}
            >
              <CircleX />
            </div>
            <div className="bg-white text-slate-800 w-[75%] p-4 h-full gap-6 flex flex-col">
              <div
                className="flex-center cursor-pointer"
                onClick={() => {
                  navigate("/");
                }}
              >
                <img src="/logo.svg" className="w-[40px] cursor-pointer" />
                <label className="text-2xl cursor-pointer">
                  Chess<span className="text-lg">.io</span>
                </label>
              </div>
              <div className="flex flex-col gap-3">
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    setToggleOpen(false);
                    handleStart();
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur group-hover:opacity-100 transition duration-200"
                    aria-hidden="true"
                  ></div>
                  <div
                    className={`relative px-5 py-2 text-lg font-semibold text-gray-900  bg-white rounded-full transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg`}
                  >
                    Play
                  </div>
                </div>
                {!isLoggedIn ? (
                  <div className="flex-center scale-110 relative ">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (!credentialResponse.credential) return;
                        const decoded: JWTDecoded = jwtDecode(
                          credentialResponse.credential
                        );
                        handleLogin(
                          decoded.name,
                          decoded.email,
                          decoded.picture
                        );
                      }}
                      onError={() => {
                        toast.error("Login Failed");
                      }}
                      shape="pill"
                      width={240}
                      theme="filled_blue"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 ">
                    <div
                      className="flex items-center gap-3 border-2 border-slate-800 rounded-full px-3 cursor-pointer"
                      onClick={() => {
                        navigate("/profile");
                        setToggleOpen(false);
                      }}
                    >
                      <div className="my-1 rounded-full overflow-hidden">
                        <img
                          src={photo}
                          alt="Profile-Logo"
                          className="w-[40px] h-[40px]"
                        />
                      </div>
                      Profile
                    </div>
                    <div
                      className="rounded-full border-2 border-slate-800 px-5 py-2 cursor-pointer flex gap-4"
                      onClick={() => {
                        handleLogout();
                        navigate("/");
                        setToggleOpen(false);
                      }}
                    >
                      <LogOut />
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

export default NavBar;
