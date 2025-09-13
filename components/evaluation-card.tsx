"use client";

import { EvaluationResult } from "./data";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "./icons";

export const EvaluationCard = ({ evaluation }: { evaluation: EvaluationResult }) => {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircleIcon size={16} className="text-green-500" />
    ) : (
      <XCircleIcon size={16} className="text-red-500" />
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800";
    if (score >= 0.6) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800";
    return "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800";
  };

  return (
    <motion.div
      className={`border rounded-lg p-4 ${getScoreBackground(evaluation.overallScore)}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
          Dataset Evaluation
        </h3>
        <div className={`text-lg font-bold ${getScoreColor(evaluation.overallScore)}`}>
          {Math.round(evaluation.overallScore * 100)}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Metadata Complete</span>
          {getStatusIcon(evaluation.metadataComplete)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">License Compatible</span>
          {getStatusIcon(evaluation.licenseCompatible)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Format Compatible</span>
          {getStatusIcon(evaluation.formatCompatible)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Timeliness</span>
          {getStatusIcon(evaluation.timeliness)}
        </div>
      </div>

      {evaluation.notes && (
        <div className="mt-4 p-3 bg-white/50 dark:bg-zinc-800/50 rounded border text-sm">
          <p className="text-zinc-700 dark:text-zinc-300">{evaluation.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        <ClockIcon size={12} />
        Evaluated {new Date(evaluation.evaluatedAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};
