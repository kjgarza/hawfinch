"use client";

import { Dataset } from "./data";
import { motion } from "framer-motion";
import { DatabaseIcon, CalendarIcon, LicenseIcon, SearchIcon } from "./icons";

export const DatasetGrid = ({ datasets }: { datasets: Dataset[] }) => {
  if (!datasets || datasets.length === 0) {
    return (
      <motion.div
        className="w-full p-6 text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SearchIcon size={24} className="mx-auto mb-3 text-zinc-400 dark:text-zinc-500" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No datasets found matching your criteria
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        Found {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-rows-2 gap-4 h-[500px]" style={{ gridTemplateColumns: `repeat(${Math.ceil(datasets.length / 2)}, minmax(300px, 1fr))` }}>
          {datasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-800 hover:shadow-sm transition-shadow h-fit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
                    {dataset.title.length > 50 
                      ? `${dataset.title.slice(0, 50)}…` 
                      : dataset.title}
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap">
                    {dataset.repository}
                  </span>
                </div>
                
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 leading-relaxed flex-1">
                  {dataset.description.length > 120
                    ? `${dataset.description.slice(0, 120)}…`
                    : dataset.description}
                </p>
                
                <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <DatabaseIcon size={10} />
                    <span className="truncate">
                      {dataset.metadata.format ? dataset.metadata.format.join(', ') : "Unknown format"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={10} />
                    <span>{new Date(dataset.metadata.publicationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LicenseIcon size={10} />
                    <span className="truncate">{dataset.metadata.license}</span>
                  </div>
                </div>
                
                {dataset.metadata.size && (
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Size: {dataset.metadata.size}
                  </div>
                )}
                
                {dataset.metadata.keywords && dataset.metadata.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dataset.metadata.keywords.slice(0, 2).map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 truncate max-w-[80px]"
                      >
                        {keyword}
                      </span>
                    ))}
                    {dataset.metadata.keywords.length > 2 && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        +{dataset.metadata.keywords.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};