"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { ReactNode } from "react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Markdown } from "./markdown";
import { ToolInvocation } from "ai";
import { DatasetList } from "./dataset-list";
import { EvaluationCard } from "./evaluation-card";
import { CitationDisplay, MetadataDisplay } from "./dataset-components";

export const TextStreamMessage = ({
  content,
}: {
  content: StreamableValue;
}) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        <BotIcon />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </motion.div>
  );
};

export const Message = ({
  role,
  content,
  toolInvocations,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-6 w-full">
        {content && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content as string}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "searchDatasets" ? (
                      <DatasetList datasets={result} />
                    ) : toolName === "evaluateDataset" ? (
                      <EvaluationCard evaluation={result} />
                    ) : toolName === "generateCitation" ? (
                      <CitationDisplay citation={result} />
                    ) : toolName === "fetchMetadata" ? (
                      <MetadataDisplay metadata={result.metadata} />
                    ) : toolName === "logDecision" ? (
                      <motion.div
                        className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="text-sm text-zinc-700 dark:text-zinc-300">
                          Decision logged: <strong>{result.action}</strong> - {result.reason}
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="text-zinc-500 text-sm">
                    {toolName === "searchDatasets" && "Searching datasets..."}
                    {toolName === "evaluateDataset" && "Evaluating dataset..."}
                    {toolName === "generateCitation" && "Generating citation..."}
                    {toolName === "fetchMetadata" && "Fetching metadata..."}
                    {toolName === "logDecision" && "Logging decision..."}
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
