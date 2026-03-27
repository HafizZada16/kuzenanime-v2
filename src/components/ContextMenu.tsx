import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ContextMenu = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Detection via debugger (Pauses execution if DevTools is open)
    const detectDevTools = () => {
      const start = new Date().getTime();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = new Date().getTime();
      if (end - start > 100) {
        setIsDevToolsOpen(true);
      }
    };

    // 2. Detection via console property access (Classic trick)
    const detectViaConsole = () => {
      const devtools = {
        isOpen: false,
        orientation: undefined
      };
      const threshold = 160;

      const emitEvent = (isOpen: boolean) => {
        if (isOpen) setIsDevToolsOpen(true);
      };

      // Create a dummy element with a getter for its id
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          devtools.isOpen = true;
          emitEvent(true);
          return 'devtools';
        }
      });

      // Periodically log the element to trigger the getter if console is open
      console.log(element);
      console.clear();
    };

    // 3. More aggressive detection for mobile/Kiwi
    const detectViaPerformance = () => {
      // High frequency check for debugger lag
      setInterval(() => {
        const t1 = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const t2 = performance.now();
        if (t2 - t1 > 100) {
          setIsDevToolsOpen(true);
        }
      }, 500);
    };

    // 4. Block Eruda (Mobile DevTools)
    const detectEruda = () => {
      // Check for Eruda global or container
      if ((window as any).eruda || document.getElementById('eruda')) {
        setIsDevToolsOpen(true);
        // Try to destroy/remove eruda if possible
        if ((window as any).eruda) {
          try {
            (window as any).eruda.destroy();
          } catch (e) { }
        }
      }
    };

    // 5. Detection via window size/orientation threshold
    const checkSize = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      }
    };

    const interval = setInterval(() => {
      detectDevTools();
      checkSize();
      detectViaConsole();
      detectEruda();
    }, 1000);

    detectViaPerformance();

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setVisible(true);

      const menuWidth = 200;
      const menuHeight = 250;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) x -= menuWidth;
      if (y + menuHeight > window.innerHeight) y -= menuHeight;

      setPosition({ x, y });
    };

    const handleClick = () => setVisible(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        setIsDevToolsOpen(true);
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', checkSize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkSize);
    };
  }, []);

  if (isDevToolsOpen) {
    const handleExit = () => {
      // Refresh the page to reset the dev tools detection
      window.location.reload();
    };

    return (
      <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-8 overflow-hidden">
        <div className="max-w-2xl w-full bg-[#FF3B30] border-8 border-black p-10 shadow-[20px_20px_0px_0px_#FFCC00] transform -rotate-2 text-center">
          <h1 className="text-6xl md:text-8xl font-black oswald text-white mb-6 uppercase leading-none italic">
            ACCESS<br />DENIED
          </h1>
          <div className="bg-white border-4 border-black p-4 mb-8 transform rotate-1">
            <p className="text-black font-black oswald text-xl md:text-2xl uppercase">
              Developer tools detected. Please close them to continue browsing KuzenAnime V2.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <div className="animate-bounce bg-black text-[#FFCC00] px-6 py-2 border-4 border-white font-black oswald text-lg">
              SYSTEM LOCKED
            </div>
            <button
              onClick={handleExit}
              className="bg-white text-black px-6 py-2 border-4 border-black font-black oswald text-lg hover:bg-gray-200 transition-colors"
            >
              EXIT
            </button>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF3B30, #FF3B30 20px, #000 20px, #000 40px)' }}></div>
      </div>
    );
  }

  if (!visible) return null;

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'List', path: '/list' },
    { name: 'Ongoing', path: '/ongoing' },
    { name: 'Complete', path: '/complete' },
    { name: 'Genre', path: '/genre' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[300] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-48 oswald font-black"
      style={{ top: position.y, left: position.x }}
    >
      <div className="bg-[#FFCC00] border-b-4 border-black p-2 text-black text-sm italic">
        QUICK NAVIGATION
      </div>
      <ul className="py-1 text-black">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-2 hover:bg-[#FF3B30] hover:text-white transition-colors uppercase flex items-center justify-between group"
            >
              {item.name}
              <span className="opacity-0 group-hover:opacity-100">→</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t-4 border-black p-2 text-[10px] bg-black text-white text-center">
        © KUZENANIME V2
      </div>
    </div>
  );
};

export default ContextMenu;
