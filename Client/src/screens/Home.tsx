import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "../components/Common/Button";
import { useContext, useRef } from "react";
import { Crown, Trophy, Users, Zap } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { UserContext } from "../context/userContext";
import { toast } from "react-toastify";


gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLParagraphElement|null>(null);
  const subParaRef = useRef<HTMLParagraphElement|null>(null);

  const userContext = useContext(UserContext);
  if (!userContext) throw new Error("User Context is Undefined in Home");
  const {isLoggedIn} = userContext;
  const pieces = ["♔", "♕", "♖", "♘"];

  useGSAP(() => {
    gsap.to(".logo", {
      y: -25,
      duration: 0.8,
      delay: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });
    gsap.to(".logo-icon", {
      scale: 1.2,
      duration: 0.8,
      delay: 0.5,
      yoyo: true,
      repeat: -1,
      stagger: 0.2,
      ease: "power1.inOut",
    });
    gsap.to(".floating-piece", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      rotation: "random(-15, 15)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 2,
        from: "random",
      },
    });
    
    const dividers = gsap.utils.toArray<HTMLElement>(".divider");

    dividers.forEach((divider) => {
      gsap.from(divider, {
        scaleX: 0,
        duration: 1,
        scrollTrigger: {
          trigger: divider,
          start: "top 87%",
          end: "top 50%",
        },
      });
    });

    const featureCards = gsap.utils.toArray<HTMLElement>(".feat-card");
    featureCards.forEach((card) => {
      gsap.from(card, {
        scale: 0,
        duration: 1,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "top 50%",
        },
      });
    });

    const stats = gsap.utils.toArray<HTMLElement>('.stat-number');
    stats.forEach((stat) => {
      const target = parseInt(stat.dataset.target || "0");
      gsap.to(stat, {
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: stat,
          start: "top 80%",
        }
      });
    });

    if(subTitleRef.current){
      const splitText = new SplitType(subTitleRef.current,{types:"chars"});
      gsap.from(splitText.chars, {
        opacity: 0,
        y: 50,
        stagger: 0.05, // Time delay between each character animation
        duration: 1,
        ease: "power3.out",
      });
    }
    if(subParaRef.current){
      const splitText = new SplitType(subParaRef.current,{types:"chars"});
      gsap.fromTo(splitText.chars,{
        opacity:0.5,
      },{
        opacity:0.9,
        stagger:0.05,
        scale:1.1,
        y:-2,
        duration:1,
        ease:"expo",
        repeat:-1,
      })

    }
  }, []);

  const useHandleStart = () => {
    if(!isLoggedIn){
      toast.warn("Login to Play");
      navigate("/login");
      return;
    }
    // setHasSocket(true);
    navigate("/wait");
  };

  return (
    <section className="w-full flex flex-col background items-center gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={i}
          className="floating-piece absolute text-4xl text-white/10 pointer-events-none shaw"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {pieces[i % pieces.length]}
        </span>
      ))}
      <section className="w-full min-h-screen flex flex-col items-center justify-center relative ">
        <div className="text-white text-center mb-12 p-10 sm:p-20 relative">
          <div className="absolute top-0 left-0">
            <span className="home-peice">{pieces[0]}</span>
          </div>
          <div className="absolute top-0 right-0">
            <span className="home-peice">{pieces[1]}</span>
          </div>
          <div className="absolute bottom-0 left-0">
            <span className="home-peice">{pieces[2]}</span>
          </div>
          <div className="absolute bottom-0 right-0">
            <span className="home-peice">{pieces[3]}</span>
          </div>
          <h1 className="logo text-6xl sm:text-9xl font-bold mb-2">
            Chess<span className="text-4xl sm:text-5xl font-light">.io</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mt-4" ref={subTitleRef}>
            Experience the thrill of online chess
          </p>
        </div>
        <div onClick={useHandleStart}>
          <Button text={"Play Now"} />
        </div>
        <div className="mt-16 text-white text-lg">
          <p ref={subParaRef}>Join thousands of players worldwide</p>
        </div>
      </section>
      <div className="divider h-[2px] bg-white w-[90%]"></div>
      <section className="flex flex-col px-10 my-10 gap-10">
          <h1 className="why title-text text-white text-center " ref={titleRef}>Why Choose Chess.io?</h1>
          <div className="flex flex-col lg:flex-row bg-white p-5 rounded-3xl text-slate-800 gap-4">
            <div className=" border-2 border-slate-800 rounded-3xl p-5 flex feat-card items-center">
              <Trophy size={"50px"} className="logo-icon"/>
              <div className="px-3">
                <h2 className="sub-title-text">Competitive Matches</h2>
                <p className="sub-text">Play against skilled opponents from around the world</p>
              </div>
            </div>
            <div className=" border-2 border-slate-800 rounded-3xl p-5 flex feat-card items-center">
              <Users size={"50px"} className="logo-icon"/>
              <div className="px-3">
                <h2 className="sub-title-text">Global Community</h2>
                <p className="sub-text">Join thousands of chess enthusiasts worldwide</p>
              </div>
            </div>
            <div className=" border-2 border-slate-800 rounded-3xl p-5 flex feat-card items-center">
              <Zap size={"50px"} className="logo-icon"/>
              <div className="px-3">
                <h2 className="sub-title-text">Real-time Matches</h2>
                <p className="sub-text">Experience lag-free gameplay with our advanced system</p>
              </div>
            </div>
          </div>
      </section>
      <div className="divider h-[2px] bg-white w-[90%]"></div>
      <section className="py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="stat-item">
              <h3 className="stat-number text-5xl font-bold mb-2" data-target="1000">0</h3>
              <p className="text-xl">Daily Players</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number text-5xl font-bold mb-2" data-target="5000">0</h3>
              <p className="text-xl">Games Played</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number text-5xl font-bold mb-2" data-target="95">0</h3>
              <p className="text-xl">Player Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
      <div className="h-[2px] bg-white w-[90%] divider"></div>
      <section className="flex flex-col gap-5 bg-white w-[75%] flex-center rounded-3xl p-5 text-slate-800 text-center my-10">
        <Crown size={"100px"}/>
        <h1 className="text-3xl">Ready to Begin Your Journey?</h1>
        <h3 className="text-lg">Join the ultimate online chess experience today</h3>
        <div onClick={useHandleStart} className="relative cursor-pointer hover:scale-110 transition-all duration-100">
          <div className="bg-slate-800 text-white p-5 rounded-full text-2xl ">
            Start Playing Now
          </div>
        </div>
      </section>
      <div className="h-[2px] bg-white w-[90%] divider"></div>
      <footer className="py-8 text-white" >
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Chess.io. All rights reserved.</p>
        </div>
      </footer>
    </section>
  );
}
