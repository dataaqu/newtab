"use client";

import { useMemo } from "react";
import { analyzeSeo, type SeoAnalysis } from "@/lib/seo-analyzer";

interface Props {
  title: string;
  metaTitle: string;
  metaDesc: string;
  content: string;
  focusKeyword: string;
  slug: string;
  isEnglish: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  let color: string;
  let label: string;

  if (score >= 70) {
    color = "bg-green-500";
    label = "Good";
  } else if (score >= 40) {
    color = "bg-yellow-500";
    label = "OK";
  } else {
    color = "bg-red-500";
    label = "Poor";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={
              score >= 70
                ? "text-green-500"
                : score >= 40
                  ? "text-yellow-500"
                  : "text-red-500"
            }
            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
          {score}
        </span>
      </div>
      <div>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${color}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "good" | "warning" | "bad" }) {
  if (status === "good")
    return <span className="text-green-500">●</span>;
  if (status === "warning")
    return <span className="text-yellow-500">●</span>;
  return <span className="text-red-500">●</span>;
}

export default function SeoAnalyzer(props: Props) {
  const analysis: SeoAnalysis = useMemo(
    () => analyzeSeo(props),
    [
      props.title,
      props.metaTitle,
      props.metaDesc,
      props.content,
      props.focusKeyword,
      props.slug,
      props.isEnglish,
    ]
  );

  const goodCount = analysis.checks.filter((c) => c.status === "good").length;
  const warnCount = analysis.checks.filter((c) => c.status === "warning").length;
  const badCount = analysis.checks.filter((c) => c.status === "bad").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">SEO Score</h3>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="text-green-600">{goodCount} good</span>
          <span className="text-yellow-600">{warnCount} ok</span>
          <span className="text-red-600">{badCount} needs work</span>
        </div>
      </div>

      <ScoreBadge score={analysis.score} />

      <div className="space-y-2">
        {analysis.checks.map((check) => (
          <div key={check.id} className="flex items-start gap-2">
            <StatusIcon status={check.status} />
            <span className="text-xs text-gray-600">{check.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
