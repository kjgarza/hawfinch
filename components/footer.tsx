"use client";

import { motion } from "framer-motion";

const author = {
  name: "Kristian Garza",
  email: "kj.garza+kjgarza@gmail.com",
  figma: "https://www.figma.com/@kristiangarza",
  github: "https://github.com/kristiangarza",
  linkedin: "https://www.linkedin.com/in/kjgarza?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=website",
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-zinc-800 dark:text-zinc-300 flex w-full max-w-4xl flex-col items-center justify-between gap-1 px-4 pt-8 pb-8 font-mono font-medium sm:pb-8 md:px-12 xl:px-8"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4">
          <a 
            className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors" 
            target="_blank" 
            href={author.figma}
            rel="noopener noreferrer"
          >
            Figma
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 dark:text-zinc-500">·</span>
          <a 
            className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors" 
            target="_blank" 
            href={author.github}
            rel="noopener noreferrer"
          >
            Github
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 dark:text-zinc-500">·</span>
          <a 
            className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors" 
            target="_blank" 
            href={author.linkedin}
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 dark:text-zinc-500">·</span>
          <a 
            className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors" 
            target="_blank" 
            href={`mailto:${author.email}`}
            rel="noopener noreferrer"
          >
            Email
          </a>
        </div>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        Copyright © {currentYear} {author.name}
      </p>
    </motion.footer>
  );
}