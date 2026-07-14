import { useAuthStore } from '../store/authStore';
import type {
  BankAccount,
  Company,
  GpOsInvoice,
  GpOsParty,
  GpRegisterEntry,
  PartyLedgerAccount,
  PurchaseOsInvoice,
  PurchaseOsParty,
  RegisterEntry,
  ReportFilter,
  SalesOsArea,
  SalesOsBroker,
  SalesOsInvoice,
  SalesOsParty,
  SalesOsPartyGroup,
  SalesOsSalesPerson,
  StockItem,
  StockReportType,
} from '../types';

type JsonRecord = Record<string, unknown>;

const API_BASE_URL = 'https://shininess-magnifier-fructose.ngrok-free.dev/api/v1';
const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export function getAuthToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('No authentication token available');
  return token;
}

export function authHeaders(): Record<string, string> {
  return {
    ...API_HEADERS,
    Authorization: `Token ${getAuthToken()}`,
  };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' ? (value as JsonRecord) : {};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const extractDataArray = (payload: unknown): JsonRecord[] => {
  if (Array.isArray(payload)) return payload.map(asRecord);
  const record = asRecord(payload);
  if (Array.isArray(record.data)) return record.data.map(asRecord);
  return [];
};

export function buildOsQuery(
  filter?: ReportFilter,
  extra?: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  if (filter?.fromDate) params.set('from_date', filter.fromDate);
  if (filter?.toDate) params.set('to_date', filter.toDate);
  params.set('onlydue', filter?.onlyDue ? '1' : '0');

  if (filter?.commonCompany) {
    params.set('company', '0');
  } else if (filter?.companyId) {
    params.set('company', filter.companyId);
  }
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function buildCompanyQuery(companyId?: string, extra?: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  if (companyId) params.set('company', companyId);
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

const parseCity = (item: JsonRecord): string =>
  asString(item.vv_area) ||
  asString(item.vv_address1) ||
  asString(item.vv_address) ||
  asString(item.vv_address1);

export const mapCompany = (item: JsonRecord): Company => {
  const osRaw = asRecord(item.os);
  const banksRaw = Array.isArray(item.banks) ? item.banks : [];
  
  return {
    recordId: typeof item.vn_company_id === 'number' ? item.vn_company_id : undefined,
    id: String(item.vn_company_id ?? item.id ?? ''),
    name: asString(item.vv_company_name, 'Unknown Company'),
    city: asString(item.vv_address),
    gstinNo: asString(item.vv_gstin_no) || undefined,
    isActive: true,
    isCommon: item.is_common === true,
    bankName: asString(item.vv_bank_name) || undefined,
    branchName: asString(item.vv_branch_name) || undefined,
    accountNo: asString(item.vv_account_no) || undefined,
    ifscCode: asString(item.vv_ifsc_code) || undefined,
    banks: banksRaw.map((b) => {
      const br = asRecord(b);
      return {
        name: asString(br.vv_bank_name),
        balance: asNumber(br.vn_balance),
        dc: asString(br.vv_dc),
      };
    }),
    os: {
      totalPurchase: asNumber(osRaw.total_purchase),
      totalSales: asNumber(osRaw.total_sales),
      totalGp: asNumber(osRaw.total_gp),
    },
  };
};

export const mapBillToSalesInvoice = (item: JsonRecord, partyId: string): SalesOsInvoice => {
  const companyId = asNumber(item.vn_company_id);
  const billNo = asString(item.vv_bill_no);
  const dueDays = asNumber(item.due_days);
  return {
    id: `${companyId}-${billNo}`,
    number: billNo,
    date: asString(item.vd_bill_date),
    amount: asNumber(item.vn_balance),
    outstanding: asNumber(item.vn_balance),
    daysLeft: dueDays > 0 ? -dueDays : Math.abs(dueDays),
    partyId,
    totalDueDays: asNumber(item.total_due_days),
    termDays: asNumber(item.vn_due_days),
    amountBeforeGst: asNumber(item.vn_amount_befor_gst ?? item.VN_Amount_Befor_Gst),
  };
};

export const mapSalesOsParty = (item: JsonRecord): SalesOsParty => {
  const partyIdStr = String(item.vn_party_id ?? item.id ?? '');
  return {
    id: partyIdStr,
    name: asString(item.vv_party_name),
    city: parseCity(item),
    totalOs: asNumber(item.vn_balance__sum),
    invoiceCount: 0,
    daysOverdue: 0,
    lastPayment: '',
    phone: asString(item.vv_mobile) || asString(item.vv_brocker_mobile) || undefined,
    bills: Array.isArray(item.bills) ? item.bills.map(b => mapBillToSalesInvoice(asRecord(b), partyIdStr)) : undefined,
  };
};

export const mapPurchaseOsParty = (item: JsonRecord): PurchaseOsParty => ({
  id: String(item.vn_party_id ?? item.id ?? ''),
  name: asString(item.vv_party_name),
  city: parseCity(item),
  totalOs: asNumber(item.vn_balance__sum),
  invoiceCount: 0,
  daysOverdue: 0,
  phone: asString(item.vv_mobile) || undefined,
});

export const mapGpOsParty = (item: JsonRecord): GpOsParty => ({
  id: String(item.vn_party_id ?? item.id ?? ''),
  name: asString(item.vv_party_name),
  address: parseCity(item),
  totalOs: asNumber(item.vn_balance__sum),
  invoiceCount: 0,
  daysOverdue: 0,
  phone: asString(item.vv_mobile) || undefined,
});

export const mapSalesOsBroker = (item: JsonRecord): SalesOsBroker => ({
  id: String(item.vn_brocker_id ?? item.id ?? asString(item.vv_brocker_name)),
  name: asString(item.vv_brocker_name),
  city: '',
  totalOs: asNumber(item.vn_balance__sum),
  partyCount: 0,
  phone: asString(item.vv_brocker_mobile) || undefined,
});

export const mapSalesOsArea = (item: JsonRecord): SalesOsArea => ({
  id: asString(item.vv_area),
  name: asString(item.vv_area),
  totalOs: asNumber(item.vn_balance__sum),
  partyCount: 0,
});

export const mapSalesOsPartyGroup = (item: JsonRecord): SalesOsPartyGroup => ({
  id: asString(item.vv_party_group),
  name: asString(item.vv_party_group),
  totalOs: asNumber(item.vn_balance__sum),
  partyCount: 0,
});

export const mapSalesOsSalesPerson = (item: JsonRecord): SalesOsSalesPerson => ({
  id: asString(item.vv_sales_person),
  name: asString(item.vv_sales_person),
  totalOs: asNumber(item.vn_balance__sum),
  partyCount: 0,
});


const mapBillToPurchaseInvoice = (item: JsonRecord, partyId: string): PurchaseOsInvoice => {
  const companyId = asNumber(item.vn_company_id);
  const billNo = asString(item.vv_bill_no);
  const dueDays = asNumber(item.due_days);
  return {
    id: `${companyId}-${billNo}`,
    number: billNo,
    date: asString(item.vd_bill_date),
    amount: asNumber(item.vn_balance),
    outstanding: asNumber(item.vn_balance),
    daysLeft: dueDays > 0 ? -dueDays : Math.abs(dueDays),
    partyId,
    totalDueDays: asNumber(item.total_due_days),
    termDays: asNumber(item.vn_due_days),
    amountBeforeGst: asNumber(item.vn_amount_befor_gst ?? item.VN_Amount_Befor_Gst),
  };
};

export const mapBillToGpInvoice = (item: JsonRecord): GpOsInvoice => {
  const companyId = asNumber(item.vn_company_id);
  const billNo = asString(item.vv_bill_no);
  const dueDays = asNumber(item.due_days);
  return {
    id: `${companyId}-${billNo}`,
    companyId,
    companyRef: asString(item.vv_cmp),
    bookCode: asString(item.vv_book_code),
    billNo,
    billDate: asString(item.vd_bill_date),
    balance: asNumber(item.vn_balance),
    partyName: asString(item.vv_party_name),
    partyId: asNumber(item.vn_party_id),
    address: asString(item.vv_address1),
    brokerName: asString(item.vv_brocker_name),
    brokerId: asNumber(item.vn_brocker_id),
    dueDate: asString(item.vd_due_date),
    termDays: asNumber(item.vn_due_days),
    finYear: asString(item.vv_fin_year),
    totalDueDays: asNumber(item.total_due_days),
    dueDays,
    amountBeforeGst: asNumber(item.vn_amount_befor_gst ?? item.VN_Amount_Befor_Gst),
  };
};

export type PartyBillsResponse = {
  invoices: SalesOsInvoice[] | PurchaseOsInvoice[] | GpOsInvoice[];
  party?: SalesOsParty | PurchaseOsParty | GpOsParty;
};

export async function fetchPartyBills(
  partyId: string,
  type: 'sales' | 'purchase' | 'generalpurchase',
  filter?: ReportFilter,
): Promise<PartyBillsResponse> {
  const query = buildOsQuery(filter);
  const payload = await apiFetch<unknown>(`/party/${partyId}/${type}${query}`);
  const record = asRecord(payload);
  const rows = extractDataArray(payload);
  const totals = Array.isArray(record.total_outstanding)
    ? record.total_outstanding.map(asRecord)
    : [];
  const totalRow = totals[0];

  if (type === 'sales') {
    const invoices = rows.map((row) => mapBillToSalesInvoice(row, partyId));
    const party = totalRow
      ? mapSalesOsParty(totalRow)
      : rows[0]
        ? {
            id: partyId,
            name: asString(rows[0].vv_party_name),
            city: parseCity(rows[0]),
            totalOs: invoices.reduce((sum, inv) => sum + inv.outstanding, 0),
            invoiceCount: invoices.length,
            daysOverdue: Math.max(0, ...invoices.map((inv) => (inv.daysLeft < 0 ? -inv.daysLeft : 0))),
            lastPayment: '',
            phone: asString(rows[0].vv_mobile) || undefined,
          }
        : undefined;
    return { invoices, party };
  }

  if (type === 'purchase') {
    const invoices = rows.map((row) => mapBillToPurchaseInvoice(row, partyId));
    const party = totalRow
      ? mapPurchaseOsParty(totalRow)
      : rows[0]
        ? {
            id: partyId,
            name: asString(rows[0].vv_party_name),
            city: parseCity(rows[0]),
            totalOs: invoices.reduce((sum, inv) => sum + inv.outstanding, 0),
            invoiceCount: invoices.length,
            daysOverdue: Math.max(0, ...invoices.map((inv) => (inv.daysLeft < 0 ? -inv.daysLeft : 0))),
            phone: asString(rows[0].vv_mobile) || undefined,
          }
        : undefined;
    return { invoices, party };
  }

  const invoices = rows.map(mapBillToGpInvoice);
  const party = totalRow
    ? mapGpOsParty(totalRow)
    : rows[0]
      ? {
          id: partyId,
          name: asString(rows[0].vv_party_name),
          address: parseCity(rows[0]),
          totalOs: invoices.reduce((sum, inv) => sum + inv.balance, 0),
          invoiceCount: invoices.length,
          daysOverdue: Math.max(0, ...invoices.map((inv) => inv.dueDays)),
          phone: asString(rows[0].vv_mobile) || undefined,
        }
      : undefined;
  return { invoices, party };
}

export const mapRegisterEntry = (item: JsonRecord): RegisterEntry => ({
  id: String(item.vn_invoice_id ?? item.id ?? ''),
  date: asString(item.vd_invoice_date),
  partyName: asString(item.party_name),
  amount: asNumber(item.vn_net_total),
  type: asString(item.vv_book_name, 'Invoice'),
  invoiceNo: asString(item.vn_invoice_no),
});

export const mapGpRegisterEntry = (item: JsonRecord): GpRegisterEntry => ({
  id: String(item.vn_invoice_id ?? item.id ?? ''),
  date: asString(item.vd_invoice_date),
  partyName: asString(item.party_name),
  grayQty: asNumber(item.vn_gray_qty),
  beamQty: asNumber(item.vn_beam_qty),
  processType: asString(item.vv_process_type),
  amount: asNumber(item.vn_net_total),
  lotNo: asString(item.vv_lot_no) || undefined,
  quality: asString(item.vv_quality) || undefined,
});

export const mapPartyLedgerAccount = (item: JsonRecord): PartyLedgerAccount => ({
  id: String(item.vn_account_id ?? item.id ?? ''),
  name: asString(item.vv_party_name),
  balance: asNumber(item.balance),
  phone: asString(item.vv_mobile),
});

export const mapBankAccount = (item: JsonRecord, index: number): BankAccount => ({
  id: String(item.vn_account_id ?? item.id ?? `${asString(item.vv_bank_name)}-${index}`),
  name: asString(item.vv_party_name) || asString(item.vv_bank_name),
  accountNo: asString(item.vv_account_no) || undefined,
  amount: asNumber(item.balance) || asNumber(item.vn_balance),
});

export function aggregateStockData(data: JsonRecord[], reportType: StockReportType): JsonRecord[] {
  const map = new Map<string, JsonRecord>();
  for (const row of data) {
    const itemName = asString(row.vv_item_name);
    const lotNo = reportType === 'qualityLotGrade' ? asString(row.vv_lot_no) : '';
    const key = `${itemName}|${lotNo}`;

    if (!map.has(key)) {
      map.set(key, {
        vv_item_name: itemName,
        vv_lot_no: lotNo,
        vn_meter__sum: asNumber(row.vn_meter__sum ?? row.vn_meter),
        vn_weight__sum: asNumber(row.vn_weight__sum ?? row.vn_weight),
        vn_pallu__sum: asNumber(row.vn_pallu__sum ?? row.vn_pallu),
        vn_net_weight__sum: asNumber(row.vn_net_weight__sum ?? row.vn_net_weight),
        vn_cheese__sum: asNumber(row.vn_cheese__sum ?? row.vn_cheese),
        vn_beam__sum: asNumber(row.vn_beam__sum ?? row.vn_beam),
        vv_taka_no__count: asNumber(row.vv_taka_no__count) || (row.vv_taka_no || row.id ? 1 : 0),
      });
    } else {
      const agg = map.get(key)!;
      agg.vn_meter__sum = asNumber(agg.vn_meter__sum) + asNumber(row.vn_meter__sum ?? row.vn_meter);
      agg.vn_weight__sum = asNumber(agg.vn_weight__sum) + asNumber(row.vn_weight__sum ?? row.vn_weight);
      agg.vn_pallu__sum = asNumber(agg.vn_pallu__sum) + asNumber(row.vn_pallu__sum ?? row.vn_pallu);
      agg.vn_net_weight__sum = asNumber(agg.vn_net_weight__sum) + asNumber(row.vn_net_weight__sum ?? row.vn_net_weight);
      agg.vn_cheese__sum = asNumber(agg.vn_cheese__sum) + asNumber(row.vn_cheese__sum ?? row.vn_cheese);
      agg.vn_beam__sum = asNumber(agg.vn_beam__sum) + asNumber(row.vn_beam__sum ?? row.vn_beam);
      agg.vv_taka_no__count = asNumber(agg.vv_taka_no__count) + (asNumber(row.vv_taka_no__count) || (row.vv_taka_no || row.id ? 1 : 0));
    }
  }
  return Array.from(map.values());
}

export const mapYarnStockItem = (item: JsonRecord, category: 'yarn' | 'beam' | 'nonIssue'): StockItem => ({
  id: asString(item.vv_item_name),
  name: asString(item.vv_item_name),
  quality: asString(item.vv_item_name),
  qty: asNumber(item.vn_meter__sum ?? item.vn_weight__sum),
  unit: 'MTR',
  value: 0,
  location: '',
  category,
  taka: asNumber(item.vv_taka_no__count),
  meter: asNumber(item.vn_meter__sum),
  weight: asNumber(item.vn_weight__sum),
  pallu: asNumber(item.vn_pallu__sum),
  netWeight: asNumber(item.vn_net_weight__sum),
  cheese: asNumber(item.vn_cheese__sum),
  beam: asNumber(item.vn_beam__sum),
  crtn: asNumber(item.vv_taka_no__count),
  avgWt: asNumber(item.vn_weight__sum) / (asNumber(item.vv_taka_no__count) || 1),
  lotNo: asString(item.vv_lot_no),
});

export function stockEndpoint(
  source: 'yarn' | 'beam' | 'gray' | 'sequance' | 'nonIssue',
  reportType: StockReportType,
): string {
  const base =
    source === 'yarn'
      ? 'yarn-stock'
      : source === 'beam'
        ? 'beam-stock'
        : source === 'gray'
          ? 'gray-stock'
          : 'sequance-stock';
  const suffix = reportType === 'qualityLotGrade' ? 'summary/item-summary-lot' : 'summary/item';
  return `/${base}/${suffix}`;
}
