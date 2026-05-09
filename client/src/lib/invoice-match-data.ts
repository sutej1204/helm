// ─── Types ────────────────────────────────────────────────────────────────────
export interface Clause {
  ref: string;
  text: string;
  sku_class: string;
  max_unit_price: number;
  valid_through: string;
}

export interface Agreement {
  id: string;
  supplierId: string;
  ref: string;
  counterparty: string;
  signedDate: string;
  fileRef: string;
  clauses: Clause[];
}

export interface PoLine {
  sku: string;
  qty: number;
  unit_price: number;
}

export interface PO {
  id: string;
  ref: string;
  supplierId: string;
  issuedDate: string;
  lines: PoLine[];
}

export interface ReceiptLine {
  sku: string;
  qty_received: number;
  received_date: string;
}

export interface Receipt {
  id: string;
  ref: string;
  poId: string;
  lines: ReceiptLine[];
}

export interface InvoiceLine {
  id: string;
  sku: string;
  description: string;
  qty: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  ref: string;
  supplierId: string;
  supplierName: string;
  received_date: string;
  total: number;
  poRef: string;
  receiptRef: string;
  agreementRef: string | null;
  lines: InvoiceLine[];
}

export interface RecoveryItem {
  id: string;
  invoiceRef: string;
  supplier: string;
  type: string;
  amount: number;
  status: "new" | "credit_memo_pending" | "recovered";
  routedToday: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
export const agreements: Record<string, Agreement> = {
  "SPA-CARRIER-2024": {
    id: "SPA-CARRIER-2024",
    supplierId: "trane",
    ref: "SPA-CARRIER-2024",
    counterparty: "Trane Technologies",
    signedDate: "Jan 15, 2024",
    fileRef: "FILE-SPA-7741.pdf",
    clauses: [
      {
        ref: "§4.2(a)",
        text: "Distributor program pricing on Carrier 24ABC series shall not exceed $1,247.00 per unit through 31 Dec 2026.",
        sku_class: "Carrier 24ABC",
        max_unit_price: 1247.0,
        valid_through: "2026-12-31",
      },
    ],
  },
};

export const pos: Record<string, PO> = {
  "PO-3382": {
    id: "PO-3382",
    ref: "PO-3382",
    supplierId: "trane",
    issuedDate: "Apr 1, 2026",
    lines: [
      { sku: "HVAC-AHU-4200", qty: 3, unit_price: 2100.0 },
      { sku: "HVAC-FAN-1100", qty: 8, unit_price: 485.0 },
      { sku: "CAR-24ABC6", qty: 12, unit_price: 1247.0 },
      { sku: "HVAC-CTRL-200", qty: 5, unit_price: 390.0 },
    ],
  },
};

export const receipts: Record<string, Receipt> = {
  "R-8821": {
    id: "R-8821",
    ref: "R-8821",
    poId: "PO-3382",
    lines: [
      { sku: "HVAC-AHU-4200", qty_received: 3, received_date: "Apr 12, 2026" },
      { sku: "HVAC-FAN-1100", qty_received: 8, received_date: "Apr 12, 2026" },
      { sku: "CAR-24ABC6", qty_received: 12, received_date: "Apr 12, 2026" },
      { sku: "HVAC-CTRL-200", qty_received: 5, received_date: "Apr 12, 2026" },
    ],
  },
};

export const invoices: Record<string, Invoice> = {
  "INV-44892": {
    id: "INV-44892",
    ref: "INV-44892",
    supplierId: "trane",
    supplierName: "Trane Technologies",
    received_date: "May 1, 2026",
    total: 15468.0,
    poRef: "PO-3382",
    receiptRef: "R-8821",
    agreementRef: "SPA-CARRIER-2024",
    lines: [
      { id: "L1", sku: "HVAC-AHU-4200", description: "Air Handler Unit 4200 Series", qty: 3, unit_price: 2100.0 },
      { id: "L2", sku: "HVAC-FAN-1100", description: "Fan Coil Unit 1100", qty: 8, unit_price: 485.0 },
      { id: "L3", sku: "CAR-24ABC6", description: "Carrier 24ABC6 Condensing Unit", qty: 12, unit_price: 1289.0 },
      { id: "L4", sku: "HVAC-CTRL-200", description: "HVAC Controller 200", qty: 5, unit_price: 390.0 },
    ],
  },
};

// AP Inbox rows (flat view for the table)
export const inboxRows = [
  {
    id: "INV-44892",
    supplier: "Trane Technologies",
    ref: "INV-44892",
    amount: 15468.0,
    receivedDate: "May 1, 2026",
    matchSummary: "3 / 4 legs matched",
    status: "variance" as const,
    varianceAmount: 504,
  },
  {
    id: "INV-2210",
    supplier: "Lennox International",
    ref: "INV-2210",
    amount: 8209.4,
    receivedDate: "May 2, 2026",
    matchSummary: "4 / 4 legs matched",
    status: "verified" as const,
  },
  {
    id: "INV-7711",
    supplier: "Daikin Applied",
    ref: "INV-7711",
    amount: 22100.0,
    receivedDate: "May 3, 2026",
    matchSummary: "4 / 4 legs matched",
    status: "verified" as const,
  },
  {
    id: "INV-9981",
    supplier: "Carrier Global",
    ref: "INV-9981",
    amount: 4332.0,
    receivedDate: "May 5, 2026",
    matchSummary: "Matching in progress…",
    status: "processing" as const,
  },
  {
    id: "INV-1182",
    supplier: "Mitsubishi Electric",
    ref: "INV-1182",
    amount: 6750.0,
    receivedDate: "May 6, 2026",
    matchSummary: "4 / 4 legs matched",
    status: "verified" as const,
  },
];

// Pre-seeded recovery items
export const seedRecoveryItems: RecoveryItem[] = [
  { id: "R-001", invoiceRef: "INV-44012", supplier: "Carrier Global",       type: "Volume tier missed",  amount: 1287.4, status: "credit_memo_pending", routedToday: false },
  { id: "R-002", invoiceRef: "INV-43788", supplier: "Lennox International", type: "SPA price breach",    amount: 890.0,  status: "credit_memo_pending", routedToday: false },
  { id: "R-003", invoiceRef: "INV-43210", supplier: "Trane Technologies",   type: "SPA price breach",    amount: 620.0,  status: "recovered",           routedToday: false },
  { id: "R-004", invoiceRef: "INV-42884", supplier: "Mitsubishi Electric",  type: "Freight terms breach",amount: 315.0,  status: "recovered",           routedToday: false },
];

// ─── Session store (module-level, persists across navigation) ─────────────────
export const recoverySession: { routedItems: RecoveryItem[] } = {
  routedItems: [],
};

export function routeToRecovery(invoiceRef: string, supplier: string, amount: number) {
  const already = recoverySession.routedItems.find(i => i.invoiceRef === invoiceRef);
  if (already) return;
  recoverySession.routedItems.unshift({
    id: `R-NEW-${Date.now()}`,
    invoiceRef,
    supplier,
    type: "SPA price breach",
    amount,
    status: "new",
    routedToday: true,
  });
}

// ─── Match logic helpers ──────────────────────────────────────────────────────
export function computeVariance(line: InvoiceLine, agreementRef: string | null) {
  if (!agreementRef) return null;
  const agr = agreements[agreementRef];
  if (!agr) return null;
  const clause = agr.clauses.find(c => line.sku.startsWith(c.sku_class.replace("Carrier ", "CAR-")));
  if (!clause) return null;
  if (line.unit_price <= clause.max_unit_price) return null;
  const delta = line.unit_price - clause.max_unit_price;
  return {
    clause,
    agreement: agr,
    invoiceUnit: line.unit_price,
    agreementUnit: clause.max_unit_price,
    perUnitDelta: delta,
    totalRecoverable: delta * line.qty,
  };
}
