import React from 'react';
import { Company } from './types';
import { CompanyIconA, CompanyIconB, CompanyIconC } from './components/IconComponents';

export const MOCK_COMPANIES: Company[] = [
  { 
    id: 1, 
    name: 'Innovate Corp',
    logo: React.createElement(CompanyIconA, { className: "w-6 h-6" }),
    employees: [
      { id: 1, name: 'Alice Johnson', role: 'Software Engineer II', department: 'Engineering' },
      { id: 2, name: 'Bob Williams', role: 'Senior Product Manager', department: 'Product' },
      { id: 3, name: 'Charlie Brown', role: 'Marketing Lead', department: 'Marketing' },
    ]
  },
  { 
    id: 2, 
    name: 'Quantum Solutions', 
    logo: React.createElement(CompanyIconB, { className: "w-6 h-6" }),
    employees: [
      { id: 4, name: 'Diana Prince', role: 'UX/UI Designer', department: 'Design' },
      { id: 5, name: 'Ethan Hunt', role: 'Sales Executive', department: 'Sales' },
      { id: 6, name: 'Fiona Glenanne', role: 'Data Scientist', department: 'Analytics' },
    ]
  },
    { 
    id: 3, 
    name: 'Starlight Ventures',
    logo: React.createElement(CompanyIconC, { className: "w-6 h-6" }),
    employees: [
      { id: 7, name: 'George Costanza', role: 'Architect', department: 'Real Estate' },
      { id: 8, name: 'Heidi Klum', role: 'Lead Designer', department: 'Fashion' },
    ]
  },
];