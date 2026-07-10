import { create } from 'zustand';
import { fetchMockCompanies } from '../data/mockData';
import type { Company } from '../types';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  lastSynced: string;
  isLoading: boolean;
  selectCompany: (company: Company) => void;
  fetchCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  selectedCompany: null,
  lastSynced: '',
  isLoading: false,

  selectCompany: (company: Company) => {
    set({ selectedCompany: company });
  },

  fetchCompanies: async () => {
    set({ isLoading: true });
    const companies = await fetchMockCompanies();
    set({
      companies,
      isLoading: false,
      lastSynced: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  },
}));
