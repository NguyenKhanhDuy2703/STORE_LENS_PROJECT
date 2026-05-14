import { useState } from 'react';
import { motion } from 'framer-motion';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import logoSL from '../../../assets/logoSL.png';

const Authentication = () => {
  const [mode, setMode] = useState('signin');

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4 py-8">
      {/* Blob decorations */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-100/70 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

      {/* Logo watermark — nằm phía sau form, mờ và float nhẹ */}
      <motion.img
        src={logoSL}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute select-none"
        style={{
          width: "520px",
          opacity: 0.07,
          filter: "blur(2px) grayscale(20%)",
          zIndex: 1,
        }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Form content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium tracking-tight text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            SpaceLens Truy cập
          </div>
        </div>

        {mode === 'signin' ? (
          <SignIn onSwitchToSignUp={() => setMode('signup')} />
        ) : (
          <SignUp onSwitchToSignIn={() => setMode('signin')} />
        )}
      </div>
    </div>
  );
};

export default Authentication;