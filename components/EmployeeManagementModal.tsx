import React, { useState, useEffect } from 'react';
import { Company, Employee } from '../types';
import Modal from './Modal';
import { UserPlusIcon, PencilIcon, TrashIcon } from './IconComponents';

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onSave: (updatedEmployees: Employee[]) => void;
}

const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({ isOpen, onClose, company, onSave }) => {
  const [employees, setEmployees] = useState<Employee[]>(company.employees);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formState, setFormState] = useState({ name: '', role: '', department: '' });

  useEffect(() => {
    setEmployees(company.employees);
  }, [company, isOpen]);

  useEffect(() => {
    if (editingEmployee) {
      setFormState({
        name: editingEmployee.name,
        role: editingEmployee.role,
        department: editingEmployee.department,
      });
    } else {
      setFormState({ name: '', role: '', department: '' });
    }
  }, [editingEmployee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.role || !formState.department) return;

    let updatedEmployees: Employee[];
    if (editingEmployee) {
      // Update existing employee
      updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id ? { ...emp, ...formState } : emp
      );
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now(), // Simple unique ID generation
        ...formState,
      };
      updatedEmployees = [...employees, newEmployee];
    }
    setEmployees(updatedEmployees);
    setEditingEmployee(null);
  };
  
  const handleDelete = (employeeId: number) => {
    if(window.confirm("Are you sure you want to delete this employee?")) {
        const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
        setEmployees(updatedEmployees);
    }
  };

  const handleSaveChanges = () => {
    onSave(employees);
    onClose();
  };

  const handleStartEditing = (employee: Employee) => {
      setEditingEmployee(employee);
      // Optional: scroll to form
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Employees for ${company.name}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form for adding/editing */}
        <div className="bg-brand-primary/50 p-4 rounded-lg border border-brand-border">
          <h3 className="text-lg font-semibold text-brand-text-primary mb-4 flex items-center">
            <UserPlusIcon className="w-5 h-5 mr-2" />
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <form onSubmit={handleAddOrUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">Full Name</label>
              <input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} className="w-full bg-brand-primary border border-brand-border rounded-md p-2 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition" required />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-brand-text-secondary mb-1">Role</label>
              <input type="text" name="role" id="role" value={formState.role} onChange={handleInputChange} className="w-full bg-brand-primary border border-brand-border rounded-md p-2 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition" required />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-brand-text-secondary mb-1">Department</label>
              <input type="text" name="department" id="department" value={formState.department} onChange={handleInputChange} className="w-full bg-brand-primary border border-brand-border rounded-md p-2 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition" required />
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <button type="submit" className="w-full bg-brand-accent text-brand-primary font-bold py-2 px-4 rounded-md hover:opacity-90 transition-colors">
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
                {editingEmployee && (
                    <button type="button" onClick={() => setEditingEmployee(null)} className="w-full bg-brand-secondary text-brand-text-primary font-bold py-2 px-4 rounded-md border border-brand-border hover:bg-brand-secondary/80">
                        Cancel
                    </button>
                )}
            </div>
          </form>
        </div>

        {/* List of employees */}
        <div className="bg-brand-primary/50 p-4 rounded-lg border border-brand-border">
            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Employee List</h3>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
            {employees.length > 0 ? employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-brand-secondary p-2 rounded-md">
                    <div>
                        <p className="font-medium text-brand-text-primary">{emp.name}</p>
                        <p className="text-xs text-brand-text-secondary">{emp.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleStartEditing(emp)} className="text-brand-accent-secondary hover:text-brand-accent" aria-label={`Edit ${emp.name}`}>
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-400" aria-label={`Delete ${emp.name}`}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )) : <p className="text-brand-text-secondary text-center py-4">No employees found.</p>}
            </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-brand-border flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="bg-gradient-to-r from-brand-accent to-brand-accent-secondary text-brand-primary font-bold py-2 px-6 rounded-md hover:opacity-90 transition-all"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EmployeeManagementModal;