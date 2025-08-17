import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnalysisType, PredictionResult, Employee, Company } from '../types';
import { MOCK_COMPANIES } from '../constants';
import { generatePrediction, refineTextWithAI, RefineContext } from '../services/geminiService';
import PredictionResultDisplay from './PredictionResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import EmployeeManagementModal from './EmployeeManagementModal';
import { ChartBarIcon, LightBulbIcon, UserGroupIcon, SparklesIcon, ChevronDownIcon, LogoIcon, getCompanyLogoById } from './IconComponents';

const LOCAL_STORAGE_KEY = 'aura-enterprise-data';

// Load initial state from localStorage or seed with mock data
const loadCompaniesFromStorage = (): Company[] => {
  try {
    const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      // Basic validation to ensure it's an array
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.error("Failed to parse companies from localStorage", error);
  }
  // If nothing in storage or data is invalid, seed with mock data
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_COMPANIES));
  return MOCK_COMPANIES;
};


const Dashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(loadCompaniesFromStorage);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(companies[0].id);

  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Effect to save companies to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companies));
    } catch (error) {
      console.error("Failed to save companies to localStorage", error);
    }
  }, [companies]);

  const selectedCompany = useMemo(() => 
    companies.find(c => c.id === selectedCompanyId) || companies[0],
    [companies, selectedCompanyId]
  );
  
  // Input states
  const [initiativeDescription, setInitiativeDescription] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(selectedCompany.employees[0]?.id.toString() || '');
  const [careerGoals, setCareerGoals] = useState('');
  
  // Effect to reset selected employee when company changes
  useEffect(() => {
    const company = companies.find(c => c.id === selectedCompanyId);
    if (company && company.employees.length > 0) {
      setSelectedEmployeeId(company.employees[0].id.toString());
    } else {
      setSelectedEmployeeId('');
    }
  }, [selectedCompanyId, companies]);


  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setPredictionResult(null);
    setError(null);
    setSelectedAnalysis(null);
  };

  const handleAnalysisSelection = (type: AnalysisType) => {
    setSelectedAnalysis(type);
    setPredictionResult(null);
    setError(null);
  };

  const isFormValid = useCallback(() => {
    switch (selectedAnalysis) {
      case AnalysisType.ROI_FORECAST:
        return initiativeDescription.trim().length > 10;
      case AnalysisType.SKILL_GAPS:
        return departmentDescription.trim().length > 5;
      case AnalysisType.DEV_PLAN:
        return selectedEmployeeId && careerGoals.trim().length > 10 && selectedCompany.employees.length > 0;
      default:
        return false;
    }
  }, [selectedAnalysis, initiativeDescription, departmentDescription, selectedEmployeeId, careerGoals, selectedCompany]);

  const handleRefine = async (context: RefineContext) => {
    let textToRefine: string;
    let setter: React.Dispatch<React.SetStateAction<string>>;

    switch (context) {
        case 'ROI_DESCRIPTION':
            textToRefine = initiativeDescription;
            setter = setInitiativeDescription;
            break;
        case 'SKILL_GAPS_CONTEXT':
            textToRefine = departmentDescription;
            setter = setDepartmentDescription;
            break;
        case 'DEV_PLAN_GOALS':
            textToRefine = careerGoals;
            setter = setCareerGoals;
            break;
        default:
            return;
    }

    if (!textToRefine.trim()) return;

    setIsRefining(true);
    setError(null);
    const result = await refineTextWithAI(textToRefine, context);
    if (result.error) {
        setError(result.error);
    } else if (result.refinedText) {
        setter(result.refinedText);
    }
    setIsRefining(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnalysis || !isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    let context;
    switch (selectedAnalysis) {
      case AnalysisType.ROI_FORECAST:
        context = { initiativeDescription };
        break;
      case AnalysisType.SKILL_GAPS:
        context = { departmentDescription };
        break;
      case AnalysisType.DEV_PLAN:
        const employee = selectedCompany.employees.find(emp => emp.id.toString() === selectedEmployeeId);
        context = { employee, goals: careerGoals };
        break;
    }
    
    const result = await generatePrediction(selectedAnalysis, context);
    
    if (result.error) {
      setError(result.error);
      setPredictionResult(null);
    } else {
      setPredictionResult(result as PredictionResult);
    }
    setIsLoading(false);
  };
  
  // Employee CRUD operations
  const handleUpdateEmployees = (updatedEmployees: Employee[]) => {
    const updatedCompanies = companies.map(c => 
      c.id === selectedCompanyId ? { ...c, employees: updatedEmployees } : c
    );
    setCompanies(updatedCompanies);
     // If the currently selected employee was deleted, reset to the first one
     if (!updatedEmployees.some(e => e.id.toString() === selectedEmployeeId) && updatedEmployees.length > 0) {
      setSelectedEmployeeId(updatedEmployees[0].id.toString());
    } else if (updatedEmployees.length === 0) {
      setSelectedEmployeeId('');
    }
  };

  const RefineButton: React.FC<{ context: RefineContext, hasText: boolean }> = ({ context, hasText }) => (
    <button
        type="button"
        onClick={() => handleRefine(context)}
        disabled={isRefining || isLoading || !hasText}
        className="absolute top-2 right-2 flex items-center space-x-1.5 bg-brand-secondary/70 text-brand-accent text-xs font-semibold py-1 px-2 rounded-md border border-brand-border hover:bg-brand-secondary disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
    >
      {isRefining ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Refining...</span>
          </>
      ) : (
          <>
            <SparklesIcon className="w-4 h-4" />
            <span>Refine with AI</span>
          </>
      )}
    </button>
  );

  const renderInputForm = () => {
    if (!selectedAnalysis) return null;

    return (
      <form onSubmit={handleSubmit} className="w-full mt-6 bg-brand-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-brand-border shadow-lg animate-fade-in">
        {selectedAnalysis === AnalysisType.ROI_FORECAST && (
          <div className="relative">
            <label htmlFor="initiative" className="block text-sm font-medium text-brand-text-secondary mb-2">Training Initiative Description</label>
            <textarea
              id="initiative"
              value={initiativeDescription}
              onChange={(e) => setInitiativeDescription(e.target.value)}
              placeholder="e.g., 'A 6-week intensive sales leadership program for mid-level managers...'"
              className="w-full bg-brand-primary border border-brand-border rounded-md p-3 pr-32 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition placeholder:text-gray-500"
              rows={4}
            />
            <RefineButton context="ROI_DESCRIPTION" hasText={!!initiativeDescription.trim()} />
          </div>
        )}
        {selectedAnalysis === AnalysisType.SKILL_GAPS && (
          <div className="relative">
            <label htmlFor="department" className="block text-sm font-medium text-brand-text-secondary mb-2">Department or Industry</label>
            <input
              type="text"
              id="department"
              value={departmentDescription}
              onChange={(e) => setDepartmentDescription(e.target.value)}
              placeholder="e.g., 'Fintech Engineering' or 'Digital Marketing'"
              className="w-full bg-brand-primary border border-brand-border rounded-md p-3 pr-32 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition placeholder:text-gray-500"
            />
             <RefineButton context="SKILL_GAPS_CONTEXT" hasText={!!departmentDescription.trim()} />
          </div>
        )}
        {selectedAnalysis === AnalysisType.DEV_PLAN && (
          <div className="space-y-4">
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-brand-text-secondary mb-2">Select Employee</label>
              <select
                id="employee"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-brand-primary border border-brand-border rounded-md p-3 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition"
                disabled={selectedCompany.employees.length === 0}
              >
                {selectedCompany.employees.length > 0 ? (
                    selectedCompany.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                    ))
                ) : (
                    <option>No employees found for this company.</option>
                )}
              </select>
            </div>
            <div className="relative">
              <label htmlFor="goals" className="block text-sm font-medium text-brand-text-secondary mb-2">Career Goals</label>
              <textarea
                id="goals"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="e.g., 'Transition into a people management role within the next 2 years...'"
                className="w-full bg-brand-primary border border-brand-border rounded-md p-3 pr-32 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition placeholder:text-gray-500"
                rows={3}
              />
              <RefineButton context="DEV_PLAN_GOALS" hasText={!!careerGoals.trim()} />
            </div>
          </div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            disabled={!isFormValid() || isLoading || isRefining}
            className="w-full bg-gradient-to-r from-brand-accent to-brand-accent-secondary text-brand-primary font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] disabled:scale-100 animate-pulse disabled:animate-none"
          >
            {isLoading ? 'Generating Analysis...' : 'Generate Analysis'}
          </button>
        </div>
      </form>
    );
  };
  
  const analysisOptions = [
    { type: AnalysisType.ROI_FORECAST, icon: <ChartBarIcon className="w-8 h-8"/>, description: "Predict the financial return of training programs." },
    { type: AnalysisType.SKILL_GAPS, icon: <LightBulbIcon className="w-8 h-8"/>, description: "Identify emerging and declining skills in your industry." },
    { type: AnalysisType.DEV_PLAN, icon: <UserGroupIcon className="w-8 h-8"/>, description: "Create tailored growth plans for team members." },
  ];

  return (
    <>
    <EmployeeManagementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
        onSave={handleUpdateEmployees}
    />
    <header className="bg-brand-primary/80 backdrop-blur-sm sticky top-0 z-50 border-b border-brand-border mb-8">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <LogoIcon className="w-8 h-8 text-brand-accent" />
            <div>
              <h1 className="text-xl font-bold text-brand-text-primary tracking-tight">
                Aura
              </h1>
              <p className="text-xs text-brand-text-secondary">Predictive Training Intelligence</p>
            </div>
        </div>

        <div className='flex items-center space-x-4'>
            <div className='relative'>
                <label htmlFor="company-select" className='sr-only'>Select Company</label>
                <div className='flex items-center space-x-2 bg-brand-secondary/50 border border-brand-border rounded-md pl-3'>
                    {getCompanyLogoById(selectedCompany.logoId, { className: "w-6 h-6" })}
                    <select
                        id="company-select"
                        value={selectedCompanyId}
                        onChange={(e) => handleCompanyChange(Number(e.target.value))}
                        className="bg-transparent text-brand-text-primary font-semibold py-2 pr-8 focus:outline-none appearance-none"
                    >
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                     <ChevronDownIcon className="w-5 h-5 text-brand-text-secondary absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-brand-secondary text-brand-text-primary font-semibold py-2 px-4 rounded-md border border-brand-border hover:bg-brand-secondary/80 transition-colors"
            >
                <UserGroupIcon className="w-5 h-5" />
                <span>Manage Employees</span>
            </button>
        </div>

      </div>
    </header>
    <div className="flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-text-primary">Welcome to the Predictive BI Dashboard</h2>
      <p className="mt-2 text-lg text-brand-text-secondary text-center max-w-2xl">
        Select an analysis type to leverage AI for data-driven training and development decisions.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {analysisOptions.map(option => (
             <button
             key={option.type}
             onClick={() => handleAnalysisSelection(option.type)}
             className={`p-6 rounded-lg border text-left transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden ${
               selectedAnalysis === option.type 
               ? 'bg-brand-secondary/80 border-brand-accent shadow-2xl shadow-brand-accent/20 animate-glow' 
               : 'bg-brand-secondary/50 border-brand-border hover:border-brand-accent/50'
             } backdrop-blur-sm`}
           >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl group-hover:bg-brand-accent/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="text-brand-accent mb-3 group-hover:text-brand-accent-hover transition-colors">{option.icon}</div>
                  <h3 className="font-semibold text-lg text-brand-text-primary">{option.type}</h3>
                  <p className="text-sm text-brand-text-secondary mt-1">{option.description}</p>
                </div>
           </button>
        ))}
      </div>
      
      {renderInputForm()}

      <div className="w-full mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md text-center border border-red-500">{error}</div>}
        {predictionResult && selectedAnalysis && (
          <PredictionResultDisplay result={predictionResult} type={selectedAnalysis} />
        )}
      </div>
    </div>
    </>
  );
};

export default Dashboard;