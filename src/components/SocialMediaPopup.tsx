import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram, faFacebook, faGithub, faThreads } from '@fortawesome/free-brands-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const SocialMediaPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shouldHide = localStorage.getItem('kanata_hide_social_popup');
    if (!shouldHide) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('kanata_hide_social_popup', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-reveal"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#161618] border border-white/10 p-8 md:p-12 max-w-lg w-full rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
        {/* Abstract Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--primary)]/20">
              <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse"></span>
              Social Update
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Join The <span className="text-[var(--primary)]">Squad</span>
            </h2>
            <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xs mx-auto">
              Ikuti kami untuk update anime terbaru dan informasi server tercepat.
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { icon: faWhatsapp, href: "https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m", label: "WhatsApp" },
              { icon: faInstagram, href: "https://instagram.com/kang.potokopi", label: "Instagram" },
              { icon: faFacebook, href: "https://facebook.com/kang.potokopi", label: "Facebook" },
              { icon: faGithub, href: "https://github.com/idlanyor", label: "GitHub" },
              { icon: faThreads, href: "https://threads.net/kang.potokopi", label: "Threads" }
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl text-white/60 hover:bg-[var(--primary)] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
                title={social.label}
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <button
              onClick={handleClose}
              className="iq-btn-primary w-full py-3.5 text-sm"
            >
              Siap, Lanjutkan!
            </button>
            <button
              onClick={handleDontShowAgain}
              className="text-white/20 hover:text-white/40 text-[10px] font-bold uppercase tracking-widest transition-colors py-2"
            >
              Jangan tampilkan lagi
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
};

export default SocialMediaPopup;
