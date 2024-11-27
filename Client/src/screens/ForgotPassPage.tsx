import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { axiosC } from "../AxiosConfig";
import { AuthResponse, OTPResponse } from "../types/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { SHA256 } from "crypto-js";

// const formPage = () => {
//   return ()
// }

const GetEmail = ({
  namemail,
  setNamemail,
  setEmail,
  setSentOTP
}: {
  namemail: string;
  setNamemail: (val: string) => void;
  setEmail: (val: string) => void;
  setSentOTP : (val:boolean) => void
}) => {
  const getOTP = async () => {
    try {
        if(!namemail) {
          toast.error("Username/Email is Empty");
          return;
        }
        const response = await axiosC.post("/auth/sendOTP",{namemail:namemail.toLocaleLowerCase()});
        const res:OTPResponse = response.data;
        if(res.success){
          if(!res.data) return;
          setEmail(res.data.email);
          setSentOTP(true);
          toast.success("OTP Sent to mail successfully");
        }else{
          toast.error(res.message);
        }
    } catch (error) {
      console.log("Client error while sending OTP: " ,error);
      toast.error("Internal Server Error");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 w-[75%] sub-text">
        <label>Username/Email</label>
        <input
          type="text"
          placeholder="Enter your username or email"
          className="rounded-2xl px-3 py-2"
          value={namemail}
          onChange={(e) => setNamemail(e.target.value)}
        />
      </div>
      <div className="relative w-full flex-center my-2">
        <div
          className="absolute w-3/5 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-200 "
          aria-hidden="true"
        ></div>
        <button className="relative w-3/5 text-center bg-gray-800 text-white py-2 rounded-full text-2xl" onClick={getOTP}>
          Get OTP
        </button>
      </div>
    </>
  );
};

const SubmitOTP = ({
  email,
  setCanChange,
}: {
  email: string;
  setCanChange: (val: boolean) => void;
}) => {
  const [inp, setInp] = useState<string>("");

  const validateOTP = async () => {
    try {
        if(!inp) {
          toast.error("OTP is Empty");
          return;
        }
        const response = await axiosC.post("/auth/validateOTP",{email,otp:inp});
        const res:AuthResponse = response.data;
        if(res.success){
          setCanChange(true);
          toast.success("OTP verified successfully");
        }else{
          toast.error(res.message);
        }
    } catch (error) {
      console.log("Client error while validating OTP: " ,error);
      toast.error("Internal Server Error");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 w-[75%] sub-text">
        <label>
          Enter 6-digit OTP sent to your email ({"xxxx" + email.slice(-15)} )
        </label>
        <input
          type="text"
          placeholder="Eg: 123456"
          className="rounded-2xl px-3 py-2"
          value={inp}
          onChange={(e) => setInp(e.target.value)}
        />
      </div>
      <div className="relative w-full flex-center my-2">
        <div
          className="absolute w-3/5 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-200 "
          aria-hidden="true"
        ></div>
        <button className="relative w-3/5 text-center bg-gray-800 text-white py-2 rounded-full text-2xl" onClick={validateOTP}>
          Submit
        </button>
      </div>
    </>
  );
};

const ChangePass = ({ email }: { email: string }) => {
  const [pass, setPass] = useState<string>("");
  const passRef1 = useRef<HTMLInputElement | null>(null);
  const passRef2 = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const toggleShowPass = () => {
    if (!passRef1.current || !passRef2.current) return;
    passRef1.current.type =
      passRef1.current.type == "password" ? "text" : "password";
    passRef2.current.type =
      passRef2.current.type == "password" ? "text" : "password";
  };

  const updatePass = async () => {
    if(!passRef1.current?.value || !passRef2.current?.value){
      toast.error("Password is empty");
      return;
    }
    if(passRef1.current?.value != passRef2.current?.value){
      toast.error("Passwords are not matching");
      return;
    }
    try{
      const hashedPass = SHA256(pass).toString();
      const response = await axiosC.post("/auth/updatePass",{email,password:hashedPass});
      const res:AuthResponse = response.data;
      if(res.success){
        toast.success("Password Updated successfully");
        navigate("/login");
      }else{
        toast.error(res.message);
      }
    }catch(error){
      console.log("Error while updating passwords: " ,error);
      toast.error("Internal Server Error");
    }
  }

  return (
    <>
      <div className="flex-center flex-col w-full gap-3">
        <label>Email: {email}</label>
        <div className="flex flex-col gap-4 w-[75%] sub-text">
          <div className="flex flex-col gap-2">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter your new passsword"
              className="rounded-2xl px-3 py-2"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              ref={passRef1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm your passsword"
              className="rounded-2xl px-3 py-2"
              ref={passRef2}
            />
          </div>
          <div className="flex gap-2">
            <input type="checkbox" onChange={toggleShowPass} />
            <label htmlFor="">Show Password</label>
          </div>
        </div>
      </div>
      <div className="relative w-full flex-center my-2">
        <div
          className="absolute w-3/5 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-200 "
          aria-hidden="true"
        ></div>
        <button className="relative w-3/5 text-center bg-gray-800 text-white py-2 rounded-full text-2xl" onClick={updatePass}>
          Submit
        </button>
      </div>
    </>
  );
};

const ForgotPassPage = () => {
  const [namemail, setNamemail] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [canChange, setCanChange] = useState<boolean>(false);
  const [sentOTP,setSentOTP] = useState<boolean>(false);
  const logoRef = useRef<HTMLImageElement|null>(null);

  useGSAP(()=>{
    if(!logoRef.current) return;
    gsap.to(logoRef.current,{
      x:15,
      y:-15,
      duration:1,
      repeat:-1,
      yoyo:true,
      ease:"none"
    })
  },[]);

  return (
    <section className="absolute w-full h-full background text-white flex-center p-5">
      <div className="bg-slate-200 text-black h-full w-full sm:w-[90vw] sm:h-[90vh]  md:p-[5vw] rounded-[70px] flex overflow-y-hidden">
        <div className="hidden md:w-[50%] md:flex h-full border-r-2 border-black md:flex-center">
          <img src="/passkey.svg" alt="" className="w-[75%]" ref={logoRef}/>
        </div>
        <div className="flex-center flex-col gap-5 w-full md:w-[50%] sm:p-5">
          <div className="flex-center flex-col gap-2 w-[70%] pb-5">
            <h1 className="title-text">
              Chess<span className="text-[25px]">.io</span>
            </h1>
            <h1 className="sub-text text-center">
              &nbsp;&nbsp;&nbsp;Login to be Known 👑
            </h1>
          </div>
          {!canChange ? (
            !sentOTP ? (
              <GetEmail
                namemail={namemail}
                setNamemail={setNamemail}
                setSentOTP={setSentOTP}
                setEmail={setEmail}
              />
            ) : (
              <SubmitOTP email={email} setCanChange={setCanChange} />
            )
          ) : (
            <ChangePass email={email} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassPage;
