import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
    setProgress(30);
    
    const timer1 = setTimeout(() => setProgress(60), 200);
    const timer2 = setTimeout(() => setProgress(90), 400);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 z-[9999] transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
};

export default LoadingProgress;
