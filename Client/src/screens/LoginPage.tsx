import { FormEvent, useContext, useRef, useState } from "react";
import { UserContext } from "../context/userContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosC } from "../AxiosConfig";
import { SHA256 } from "crypto-js";
import { LoginResponse } from "../types/auth";
import Cookies from "js-cookie";

const LoginPage = () => {
  const [namemail, setNamemail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const navigate = useNavigate();

  const passRef = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  const userContext = useContext(UserContext);
  if (!userContext) throw Error("User Context Not accessible in login");
  const { setUsername, setAccessToken, setExpiry, setIsLoggedIn, setPhoto } =
    userContext;

  const toggleShowPass = () => {
    if (!passRef.current) return;
    passRef.current.type =
      passRef.current?.type == "password" ? "text" : "password";
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const hashedPass = SHA256(pass).toString();
      const response = await axiosC.post<LoginResponse>("/auth/login", {
        username: namemail.toLocaleLowerCase(),
        password: hashedPass,
        email: namemail,
      });

      const res = response.data;

      if (res.success) {
        setUsername(res.data!.username);
        setAccessToken(res.data!.accessToken);
        setExpiry(res.data!.expiresAt);
        setIsLoggedIn(true);
        setPhoto(res.data.photo);

        //Set Cookies
        Cookies.set("username", res.data!.username, {
          expires: new Date(res.data!.expiresAt),
          path:"/"
        });
        Cookies.set("accessToken", res.data!.accessToken, {
          expires: new Date(res.data!.expiresAt),
          path:"/"
        });
        Cookies.set("expiry", res.data!.expiresAt+"", {
          expires: new Date(res.data!.expiresAt),
          path:"/"
        });
        Cookies.set("photo", res.data!.photo, {
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
    }
  };

  useGSAP(() => {
    if (!logoRef.current) return;
    gsap.to(logoRef.current, {
      y: -30,
      delay: 1,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "circ",
    });
  }, []);

  return (
    <section className="absolute w-full h-full background text-white flex-center p-5">
      <div className="bg-slate-200 text-black h-[80vh] w-full sm:w-[90vw] sm:h-[90vh]  md:p-[5vw] rounded-[70px] flex overflow-y-hidden">
        <div className="hidden md:w-[50%] md:flex h-full border-r-2 border-black">
          <img src="/logo.svg" alt="" className="" ref={logoRef} />
        </div>
        <form
          className="flex-center flex-col gap-5 w-full md:w-[50%] sm:p-5"
          onSubmit={(e) => handleLogin(e)}
        >
          <div className="flex-center flex-col gap-2 w-[70%] pb-5">
            <h1 className="title-text">
              Chess<span className="text-[25px]">.io</span>
            </h1>
            <h1 className="sub-text text-center">
              &nbsp;&nbsp;&nbsp;Login to be Known 👑
            </h1>
          </div>
          <div className="flex flex-col gap-2 w-[75%] sub-text">
            <label>Username/Email</label>
            <input
              type="text"
              placeholder="Eg: abc@gmail.com or IamMagnus"
              className="rounded-2xl px-3 py-2 "
              value={namemail}
              onChange={(e) => setNamemail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 w-[75%] sub-text">
            <div className="flex flex-col gap-2">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your passsword"
                className="rounded-2xl px-3 py-2"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                ref={passRef}
              />
            </div>
            <div className="flex gap-2">
              <input type="checkbox" onChange={toggleShowPass} />
              <label htmlFor="">Show Password</label>
            </div>
          </div>
          <div className="flex w-[75%] justify-between sub-text gap-2">
            <div className="">
              Don't have an account?&nbsp;
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-700 cursor-pointer"
              >
                Signup
              </span>
            </div>
            <div>
              <div
                onClick={() => navigate("/forgot")}
                className="cursor-pointer"
              >
                Forgot password ?
              </div>
            </div>
          </div>
          <div className="relative w-full flex-center my-2">
            <div
              className="absolute w-3/5 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-200 "
              aria-hidden="true"
            ></div>
            <button className="relative w-3/5 text-center bg-gray-800 text-white py-2 rounded-full text-2xl">
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
