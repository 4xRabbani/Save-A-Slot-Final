import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from "@firebase/auth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../firebase/firebase";
import { gsap } from 'gsap';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLightOn, setIsLightOn] = useState(false);
  const eyeLeftRef = useRef(null);
  const eyeRightRef = useRef(null);
  const sunglassesRef = useRef(null);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.replace("/dashboard");
      toast.success("Logged in successfully!", {
        position: "top-center",
      });
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!formRef.current || !eyeLeftRef.current || !eyeRightRef.current) return;

      const formRect = formRef.current.getBoundingClientRect();
      const mouseX = e.clientX - formRect.left;
      const mouseY = e.clientY - formRect.top;

      const eyeLeftRect = eyeLeftRef.current.getBoundingClientRect();
      const eyeRightRect = eyeRightRef.current.getBoundingClientRect();

      // Calculate angles for each eye
      const angleLeft = Math.atan2(
          mouseY - (eyeLeftRect.top - formRect.top + eyeLeftRect.height / 2),
          mouseX - (eyeLeftRect.left - formRect.left + eyeLeftRect.width / 2)
      );

      const angleRight = Math.atan2(
          mouseY - (eyeRightRect.top - formRect.top + eyeRightRect.height / 2),
          mouseX - (eyeRightRect.left - formRect.left + eyeRightRect.width / 2)
      );

      // Maximum eye movement in pixels
      const maxMove = 3;

      // Calculate eye movements
      const leftX = Math.cos(angleLeft) * maxMove;
      const leftY = Math.sin(angleLeft) * maxMove;
      const rightX = Math.cos(angleRight) * maxMove;
      const rightY = Math.sin(angleRight) * maxMove;

      // Only animate eyes if sunglasses are not down
      if (!password) {
        gsap.to(eyeLeftRef.current, { x: leftX, y: leftY, duration: 0.3 });
        gsap.to(eyeRightRef.current, { x: rightX, y: rightY, duration: 0.3 });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [password]);

  const handlePasswordFocus = () => {
    // Drop sunglasses from above
    gsap.fromTo(sunglassesRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out" }
    );
    setIsLightOn(true);
  };

  const handlePasswordBlur = () => {
    // Lift sunglasses up if password field is empty
    if (!password) {
      gsap.to(sunglassesRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.3
      });
    }
    setIsLightOn(false);
  };

  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
              {/* Background rays and gradients */}
              <defs>
                <radialGradient id="rayGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: isLightOn ? 0.8 : 0.5}}/>
                  <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}}/>
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                {/* Sunglasses reflection gradient */}
                <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#4eb8dd', stopOpacity: 0.2}}/>
                  <stop offset="100%" style={{stopColor: '#217093', stopOpacity: 0.1}}/>
                </linearGradient>
              </defs>

              {/* Light rays */}
              <path d="M100 40 L120 0 L80 0 Z" fill="url(#rayGradient)" opacity={isLightOn ? "0.7" : "0.3"} />
              <path d="M160 100 L200 80 L200 120 Z" fill="url(#rayGradient)" opacity={isLightOn ? "0.7" : "0.3"} />
              <path d="M40 100 L0 80 L0 120 Z" fill="url(#rayGradient)" opacity={isLightOn ? "0.7" : "0.3"} />

              {/* Main face */}
              <circle cx="100" cy="100" r="60" fill="white" stroke="#1B3C59" strokeWidth="8"/>

              {/* Lighthouse top structure */}
              <g filter="url(#glow)">
                <path d="M70 45 L130 45 L140 60 L60 60 Z" fill="#1B3C59"/>
                <path d="M80 30 L120 30 L130 45 L70 45 Z" fill="#1B3C59"/>
                <circle cx="100" cy="25" r="8" fill="#1B3C59"/>

                {/* Window */}
                <path
                    d="M75 47 L125 47 L130 60 L70 60 Z"
                    fill={isLightOn ? "#FFF7C0" : "#FFD700"}
                    className="transition-colors duration-300"
                />

                {/* Window grid */}
                <path d="M85 47 L85 60" stroke="#1B3C59" strokeWidth="1"/>
                <path d="M100 47 L100 60" stroke="#1B3C59" strokeWidth="1"/>
                <path d="M115 47 L115 60" stroke="#1B3C59" strokeWidth="1"/>
              </g>

              {/* Face features */}
              <g transform="translate(100,100)">
                {/* Eyes */}
                <g ref={eyeLeftRef}>
                  <ellipse cx="-20" cy="0" rx="12" ry="15" fill="#1B3C59"/>
                  <circle cx="-16" cy="-4" r="4" fill="white"/>
                </g>
                <g ref={eyeRightRef}>
                  <ellipse cx="20" cy="0" rx="12" ry="15" fill="#1B3C59"/>
                  <circle cx="24" cy="-4" r="4" fill="white"/>
                </g>

                {/* Cool Sunglasses - Made larger to fully cover eyes */}
                <g ref={sunglassesRef} opacity="0" style={{transformOrigin: '50% 50%'}}>
                  {/* Left Lens - made taller and wider */}
                  <path d="M-35 -10 L-5 -10 L-8 25 L-32 25 Z" fill="#1B3C59"/>
                  <path d="M-33 -8 L-7 -8 L-9 23 L-31 23 Z" fill="url(#lensGradient)"/>

                  {/* Right Lens - made taller and wider */}
                  <path d="M5 -10 L35 -10 L32 25 L8 25 Z" fill="#1B3C59"/>
                  <path d="M7 -8 L33 -8 L31 23 L9 23 Z" fill="url(#lensGradient)"/>

                  {/* Bridge - moved up slightly */}
                  <path d="M-5 5 L5 5" stroke="#1B3C59" strokeWidth="3"/>

                  {/* Temple Arms - adjusted position */}
                  <path d="M-35 5 L-45 0" stroke="#1B3C59" strokeWidth="3"/>
                  <path d="M35 5 L45 0" stroke="#1B3C59" strokeWidth="3"/>
                </g>

                {/* Smile */}
                <path
                    d="M-25 15 Q0 35 25 15"
                    fill="none"
                    stroke="#1B3C59"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Form inputs */}
          <div className="mb-6">
            <label className="block text-darkBlue text-lg font-bold mb-2">
              Email
            </label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 px-4 text-lg bg-inputBG border-2 border-darkBlue rounded-md focus:border-medBlue focus:outline-none focus:shadow-md transition-all duration-200"
                placeholder="email@domain.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-darkBlue text-lg font-bold mb-2">
              Password
            </label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                className="w-full h-16 px-4 text-lg bg-inputBG border-2 border-darkBlue rounded-md focus:border-medBlue focus:outline-none focus:shadow-md transition-all duration-200"
            />
          </div>

          <button
              type="submit"
              className="w-full h-16 bg-medBlue hover:bg-darkBlue text-white text-lg font-semibold rounded-md transition-colors duration-200"
          >
            Login
          </button>

          <div className="mt-4 text-right">
            <Link to="/register" className="text-darkBlue hover:text-medBlue">
              Register here...
            </Link>
          </div>
        </form>
      </div>
  );
};

export default SignIn;
