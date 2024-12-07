import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { CircleX, LogOut, SquareMenu } from "lucide-react";
import { axiosC } from "../../AxiosConfig";
import { AuthResponse } from "../../types/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const NavBar = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [toggleOpen, setToggleOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("User context not accessible");
  }
  const { isLoggedIn, setIsLoggedIn, setUsername, setAccessToken, setExpiry,photo } =
    userContext;

  useEffect(() => {
    const handleWidth = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axiosC.post("/auth/logout");
      const res: AuthResponse = response.data;
      if (res.success) {
        setIsLoggedIn(false);
        setUsername("");
        setExpiry(0);
        setAccessToken("");

        //Clear cookies
        Cookies.remove('username');
        Cookies.remove('accessToken');
        Cookies.remove('expiry');
        Cookies.remove("photo");

        toast.success("Successfully Logged out");
      }
    } catch (error) {
      console.log("Error while logout : ", error);
    }
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
            <div className="flex gap-5 items-center">
              <div
                className="bg-slate-800 text-white px-3 py-2 rounded-full cursor-pointer "
                onClick={() => navigate("/signup")}
              >
                Signup
              </div>
              <div
                className="rounded-full border-2 border-slate-800 px-3 py-2 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <div
                className="w-[40px] border-2 border-slate-800 rounded-full overflow-hidden cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <img
                  src={photo ? photo : "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?…"}
                  alt="Profile-Logo"
                />
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
        <section className="fixed z-10 text-white  w-[100vw] bg-transparent h-[100vh]">
          {!toggleOpen ? (
            <div onClick={() => setToggleOpen(true)} className="p-4 cursor-pointer">
              <SquareMenu size={"40px"} />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-5 bg-black bg-opacity-60 h-full ">
              <div
                className=" absolute right-0 p-4 cursor-pointer"
                onClick={() => setToggleOpen(false)}
              >
                <CircleX />
              </div>
              <div className="bg-white text-slate-800 w-[75%] p-4 h-full gap-6 flex flex-col">
                <div
                className="flex-center cursor-pointer" onClick={()=>{
                    navigate("/");
                }}>
                  <img src="/logo.svg" className="w-[40px] cursor-pointer" />
                  <label className="text-2xl cursor-pointer">
                    Chess<span className="text-lg">.io</span>
                  </label>
                </div>
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => {
                        navigate("/");
                        setToggleOpen(false);
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
                    <div
                      className="bg-slate-800 text-white px-5 py-2 rounded-full cursor-pointer"
                      onClick={() => {
                        navigate("/signup");
                        setToggleOpen(false);
                      }}
                    >
                      Signup
                    </div>
                    <div
                      className="rounded-full border-2 border-slate-800 px-5 py-2 cursor-pointer"
                      onClick={() => {
                        navigate("/login");
                        setToggleOpen(false);
                      }}
                    >
                      Login
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 ">
                    <div className="flex items-center gap-3 border-2 border-slate-800 rounded-full px-3 cursor-pointer" onClick={()=>{
                        navigate("/profile");
                        setToggleOpen(false);
                    }}>
                      <div className="w-[40px] rounded-full overflow-hidden ">
                        <img
                          src="https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?…"
                          alt="Profile-Logo"
                        />
                      </div>
                      Profile
                    </div>

                    <div
                      className="rounded-full border-2 border-slate-800 px-5 py-2 cursor-pointer flex gap-4"
                      onClick={() => {
                        handleLogout()
                        navigate("/");
                        setToggleOpen(false);
                      }}
                    >
                        <LogOut/>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
};

export default NavBar;
