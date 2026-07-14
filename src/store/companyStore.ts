import { create } from 'zustand';
import { companyApi } from '../services/api';
import type { Company } from '../types';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  lastSynced: string;
  isLoading: boolean;
  selectCompany: (company: Company) => void;
  fetchCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompany: null,
  lastSynced: '',
  isLoading: false,

  selectCompany: (company: Company) => {
    set({ selectedCompany: company });
  },

  fetchCompanies: async () => {
    set({ isLoading: true });
    try {
      const companies = await companyApi.getAll();
      const { selectedCompany } = get();
      const nextSelected = selectedCompany
        ? companies.find((company) => company.id === selectedCompany.id) ?? companies[0] ?? null
        : selectedCompany;

      set({
        companies,
        selectedCompany: nextSelected,
        isLoading: false,
        lastSynced: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
