"use client";

import { useRef } from "react";
import { Message } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { MasonryIcon, VercelIcon } from "@/components/icons";
import Link from "next/link";
import { useChat } from "ai/react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Home() {
  const { messages, handleSubmit, input, setInput, append } = useChat();

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const suggestedActions = [
    {
      title: "Find datasets",
      label: "about climate change",
      action: "I need to find open datasets related to climate change with CSV format and permissive licensing",
    },
    {
      title: "Search for",
      label: "genomics data",
      action: "Search for genomics datasets published in the last 2 years with open access licenses",
    },
    {
      title: "Evaluate dataset",
      label: "compatibility",
      action: "Can you evaluate if dataset ds-001 meets my requirements for machine learning research?",
    },
    {
      title: "Generate citation",
      label: "for dataset",
      action: "Generate an APA citation for the climate change dataset I found",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-row justify-center pb-5 h-dvh bg-white dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-4">
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-6 h-full w-dvw items-center overflow-y-scroll"
          >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className=" rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                {/* Font-based headline replacing icons */}
                <div className="flex flex-col justify-center items-center text-zinc-900 dark:text-zinc-50">
                  <h1 className="text-3xl md:text-4xl font-normal leading-tight" style={{ fontFamily: '"Noto Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
                    Dataset Finder
                  </h1>
                  <h2 className="text-xl md:text-2xl mt-2" style={{ fontFamily: '"Alfa Slab One"' }}>
                    Stop Searching. Start Finding.
                  </h2>
                </div>
                <p>
                  This Dataset Discovery & Evaluation Agent helps scientists 
                  find, evaluate, and acquire research datasets efficiently. The 
                  AI uses the maxSteps parameter to automatically chain multiple 
                  tool calls for comprehensive dataset analysis.
                </p>
                <p>
                  Ask me to search datasets, evaluate compatibility, generate 
                  citations, or help with any aspect of dataset discovery for 
                  your research needs. Learn more about{" "}
                  <Link
                    className="text-blue-500 dark:text-blue-400"
                    href="https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls"
                    target="_blank"
                  >
                    Multiple Tool Steps{" "}
                  </Link>
                  from the Vercel AI SDK.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              toolInvocations={message.toolInvocations}
            ></Message>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px] mb-4">
          {messages.length === 0 &&
            suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />
        </form>
          <div className="flex flex-col gap-2 relative items-center">
            <Footer  />
          </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
