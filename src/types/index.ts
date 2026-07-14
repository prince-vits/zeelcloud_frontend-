// ─── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  companyName?: string;
  updatedAt?: string;
  userCompanies?: ProfileCompany[];
  isSubuser?: boolean;
  parentUserId?: number | null;
  allowedForms?: AllowedForm[];
}

export interface ProfileCompany {
  id: string;
  companyId: number;
  name: string;
  gstinNo?: string;
  isCommon: boolean;
}

export interface AllowedForm {
  id: number;
  formName: string;
}

export interface Company {
  id: string;
  recordId?: number;
  name: string;
  city: string;
  gstinNo?: string;
  isActive: boolean;
  isCommon?: boolean;
  bankName?: string;
  branchName?: string;
  accountNo?: string;
  ifscCode?: string;
  banks?: { name: string; balance: number; dc: string }[];
  os?: { totalPurchase: number; totalSales: number; totalGp: number };
}
// Sub Users (account-level user management)
export interface SubUser {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  companyName: string;
  isActive: boolean;
  allowedModules: string[]; // module keys from PERMISSION_MODULES
  allowedFormIds?: number[]; // form IDs for API updates
}

// Dashboard — Bank & Cash balances
export interface BankAccount {
  id: string;
  name: string;
  accountNo?: string;
  amount: number;
}

// Dashboard — Sales report chart
export interface SalesReportPoint {
  label: string;
  thisWeek: number;
  lastWeek: number;
}

// Item Master — from GET /api/v1/items/
export interface Item {
  id: number;         // vn_item_id
  recordId: number;   // DB row id
  code: string;       // vv_item_code
  name: string;       // vv_item_name
  uom: string;        // vv_uom
  companyId: number;  // vn_company_id
  salesRate: number;  // vn_sales_rate
  hsnCode: string;    // vn_hsn_code
  gst: number;        // vn_gst
  productCode: string;// vv_product_code
}

// Account / Party — from GET /api/v1/accounts/
export interface AccountParty {
  id: number;   // account DB id
  name: string; // party name
}

// Sales Order — from GET /api/v1/sales-orders/
export interface SalesOrderApiItem {
  id: string;
  vn_item_id: number;
  vv_item_name: string;
  vv_color: string;
  vn_nos: number;
  vn_cut: number;
  vn_qnty: number;
  vn_rate: number;
  vn_amount: number;
  vn_line_no: number;
}

export interface SalesOrder {
  id: number;
  companyId: number;
  orderNo: string;
  date: string;
  partyId: number;
  partyName: string;
  discount: number;
  totalAmount: number;
  remark: string;
  items: SalesOrderApiItem[];
}

// POST body for creating a sales order
export interface CreateSalesOrderPayload {
  company_id: number;
  order_no: string;
  date: string;           // YYYY-MM-DD
  party_id: number;
  discount?: number;
  remark?: string;
  items: {
    item_id: number;
    color?: string;
    nos: number;
    cut: number;
    rate: number;
  }[];
}

// Sales Order (legacy local type — kept for compatibility)
export interface SalesOrderItem {
  id: string;
  sort: string;
  color: string;
  qty: number;
  rate: number;
  amount: number;
}

// Sales OS
export interface SalesOsParty {
  id: string;
  name: string;
  city: string;
  totalOs: number;
  invoiceCount: number;
  daysOverdue: number;
  lastPayment: string;
  creditLimit?: number;
  phone?: string;
  bills?: SalesOsInvoice[];
}

export interface SalesOsInvoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  outstanding: number;
  daysLeft: number;
  partyId: string;
  // Interest-calculator fields (map to OG: Total_due_days, Vn_due_days, VN_Amount_Befor_Gst)
  totalDueDays?: number;
  termDays?: number;
  amountBeforeGst?: number;
}

export interface SalesOsBroker {
  id: string;
  name: string;
  city: string;
  totalOs: number;
  partyCount: number;
  phone?: string;
}

export interface SalesOsArea {
  id: string;
  name: string;
  totalOs: number;
  partyCount: number;
}

