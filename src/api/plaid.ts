/**
 * Plaid Adapter API client.
 * Ingest bank accounts and transactions. All responses normalized with safe array/object guards.
 * Endpoints: POST /plaid/accounts.sync, POST /plaid/transactions.sync, GET /plaid/accounts
 */

import { api, safeArray } from "@/lib/api";

export interface PlaidAccount {
  id: string;
  plaidId: string;
  name: string;
  type: string;
  officialBalance: number;
  currency: string;
  lastSync: string | null;
}

export interface PlaidTransaction {
  id: string;
  externalId: string;
  accountId: string;
  date: string;
  amount: number;
  merchant: string;
  categoryId: string | null;
  status: string;
  source: string;
}

function asAccounts(data: unknown): PlaidAccount[] {
  return safeArray<PlaidAccount>(data);
}

function asTransactions(data: unknown): PlaidTransaction[] {
  return safeArray<PlaidTransaction>(data);
}

export interface AccountsSyncResponse {
  accounts: PlaidAccount[];
  syncedAt: string;
}

export interface TransactionsSyncResponse {
  transactions: PlaidTransaction[];
  syncedAt: string;
}

export interface AccountsResponse {
  accounts: PlaidAccount[];
  lastSync?: string;
}

export async function plaidAccountsSync(accessToken?: string, userId?: string): Promise<AccountsSyncResponse> {
  const raw = await api.post<{ data?: AccountsSyncResponse } | AccountsSyncResponse>(
    "/plaid/accounts.sync",
    { accessToken: accessToken ?? null, userId: userId ?? "" }
  );
  const data = (raw as { data?: AccountsSyncResponse })?.data ?? (raw as AccountsSyncResponse);
  const accounts = Array.isArray(data?.accounts) ? data.accounts : asAccounts((data as { accounts?: unknown })?.accounts);
  return {
    accounts: accounts ?? [],
    syncedAt: typeof data?.syncedAt === "string" ? data.syncedAt : new Date().toISOString(),
  };
}

export async function plaidTransactionsSync(
  accessToken?: string,
  userId?: string,
  startDate?: string,
  endDate?: string
): Promise<TransactionsSyncResponse> {
  const raw = await api.post<{ data?: TransactionsSyncResponse } | TransactionsSyncResponse>(
    "/plaid/transactions.sync",
    {
      accessToken: accessToken ?? null,
      userId: userId ?? "",
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    }
  );
  const data = (raw as { data?: TransactionsSyncResponse })?.data ?? (raw as TransactionsSyncResponse);
  const transactions = Array.isArray(data?.transactions)
    ? data.transactions
    : asTransactions((data as { transactions?: unknown })?.transactions);
  return {
    transactions: transactions ?? [],
    syncedAt: typeof data?.syncedAt === "string" ? data.syncedAt : new Date().toISOString(),
  };
}

export async function plaidGetAccounts(userId?: string): Promise<AccountsResponse> {
  const params = typeof userId === "string" && userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const raw = await api.get<{ data?: AccountsResponse } | AccountsResponse>(`/plaid/accounts${params}`);
  const data = (raw as { data?: AccountsResponse })?.data ?? (raw as AccountsResponse);
  const accounts = Array.isArray(data?.accounts) ? data.accounts : asAccounts((data as { accounts?: unknown })?.accounts);
  return {
    accounts: accounts ?? [],
    lastSync: typeof data?.lastSync === "string" ? data.lastSync : undefined,
  };
}
