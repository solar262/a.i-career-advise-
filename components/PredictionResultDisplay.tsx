import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisType, PredictionResult, RoiForecastResult, SkillGapsResult, DevPlanResult, Skill } from '../types';
import DataChart from './DataChart';
import { ArrowTrendingUpIcon, LightBulbIcon, ClipboardDocumentListIcon, CheckCircleIcon, DocumentArrowDownIcon, LogoIcon } from './IconComponents';
import InteractiveChat from './InteractiveChat';

interface PredictionResultDisplayProps {
  result: PredictionResult;
  type: AnalysisType;
}

const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-brand-primary/50 p-4 rounded-lg flex items-center space-x-4 border border-brand-border shadow-sm">
        <div className="bg-brand-accent/10 text-brand-accent p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-brand-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-brand-text-primary">{value}</p>
        </div>
    </div>
);

const renderRoiForecast = (data: RoiForecastResult) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <StatCard 
                title="Predicted ROI" 
                value={`${data.predictedRoiPercentage.toFixed(1)}%`} 
                icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
             />
        </div>
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <h4 className="font-semibold text-lg mb-2 text-brand-text-primary">Executive Summary</h4>
            <p className="text-brand-text-secondary">{data.summary}</p>
        </div>
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-brand-text-primary">Projected Quarterly Impact (%)</h4>
            <DataChart data={data.quarterlyImpact.map(q => ({ name: q.quarter, value: q.upliftPercentage }))} />
        </div>
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <h4 className="font-semibold text-lg mb-2 text-brand-text-primary">Key Influencing Factors</h4>
            <ul className="list-none space-y-3 text-brand-text-secondary">
                {data.keyFactors.map((factor, index) => <li key={index} className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span>{factor}</span>
                </li>)}
            </ul>
        </div>
    </div>
);

