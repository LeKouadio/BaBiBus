import React from 'react';
import { motion } from 'motion/react';
import { Bus, MapPin, Navigation, Clock } from 'lucide-react';

export const AuthBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Gradient Base */}
      <div className="absolute inset-0 bg-background transition-colors duration-300" />
      
      {/* Animated Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[100px] opacity-60"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-green-500/10 blur-[120px] opacity-50"
      />

      {/* Floating Icons */}
      <FloatingIcon icon={<Bus className="w-8 h-8" />} top="15%" left="10%" delay={0} />
      <FloatingIcon icon={<MapPin className="w-6 h-6" />} top="45%" right="15%" delay={2} />
      <FloatingIcon icon={<Navigation className="w-7 h-7" />} bottom="20%" left="20%" delay={4} />
      <FloatingIcon icon={<Clock className="w-5 h-5" />} top="30%" right="25%" delay={1} />
      <FloatingIcon icon={<Bus className="w-6 h-6" />} bottom="15%" right="10%" delay={3} />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
      />
    </div>
  );
};

const FloatingIcon = ({ icon, top, left, right, bottom, delay }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1],
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      x: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: 8 + Math.random() * 4, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    style={{ position: 'absolute', top, left, right, bottom }}
    className="text-foreground/20"
  >
    {icon}
  </motion.div>
);