export interface SalesOsPartyGroup {
  id: string;
  name: string;
  totalOs: number;
  partyCount: number;
}

export interface SalesOsSalesPerson {
  id: string;
  name: string;
  totalOs: number;
  partyCount: number;
  target?: number;
}

// Purchase OS
export interface PurchaseOsParty {
  id: string;
  name: string;
  city: string;
  totalOs: number;
  invoiceCount: number;
  daysOverdue: number;
  phone?: string;
}

export interface PurchaseOsInvoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  outstanding: number;
  daysLeft: number;
  partyId: string;
  // Interest-calculator fields (map to OG: Total_due_days, Vn_due_days, VN_Amount_Befor_Gst)
  totalDueDays?: number;
  termDays?: number;
  amountBeforeGst?: number;
}

// GP Outstanding (General Purchase) — party-wise summary
export interface GpOsParty {
  id: string;            // VN_party_id
  name: string;          // VV_party_name
  address: string;       // VV_address1 (city / area)
  totalOs: number;       // VN_balance__sum
  invoiceCount: number;  // count of bills (computed)
  daysOverdue: number;   // max overdue days (computed)
  phone?: string;
}

// Broker reference from the GP summary API
export interface GpOsSummaryBroker {
  id: string;   // VN_brocker_id
  name: string; // VV_brocker_name
}

// GP Outstanding — bill-level detail row
export interface GpOsInvoice {
  id: string;               // `${Vn_company_id}-${Vv_bill_no}`
  companyId: number;        // Vn_company_id
  companyRef: string;       // Vv_cmp (company reference code)
  bookCode: string;         // Vv_book_code
  billNo: string;           // Vv_bill_no
  billDate: string;         // Vd_bill_date ("dd/MM/yyyy")
  balance: number;          // Vn_balance
  partyName: string;        // Vv_party_name
  partyId: number;          // Vn_party_id
  address: string;          // Vv_address1
  brokerName: string;       // Vv_brocker_name
  brokerId: number;         // Vn_brocker_id
  dueDate: string;          // Vd_due_date
  termDays: number;         // Vn_due_days (credit term days)
  finYear: string;          // Vv_fin_year
  totalDueDays: number;     // Total_due_days
  dueDays: number;          // due_days (net overdue = totalDueDays - termDays)
  amountBeforeGst: number;  // VN_Amount_Befor_Gst
  isChecked?: boolean;      // client-side selection state
}

// GP Outstanding — detail total
export interface GpOsPartyTotal {
  partyId: number;      // Vn_party_id
  totalBalance: number; // Vn_balance__sum
}

// Registers
export interface RegisterEntry {
  id: string;
  date: string;
  partyName: string;
  amount: number;
  type: string;
  invoiceNo: string;
  items?: RegisterItem[];
  tax?: number;
  discount?: number;
}

export interface RegisterItem {
  name: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

// GP Register
export interface GpRegisterEntry {
  id: string;
  date: string;
  partyName: string;
  grayQty: number;
  beamQty: number;
  processType: string;
  amount: number;
  lotNo?: string;
  quality?: string;
}

// Stock
export interface StockItem {
  id: string;
  name: string;
  quality: string;
  qty: number;
  unit: string;
  value: number;
  location: string;
  category: 'yarn' | 'beam' | 'nonIssue';
  lotNo?: string;
  pieces?: number;
  // Beam grid columns
  beam?: number;
  meter?: number;
  weight?: number;
  // Yarn grid columns
  crtn?: number;
  netWeight?: number;
  cheese?: number;
  // Gray grid columns
  taka?: number;
  avgWt?: number;
  pallu?: number;
}

// OG report variants (NonIssueReportSelection): Quality Wise for all, plus a
// Quality + Lot No. + Grade Wise variant for Yarn.
export type StockReportType = 'quality' | 'qualityLotGrade';

// Ledger — party balances
export interface PartyLedgerAccount {
  id: string;
  name: string;
  balance: number; // +ve = receivable/Dr, -ve = payable/Cr
  phone: string;
}

// Ledger
export interface LedgerEntry {
  id: string;
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  voucherNo?: string;
  narration?: string;
}

// Filters
export interface ReportFilter {
  reportType: string;
  fromDate: string;
  toDate: string;
  sortBy?: string; // Sales OS no longer exposes sort; data is latest-first
  // Sales O/S toggles (map to OG API params):
  onlyDue?: boolean;       // OG: onlydue=1/0 — only bills past their due date
  commonCompany?: boolean; // OG: when true, omit company= → aggregate all companies
  companyId?: string;      // OG: company={VN_company_id} when Common Company is OFF
}

// ─── Navigation Param Types ───────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  App: undefined;
};

