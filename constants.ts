import { Company } from './types';

export const MOCK_COMPANIES: Company[] = [
  { 
    id: 1, 
    name: 'Innovate Corp',
    logoId: 'CompanyIconA',
    employees: [
      { id: 1, name: 'Alice Johnson', role: 'Software Engineer II', department: 'Engineering' },
      { id: 2, name: 'Bob Williams', role: 'Senior Product Manager', department: 'Product' },
      { id: 3, name: 'Charlie Brown', role: 'Marketing Lead', department: 'Marketing' },
    ]
  },
  { 
    id: 2, 
    name: 'Quantum Solutions', 
    logoId: 'CompanyIconB',
    employees: [
      { id: 4, name: 'Diana Prince', role: 'UX/UI Designer', department: 'Design' },
      { id: 5, name: 'Ethan Hunt', role: 'Sales Executive', department: 'Sales' },
      { id: 6, name: 'Fiona Glenanne', role: 'Data Scientist', department: 'Analytics' },
    ]
  },
    { 
    id: 3, 
    name: 'Starlight Ventures',
    logoId: 'CompanyIconC',
    employees: [
      { id: 7, name: 'George Costanza', role: 'Architect', department: 'Real Estate' },
      { id: 8, name: 'Heidi Klum', role: 'Lead Designer', department: 'Fashion' },
    ]
  },
];