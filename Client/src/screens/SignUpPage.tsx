import { FormEvent, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosC } from "../AxiosConfig";
import { SHA256 } from "crypto-js";
import { SignUpResponse } from "../types/auth";


const SignUpPage = () => {
    const [name,setName] = useState<string>("");
    const [email,setEmail] = useState<string>("");
    const [pass,setPass] = useState<string>("");
    const [photo,setPhoto] = useState<string>("");

    const passRef = useRef<HTMLInputElement | null>(null);
    const logoRef = useRef<HTMLImageElement | null>(null); 

    const navigate = useNavigate();

    const toggleShowPass = () => {
        if(!passRef.current) return;
        passRef.current.type = 
        passRef.current?.type == "password" ? "text" : "password"; 
    }

    const handleSignUp = async (e:FormEvent) => {
        e.preventDefault(); 
        try{
          const hashedPass = SHA256(pass).toString();
          const response = await axiosC.post<SignUpResponse>("/auth/signup",{
            username: name.toLocaleLowerCase(),
            password: hashedPass,
            email: email.toLocaleLowerCase(),
            photo:photo
          }); 
          const res = response.data;
          if(!res.success){
            toast.error(res.message);
            return;
          }
          toast.success("Signup Successfull");
          navigate("/login");
        }catch(error){
          console.log("Error in SignUp: ", error);
          toast.error("Internal Server Error");
        }
    }
    
    useGSAP(()=>{
      if(!logoRef.current) return;
      gsap.to(logoRef.current,{
        rotate:6,
        duration:1,
        repeat:-1,
        yoyo:true,
        ease:"none",
      },)
    })
    

    return (
    <section className="absolute w-full h-full background text-white flex-center p-5 mb-5">
        <div className="bg-slate-200 text-black h-[88vh] w-full sm:w-[90vw] sm:h-full md:p-[5vw] rounded-[70px] flex overflow-y-hidden flex-center translate-y-5">
          <section className="flex-center flex-col w-full md:w-[50%]">
                <div className="flex-center flex-col w-[70%] ">
                    <h1 className="title-text">Chess<span className="text-[25px]">.io</span></h1>
                </div>
            <form className="flex-center flex-col gap-3 w-full  sm:p-3" onSubmit={(e)=>handleSignUp(e)}>
                <div className="flex flex-col gap-2 w-[75%] sub-text" >
                    <label>Username</label>
                    <input type="text" placeholder="Eg: abc@gmail.com or IamMagnus" className="rounded-2xl px-3 py-2 " value={name} onChange={(e)=>setName(e.target.value)} maxLength={15} minLength={5}/>
                </div>
                <div className="flex flex-col gap-2 w-[75%] sub-text">
                  <label>Profile Photo Link (Optional) </label>
                  <input type="text"   className="rounded-2xl px-3 py-2" placeholder="Enter your profile photo's public url here" value={photo} onChange={(e)=>setPhoto(e.target.value)}/>
                </div>
                <div className="flex flex-col gap-2 w-[75%] sub-text" >
                    <label>Email</label>
                    <input type="email" placeholder="Eg: abc@gmail.com or IamMagnus" className="rounded-2xl px-3 py-2 " value={email} onChange={(e)=>setEmail(e.target.value)}/>
                </div>
                <div className="flex flex-col gap-4 w-[75%] sub-text">
                    <div className="flex flex-col gap-2">
                        <label>Password</label>
                        <input type="password" placeholder="Enter your passsword" className="rounded-2xl px-3 py-2" value={pass} onChange={(e)=>setPass(e.target.value)} ref={passRef} minLength={8} />
                    </div>
                    <div className="flex gap-2">
                    <input type="checkbox" onChange={toggleShowPass}/>
                    <label htmlFor="">Show Password</label>
                    </div>
                </div>
                <div className="flex-center w-[75%] justify-between sub-text">
                    <div className="flex">
                    Already have an account? &nbsp;<div onClick={()=>navigate("/login")} className="text-blue-700 cursor-pointer">Login</div>
                    </div>
                </div>
                <div className="relative w-full flex-center my-2">
                    <div
                    className="absolute w-3/5 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-200 "
                    aria-hidden="true"
                    ></div>
                    <button className="relative w-3/5 text-center bg-gray-800 text-white py-2 rounded-full text-2xl">
                        Sign Up
                    </button>
                </div>
            </form>
          </section>
            <div className="hidden md:w-[50%] md:flex h-full border-l-2 border-black md:flex-center">
                <img src="/logo.svg" alt="" ref={logoRef} className="-rotate-6"/>
            </div>
        </div>
    </section>
  )
}

export default SignUpPage;