// Top-level stack after login. Holds the two tab contexts plus any screen
// that should appear *over* the tab bars (modules, about, contact).
export type AppStackParamList = {
  AccountTabs: undefined;
  Company: undefined;
  SalesOsStack: undefined;
  PurchaseOsStack: undefined;
  SalesRegisterStack: undefined;
  PurchaseRegisterStack: undefined;
  GpRegisterStack: undefined;
  GpOsStack: undefined;
  NonIssueStack: undefined;
  BankCashLedger: undefined;
  PartyLedger: undefined;
  About: undefined;
  Contact: undefined;
};

// Account context (before / outside a company)
export type AccountTabParamList = {
  Companies: undefined;
  SubUsers: undefined;
  ProfileTab: undefined;
  Settings: undefined;
};

export type SubUserStackParamList = {
  SubUserList: undefined;
  CreateSubUser: undefined;
  EditSubUser: { userId: string };
  SubUserDetail: { userId: string };
};

// Company context (after selecting a company)
export type CompanyTabParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Stocks: undefined;
  CreateOrder: undefined;
  More: undefined;
};

export type SalesOsStackParamList = {
  SalesOsFilter: undefined;
  SalesOsPartyList: { filter: ReportFilter };
  SalesOsPartyDetail: { partyId: string; partyName: string; filter: ReportFilter };
  SalesOsBrokerList: { filter: ReportFilter };
  SalesOsBrokerDetail: { brokerId: string; brokerName: string; filter: ReportFilter };
  SalesOsAreaList: { filter: ReportFilter };
  SalesOsAreaDetail: { areaId: string; areaName: string; filter: ReportFilter };
  SalesOsPartyGroupList: { filter: ReportFilter };
  SalesOsPartyGroupDetail: { groupId: string; groupName: string; filter: ReportFilter };
  SalesOsSalesPersonList: { filter: ReportFilter };
  SalesOsSalesPersonDetail: { salesPersonId: string; salesPersonName: string; filter: ReportFilter };
};

export type PurchaseOsStackParamList = {
  PurchaseOsFilter: undefined;
  PurchaseOsPartyList: { filter: ReportFilter };
  PurchaseOsPartyDetail: { partyId: string; partyName: string; filter: ReportFilter };
};

export type GpOsStackParamList = {
  GpOsFilter: undefined;
  GpOsPartyList: { filter: ReportFilter };
  GpOsPartyDetail: { partyId: string; partyName: string; filter: ReportFilter };
};

export type SalesRegisterStackParamList = {
  SalesRegister: undefined;
  SalesRegisterDetail: { entryId: string };
};

export type PurchaseRegisterStackParamList = {
  PurchaseRegister: undefined;
  PurchaseRegisterDetail: { entryId: string };
};

export type GpRegisterStackParamList = {
  GpRegister: undefined;
  GpRegisterDetail: { entryId: string };
};

export type StockStackParamList = {
  Stock: undefined;
  StockFilter: { report: 'yarn' | 'gray' | 'beam' };
  YarnStock: { reportType: StockReportType };
  GrayStock: { reportType: StockReportType };
  BeamStock: { reportType: StockReportType };
  StockItemDetail: { itemId: string };
};

export type NonIssueStackParamList = {
  NonIssueSelection: undefined;
  NonIssueFilter: { report: 'yarn' | 'gray' | 'beam' };
  NonIssueYarn: { reportType: StockReportType };
  NonIssueBeam: { reportType: StockReportType };
  NonIssueGray: { reportType: StockReportType };
};


