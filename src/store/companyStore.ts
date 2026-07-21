import { create } from 'zustand';
import { companyApi } from '../services/api';
import type { Company } from '../types';

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  selectCompany: (company: Company) => void;
  fetchCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompany: null,
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
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
