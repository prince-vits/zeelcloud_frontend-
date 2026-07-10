import type { AppStackParamList } from '../types';

export interface AppModule {
  key: string; // also the AppStack route to navigate to
  label: string;
  icon: string;
  color: string;
  route: keyof AppStackParamList;
}

// Modules that can be opened from the company context and bookmarked on the Dashboard.
export const APP_MODULES: AppModule[] = [
  { key: 'SalesRegisterStack', label: 'Sales Register', icon: 'receipt', color: '#2563EB', route: 'SalesRegisterStack' },
  { key: 'PurchaseRegisterStack', label: 'Purchase Register', icon: 'clipboard-list-outline', color: '#7C3AED', route: 'PurchaseRegisterStack' },
  { key: 'SalesOsStack', label: 'AR Outstanding', icon: 'currency-inr', color: '#10B981', route: 'SalesOsStack' },
  { key: 'PurchaseOsStack', label: 'AP Outstanding', icon: 'cart-outline', color: '#F59E0B', route: 'PurchaseOsStack' },
  { key: 'GpOsStack', label: 'GP Outstanding', icon: 'file-document-check-outline', color: '#8B5CF6', route: 'GpOsStack' },
  { key: 'GpRegisterStack', label: 'GP Register', icon: 'chart-bar', color: '#0EA5E9', route: 'GpRegisterStack' },
  { key: 'NonIssueStack', label: 'Non-Issue', icon: 'format-list-text', color: '#EF4444', route: 'NonIssueStack' },
  { key: 'BankCashLedger', label: 'Bank / Cash Ledger', icon: 'bank-outline', color: '#06B6D4', route: 'BankCashLedger' },
  { key: 'PartyLedger', label: 'Party Ledger', icon: 'account-cash-outline', color: '#EC4899', route: 'PartyLedger' },
];

export const DEFAULT_BOOKMARKS: string[] = [
  'SalesRegisterStack',
  'PurchaseRegisterStack',
  'SalesOsStack',
  'PurchaseOsStack',
];
