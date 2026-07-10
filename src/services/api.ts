/**
 * API Service — all functions are stubbed with mock data.
 * Replace the implementations with real axios/fetch calls when backend is ready.
 */
import {
  fetchMockCompanies,
  fetchMockSalesOsParties,
  fetchMockSalesOsInvoices,
  fetchMockPurchaseOsParties,
  fetchMockPurchaseOsInvoices,
  fetchMockGpOsParties,
  fetchMockGpOsInvoices,
  fetchMockSalesRegister,
  fetchMockPurchaseRegister,
  fetchMockGpRegister,
  fetchMockStock,
  fetchMockLedger,
  mockSalesOsBrokers,
  mockSalesOsAreas,
  mockSalesOsPartyGroups,
  mockSalesOsSalesPersons,
  mockSalesRegisterEntries,
  mockPurchaseRegisterEntries,
  mockGpRegisterEntries,
  mockLedgerEntries,
  mockUser,
  fetchMockBankAccounts,
  fetchMockPartyLedger,
  fetchMockSalesReport,
} from '../data/mockData';
import type {
  User,
  Company,
  SalesOsParty,
  SalesOsInvoice,
  SalesOsBroker,
  SalesOsArea,
  SalesOsPartyGroup,
  SalesOsSalesPerson,
  PurchaseOsParty,
  PurchaseOsInvoice,
  GpOsParty,
  GpOsInvoice,
  RegisterEntry,
  GpRegisterEntry,
  StockItem,
  LedgerEntry,
  BankAccount,
  PartyLedgerAccount,
  SalesReportPoint,
  ReportFilter,
} from '../types';

// ─── Base Client (swap with axios instance when ready) ────────────────────────

export const apiClient = {
  baseURL: 'https://api.zeelinfosys.com/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; userId: string }> => {
    await new Promise((r) => setTimeout(r, 1000));
    return { token: `mock_${Date.now()}`, userId: 'u001' };
  },
  logout: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
  refreshToken: async (token: string): Promise<{ token: string }> => {
    await new Promise((r) => setTimeout(r, 500));
    return { token: `refreshed_${Date.now()}` };
  },
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    await new Promise((r) => setTimeout(r, 600));
    // Replace with PUT /auth/profile when backend is ready.
    return { ...mockUser, ...updates };
  },
  changePassword: async (
    _username: string,
    _currentPassword: string,
    _newPassword: string,
  ): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 800));
    // Replace with POST /auth/change-password when backend is ready.
    return { success: true };
  },
};

// ─── Companies ────────────────────────────────────────────────────────────────

export const companyApi = {
  getAll: (): Promise<Company[]> => fetchMockCompanies(),
  getById: async (id: string): Promise<Company | undefined> => {
    const companies = await fetchMockCompanies();
    return companies.find((c) => c.id === id);
  },
};

// ─── Sales OS ─────────────────────────────────────────────────────────────────

// The `filter` flags map 1:1 to the OG .NET API query string:
//   onlyDue        → onlydue=1/0
//   commonCompany  → omit company= (aggregate all companies) when true
//   companyId      → company={id} when commonCompany is false
// Once the real endpoint is wired these become query params; the mock applies
// the "Only Due" effect client-side where the data carries an overdue signal.
export const salesOsApi = {
  getParties: async (filter?: ReportFilter): Promise<SalesOsParty[]> => {
    const all = await fetchMockSalesOsParties();
    return filter?.onlyDue ? all.filter((p) => p.daysOverdue > 0) : all;
  },
  getPartyInvoices: (partyId: string): Promise<SalesOsInvoice[]> =>
    fetchMockSalesOsInvoices(partyId),
  getBrokers: async (_filter?: ReportFilter): Promise<SalesOsBroker[]> => {
    await new Promise((r) => setTimeout(r, 600));
    return mockSalesOsBrokers;
  },
  getAreas: async (_filter?: ReportFilter): Promise<SalesOsArea[]> => {
    await new Promise((r) => setTimeout(r, 600));
    return mockSalesOsAreas;
  },
  getPartyGroups: async (_filter?: ReportFilter): Promise<SalesOsPartyGroup[]> => {
    await new Promise((r) => setTimeout(r, 600));
    return mockSalesOsPartyGroups;
  },
  getSalesPersons: async (_filter?: ReportFilter): Promise<SalesOsSalesPerson[]> => {
    await new Promise((r) => setTimeout(r, 600));
    return mockSalesOsSalesPersons;
  },
  getPartyById: async (id: string): Promise<SalesOsParty | undefined> => {
    const all = await fetchMockSalesOsParties();
    return all.find((p) => p.id === id);
  },
  getBrokerById: async (id: string): Promise<SalesOsBroker | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockSalesOsBrokers.find((b) => b.id === id);
  },
  getAreaById: async (id: string): Promise<SalesOsArea | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockSalesOsAreas.find((a) => a.id === id);
  },
};

