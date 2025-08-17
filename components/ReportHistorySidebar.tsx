import React from 'react';
import { Report, AnalysisType } from '../types';
import { XMarkIcon, TrashIcon, ChartBarIcon, LightBulbIcon, UserGroupIcon } from './IconComponents';

interface ReportHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onSelectReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  currentReportId: string | null;
}

const getAnalysisIcon = (type: AnalysisType) => {
    const props = { className: "w-6 h-6 text-brand-accent flex-shrink-0" };
    switch(type){
        case AnalysisType.ROI_FORECAST: return <ChartBarIcon {...props} />;
        case AnalysisType.SKILL_GAPS: return <LightBulbIcon {...props} />;
        case AnalysisType.DEV_PLAN: return <UserGroupIcon {...props} />;
        default: return null;
    }
}

const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days} days ago`;
    if (days === 1) return `1 day ago`;
    if (hours > 1) return `${hours} hours ago`;
    if (hours === 1) return `1 hour ago`;
    if (minutes > 1) return `${minutes} minutes ago`;
    if (minutes <= 1) return `Just now`;
    return past.toLocaleDateString();
};


const ReportHistorySidebar: React.FC<ReportHistorySidebarProps> = ({ isOpen, onClose, reports, onSelectReport, onDeleteReport, currentReportId }) => {
  return (
    <aside className={`fixed top-0 right-0 h-full w-96 bg-brand-secondary/95 backdrop-blur-lg border-l border-brand-border z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold text-brand-text-primary">Report History</h2>
          <button 
            onClick={onClose}
            className="text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            aria-label="Close history"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-2">
          {reports.length === 0 ? (
            <div className="flex items-center justify-center h-full text-brand-text-secondary text-center px-4">
                <p>No reports generated yet. Your saved reports will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {reports.map(report => (
                <li key={report.id}>
                    <div className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${currentReportId === report.id ? 'bg-brand-accent/10' : 'hover:bg-brand-secondary'}`}
                         onClick={() => onSelectReport(report.id)}
                         role="button"
                         tabIndex={0}
                         onKeyDown={(e) => e.key === 'Enter' && onSelectReport(report.id)}
                    >
                        <div className="flex items-start space-x-3">
                            {getAnalysisIcon(report.analysisType)}
                            <div className="flex-grow">
                                <p className="font-semibold text-brand-text-primary text-sm leading-tight">{report.title}</p>
                                <p className="text-xs text-brand-text-secondary mt-1">{report.companyName}</p>
                                <p className="text-xs text-brand-accent mt-1">{formatRelativeTime(report.timestamp)}</p>
                            </div>
                        </div>
                         <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent li's onClick from firing
                                onDeleteReport(report.id);
                            }}
                            className="absolute top-2 right-2 p-1 text-brand-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete report: ${report.title}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ReportHistorySidebar;