const SkillList: React.FC<{ title: string; skills: Skill[], color: string }> = ({ title, skills, color }) => (
    <div>
        <h4 className="font-semibold text-lg mb-2 text-brand-text-primary">{title}</h4>
        <div className="space-y-2">
            {skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between bg-brand-primary/50 p-2 rounded">
                    <span className="text-brand-text-primary">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-brand-text-secondary">Importance</span>
                        <div className="w-24 h-2 bg-brand-border rounded-full">
                            <div className={`h-2 rounded-full ${color}`} style={{ width: `${skill.importance * 10}%` }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const renderSkillGaps = (data: SkillGapsResult) => (
    <div className="space-y-6">
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <h4 className="font-semibold text-lg mb-2 flex items-center text-brand-text-primary"><LightBulbIcon className="w-5 h-5 mr-2 text-brand-accent"/> Analysis Summary</h4>
            <p className="text-brand-text-secondary">{data.analysisSummary}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
                <SkillList title="Future-Ready Skills" skills={data.futureSkills} color="bg-green-500" />
            </div>
            <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
                <SkillList title="Declining Skills" skills={data.decliningSkills} color="bg-red-500" />
            </div>
        </div>
    </div>
);

const renderDevPlan = (data: DevPlanResult) => (
    <div className="space-y-6">
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-brand-text-secondary">Employee</p>
                    <p className="text-xl font-semibold text-brand-text-primary">{data.employeeName}</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-secondary text-right">Current Role</p>
                    <p className="text-lg text-brand-text-primary text-right">{data.currentRole}</p>
                </div>
            </div>
            <div className="mt-4 text-center">
                 <p className="text-sm text-brand-text-secondary">Target Role</p>
                 <p className="text-xl font-semibold text-brand-accent">{data.targetRole}</p>
            </div>
        </div>
        <div className="bg-brand-primary/50 p-6 rounded-lg border border-brand-border shadow-sm">
            <h4 className="font-semibold text-lg mb-2 flex items-center text-brand-text-primary"><ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-brand-accent"/> Plan Summary</h4>
            <p className="text-brand-text-secondary">{data.summary}</p>
        </div>
        <div>
            <h4 className="font-semibold text-lg mb-4 text-brand-text-primary">Development Steps</h4>
            <div className="space-y-4">
                {data.developmentSteps.sort((a,b) => a.step - b.step).map((step) => (
                    <div key={step.step} className="bg-brand-primary/50 p-4 rounded-lg border border-brand-border shadow-sm">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-brand-secondary text-brand-accent w-10 h-10 rounded-full font-bold text-lg">
                                {step.step}
                            </div>
                            <div className="flex-grow">
                                <h5 className="font-semibold text-brand-text-primary">{step.action}</h5>
                                <p className="text-sm text-brand-text-secondary mt-1"><span className="font-medium text-gray-300">Resources:</span> {step.resources}</p>
                                <p className="text-sm text-brand-accent bg-brand-accent/10 inline-block px-2 py-1 rounded mt-2"><span className="font-medium">Timeline:</span> {step.timeline}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const PredictionResultDisplay: React.FC<PredictionResultDisplayProps> = ({ result, type }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPdf = () => {
    const input = pdfRef.current;
    if (!input) {
      console.error("Could not find element to export");
      return;
    }

    setIsExporting(true);

    html2canvas(input, {
      backgroundColor: '#161E39', // brand-secondary
      scale: 2,
      useCORS: true,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = pdfWidth - 20; // Margin
      let imgHeight = imgWidth / canvasAspectRatio;

      if (imgHeight > pdfHeight - 20) {
          imgHeight = pdfHeight - 20; // Fit with margin
          imgWidth = imgHeight * canvasAspectRatio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      const fileName = `Aura_Report_${type.replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
      setIsExporting(false);
    }).catch(err => {
        console.error("Failed to export PDF", err);
        setIsExporting(false);
    });
  };

  const getTitle = () => {
    switch (type) {
      case AnalysisType.ROI_FORECAST: return "ROI Forecast Analysis";
      case AnalysisType.SKILL_GAPS: return "Skill Gap Analysis";
      case AnalysisType.DEV_PLAN: return "Personalized Development Plan";
      default: return "Analysis Report";
    }
  };

  const renderContent = () => {
    if (!result) return null;
    switch (type) {
      case AnalysisType.ROI_FORECAST:
        return renderRoiForecast(result as RoiForecastResult);
      case AnalysisType.SKILL_GAPS:
        return renderSkillGaps(result as SkillGapsResult);
      case AnalysisType.DEV_PLAN:
        return renderDevPlan(result as DevPlanResult);
      default:
        return <p>Invalid analysis type.</p>;
    }
  };

  const systemInstruction = result 
    ? `You are an expert AI analyst named Aura. The user has just generated the following '${type}' report. Your task is to answer follow-up questions they might have about this specific data. Be helpful, concise, and always refer to the report context. Here is the report data: ${JSON.stringify(result)}`
    : '';

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in relative">
        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          aria-label="Export to PDF"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-brand-accent to-brand-accent-secondary text-brand-primary rounded-full shadow-lg hover:opacity-90 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-110 disabled:scale-100"
        >
          {isExporting ? (
             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <DocumentArrowDownIcon className="w-7 h-7" />
          )}
        </button>

        <div className="bg-brand-secondary p-8 rounded-lg border border-brand-border shadow-lg">
            <div ref={pdfRef}>
              <div className="flex items-start space-x-4 mb-6 pb-4 border-b border-brand-border">
                  <LogoIcon className="w-10 h-10 text-brand-accent flex-shrink-0" />
                  <div>
                      <h1 className="text-xl font-bold text-brand-text-primary tracking-tight">
                          Aura: Predictive Training Intelligence
                      </h1>
                      <p className="text-md text-brand-text-secondary">{getTitle()}</p>
                  </div>
              </div>
              {renderContent()}
            </div>
            
            {result && type && (
                <div className="mt-8 pt-6 border-t border-brand-border">
                    <InteractiveChat systemInstruction={systemInstruction} />
                </div>
            )}
        </div>
    </div>
  );
};

export default PredictionResultDisplay;