// ─── Purchase OS ──────────────────────────────────────────────────────────────

// Same OG param mapping as salesOsApi (onlydue / company / commonCompany).
export const purchaseOsApi = {
  getParties: async (filter?: ReportFilter): Promise<PurchaseOsParty[]> => {
    const all = await fetchMockPurchaseOsParties();
    return filter?.onlyDue ? all.filter((p) => p.daysOverdue > 0) : all;
  },
  getPartyInvoices: (partyId: string): Promise<PurchaseOsInvoice[]> =>
    fetchMockPurchaseOsInvoices(partyId),
  getPartyById: async (id: string): Promise<PurchaseOsParty | undefined> => {
    const all = await fetchMockPurchaseOsParties();
    return all.find((p) => p.id === id);
  },
};

// ─── GP Outstanding ───────────────────────────────────────────────────────────

// Same OG param mapping as salesOsApi / purchaseOsApi (onlydue / company /
// commonCompany). Real endpoints:
//   getParties       → GET {baseURL}/generalpurchase/summary/?company=&from_date=&to_date=
//   getPartyInvoices → GET {baseURL}/party/{partyId}/generalpurchase?company=&from_date=&to_date=
export const gpOsApi = {
  getParties: async (filter?: ReportFilter): Promise<GpOsParty[]> => {
    const all = await fetchMockGpOsParties();
    return filter?.onlyDue ? all.filter((p) => p.daysOverdue > 0) : all;
  },
  getPartyInvoices: (partyId: string): Promise<GpOsInvoice[]> =>
    fetchMockGpOsInvoices(partyId),
  getPartyById: async (id: string): Promise<GpOsParty | undefined> => {
    const all = await fetchMockGpOsParties();
    return all.find((p) => p.id === id);
  },
};

// ─── Registers ────────────────────────────────────────────────────────────────

export const salesRegisterApi = {
  getEntries: (_filter?: ReportFilter): Promise<RegisterEntry[]> =>
    fetchMockSalesRegister(),
  getById: async (id: string): Promise<RegisterEntry | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockSalesRegisterEntries.find((e) => e.id === id);
  },
};

export const purchaseRegisterApi = {
  getEntries: (_filter?: ReportFilter): Promise<RegisterEntry[]> =>
    fetchMockPurchaseRegister(),
  getById: async (id: string): Promise<RegisterEntry | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockPurchaseRegisterEntries.find((e) => e.id === id);
  },
};

// ─── GP Register ──────────────────────────────────────────────────────────────

export const gpRegisterApi = {
  getEntries: (_filter?: ReportFilter): Promise<GpRegisterEntry[]> =>
    fetchMockGpRegister(),
  getById: async (id: string): Promise<GpRegisterEntry | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockGpRegisterEntries.find((e) => e.id === id);
  },
};

// ─── Stock ────────────────────────────────────────────────────────────────────

export const stockApi = {
  getAll: (): Promise<StockItem[]> => fetchMockStock(),
  getByCategory: async (category: 'yarn' | 'beam' | 'nonIssue'): Promise<StockItem[]> => {
    const items = await fetchMockStock();
    return items.filter((i) => i.category === category);
  },
};

// ─── Ledger ───────────────────────────────────────────────────────────────────

export const ledgerApi = {
  getEntries: (_filter?: ReportFilter): Promise<LedgerEntry[]> =>
    fetchMockLedger(),
  getById: async (id: string): Promise<LedgerEntry | undefined> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockLedgerEntries.find((e) => e.id === id);
  },
  getBankAccounts: (): Promise<BankAccount[]> => fetchMockBankAccounts(),
  getPartyLedger: (): Promise<PartyLedgerAccount[]> => fetchMockPartyLedger(),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getBankAccounts: (): Promise<BankAccount[]> => fetchMockBankAccounts(),
  getSalesReport: (): Promise<SalesReportPoint[]> => fetchMockSalesReport(),
};
