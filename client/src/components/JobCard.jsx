import React from 'react';
import { MapPin, Building2, ArrowRight, Heart } from 'lucide-react';
import MatchBadge from './MatchBadge';

export default function JobCard({ job, matchScore, matchLevel, reasons, onApply, onSave, compact = false }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
            <MatchBadge level={matchLevel} />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.department}</span>
          </div>
        </div>
        {matchScore !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500 leading-none">{matchScore}<span className="text-sm">%</span></div>
            <div className="text-[10px] text-gray-400 mt-1">匹配度</div>
          </div>
        )}
      </div>

      {reasons && reasons.length > 0 && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          <span className="text-green-500 font-semibold">匹配理由：</span>
          {reasons.join('；')}
        </p>
      )}

      {!compact && job.skills_req && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills_req.split(/[,，、]/).slice(0, 4).map((s, i) => (
            <span key={i} className="bg-primary-50 text-primary-500 text-[10px] px-2 py-0.5 rounded">{s.trim()}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {job.salary_range && (
          <span className="text-base font-bold text-primary-500">{job.salary_range}<span className="text-xs text-gray-400 font-normal">/月</span></span>
        )}
        <div className="flex gap-2">
          {onSave && (
            <button onClick={onSave} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {onApply && (
            <button onClick={onApply} className="btn-primary flex items-center gap-1.5 text-sm !py-2.5 !px-5">
              一键投递 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function JobListItem({ job, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 card-hover cursor-pointer">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{job.department} · {job.city}</p>
        </div>
        {job.salary_range && (
          <span className="text-sm font-bold text-primary-500">{job.salary_range}</span>
        )}
      </div>
      {job.skills_req && (
        <div className="flex flex-wrap gap-1 mt-2">
          {job.skills_req.split(/[,，、]/).slice(0, 3).map((s, i) => (
            <span key={i} className="bg-primary-50 text-primary-500 text-[10px] px-1.5 py-0.5 rounded">{s.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}
