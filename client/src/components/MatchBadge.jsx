import React from 'react';
import { clsx } from 'clsx';

export default function MatchBadge({ level, score, size = 'sm' }) {
  const config = {
    S: { bg: 'bg-primary-500', text: 'S级', color: 'text-primary-500' },
    A: { bg: 'bg-green-500', text: 'A级', color: 'text-green-500' },
    B: { bg: 'bg-orange-500', text: 'B级', color: 'text-orange-500' },
    C: { bg: 'bg-gray-400', text: 'C级', color: 'text-gray-400' },
  };
  
  const c = config[level] || config.C;
  
  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <span className={`${c.bg} text-white text-sm font-bold px-3 py-1 rounded-lg`}>{c.text}</span>
        {score !== undefined && (
          <span className={`text-2xl font-bold ${c.color}`}>{score}<span className="text-sm">%</span></span>
        )}
      </div>
    );
  }
  
  return (
    <span className={`${c.bg} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
      {c.text}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    applied: { label: '已投递', className: 'status-applied' },
    invited: { label: '已获邀', className: 'status-invited' },
    interviewed: { label: '面试中', className: 'status-interviewed' },
    offered: { label: '已录用', className: 'status-offered' },
    rejected: { label: '已拒绝', className: 'status-rejected' },
    withdrawn: { label: '已撤回', className: 'bg-gray-100 text-gray-500' },
  };
  const s = map[status] || { label: status, className: 'bg-gray-100 text-gray-500' };
  return <span className={`${s.className} text-xs font-medium px-2 py-0.5 rounded-full`}>{s.label}</span>;
}
