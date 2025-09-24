"use client";

import { Citation, DatasetMetadata } from "./data";
import { motion } from "framer-motion";
import { ClockIcon, DatabaseIcon, LicenseIcon, CalendarIcon, DownloadIcon } from "./icons";

export const CitationDisplay = ({ citation }: { citation: Citation }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(citation.text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  return (
    <motion.div
      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          Citation ({citation.format})
        </h3>
        <button
          onClick={copyToClipboard}
          className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
        >
          Copy
        </button>
      </div>
      
      <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded border text-sm font-mono leading-relaxed">
        <p className="text-zinc-700 dark:text-zinc-300">{citation.text}</p>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        <ClockIcon size={12} />
        Generated {new Date(citation.generatedAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export const MetadataDisplay = ({ metadata }: { metadata: DatasetMetadata }) => {
  return (
    <motion.div
      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Dataset Metadata
      </h3>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">AUTHORS</div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            {metadata.authors && metadata.authors.length > 0 ? metadata.authors.join(', ') : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              <CalendarIcon size={12} />
              PUBLICATION DATE
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {new Date(metadata.publicationDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              <LicenseIcon size={12} />
              LICENSE
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {metadata.license}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              <DatabaseIcon size={12} />
              FORMATS
            </div>
            <div className="flex flex-wrap gap-1">
              {metadata.format && metadata.format.length > 0 && metadata.format.map((format, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>

          {metadata.size && (
            <div>
              <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                <DownloadIcon size={12} />
                SIZE
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                {metadata.size}
              </div>
            </div>
          )}
        </div>

        {metadata.doi && (
          <div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">DOI</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
              {metadata.doi}
            </div>
          </div>
        )}

        {metadata.version && (
          <div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">VERSION</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {metadata.version}
            </div>
          </div>
        )}

        {metadata.keywords && metadata.keywords.length > 0 && (
          <div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">KEYWORDS</div>
            <div className="flex flex-wrap gap-1">
              {metadata.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
