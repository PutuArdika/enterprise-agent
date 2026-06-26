"use client";

import { PrimaryButton } from "./ui";

interface CVCandidate {
  email: string;
  subject: string;
  senderName?: string;
  senderEmail?: string;
  senderInfo: string;
  analysis: {
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
  };
  matchScore: number;
  messageId: string;
}

interface TopCandidatesProps {
  candidates: CVCandidate[];
  isLoading?: boolean;
  onSelectCandidate?: (candidate: CVCandidate) => void;
  onClose?: () => void;
}

export function TopCandidates({
  candidates,
  isLoading = false,
  onSelectCandidate,
  onClose,
}: TopCandidatesProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="w-full space-y-4 mt-4">
      <div className="border-t border-gray-300 pt-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          🎯 Top 3 Candidates
        </h3>

        {candidates.map((candidate, index) => (
          <div
            key={candidate.messageId}
            className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-blue-600">
                    #{index + 1}
                  </span>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Match: {candidate.matchScore}%
                  </span>
                </div>
                <h4 className="font-bold text-gray-900">{candidate.subject}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  From: {candidate.senderInfo}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  📝 Summary
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {candidate.analysis.summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  💼 Key Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {candidate.analysis.skills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.analysis.skills.length > 5 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      +{candidate.analysis.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  🏆 Experience
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {candidate.analysis.experience.slice(0, 2).map((exp, idx) => (
                    <li key={idx} className="line-clamp-1">
                      • {exp}
                    </li>
                  ))}
                  {candidate.analysis.experience.length > 2 && (
                    <li className="text-xs text-gray-500">
                      +{candidate.analysis.experience.length - 2} more positions
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  🎓 Education
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {candidate.analysis.education.map((edu, idx) => (
                    <li key={idx} className="line-clamp-1">
                      • {edu}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <PrimaryButton
                onClick={() => onSelectCandidate?.(candidate)}
                disabled={isLoading}
                className="flex-1"
              >
                View Full Profile
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Close Results
        </button>
      )}
    </div>
  );
}
