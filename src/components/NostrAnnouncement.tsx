"use client";

import { useState, useEffect } from "react";
import NostrIcon from "./ui/icons/nostr-icon";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export const NostrAnnouncement = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Check if the announcement has been dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem("nostrAnnouncementDismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nostrAnnouncementDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative w-full rounded-lg overflow-hidden my-6"
      >
        <div className="bg-purple-600 p-4 rounded-lg shadow-lg border-l-4 border-l-purple-800 mb-0 md:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <NostrIcon className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex items-center">
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 mr-3 text-[10px] md:text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                  NEW
                </span>
                <h3 className="text-white font-medium text-xs md:text-lg">
                  Pillars can now add their Nostr public keys!
                </h3>
              </div>
            </div>
            
            <motion.button
              whileHover={{ 
                scale: 1.3,
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{
                rotate: { duration: 0.5 },
                scale: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1"
              aria-label="Dismiss announcement"
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NostrAnnouncement;
