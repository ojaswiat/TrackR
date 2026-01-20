import type { TAccount } from "~~/shared/types/entity.types";
import { and, eq, sql, sum } from "drizzle-orm";
import { map, reduce } from "lodash-es";
import { db } from "~~/server/utils/db";
import { TRANSACTION_TYPE } from "~~/shared/constants/enums";
import { accounts, transactions } from "~~/shared/db/schema";

// create a function to check if account exists
export async function checkAccountExist(accountId: string): Promise<boolean> {
    const result = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.id, accountId));

    return result.length > 0;
}

// create a function to check if account belongs to the user
export async function checkAccountBelongsToUser(accountId: string, userId: string): Promise<boolean> {
    const result = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.id, accountId), eq(accounts.user_id, userId)));

    return result.length > 0;
}

// create a function to get account details:
export async function getAccountDetails(accountId: string): Promise<TAccount> {
    const account = await db
        .query
        .accounts
        .findFirst({
            where: eq(accounts.id, accountId),
        });

    if (!account) {
        throw new Error("Account not found");
    }

    const totals = await db
        .select({
            type: transactions.type,
            total: sum(transactions.amount),
        })
        .from(transactions)
        .where(eq(transactions.account_id, accountId))
        .groupBy(transactions.type);

    let total_income = 0;
    let total_expense = 0;

    totals.forEach((t) => {
        if (t.type === TRANSACTION_TYPE.INCOME) {
            total_income = Number(t.total);
        }
        if (t.type === TRANSACTION_TYPE.EXPENSE) {
            total_expense = Number(t.total);
        }
    });

    return {
        ...account,
        total_income,
        total_expense,
    } as TAccount;
}

// create a function to get all accounts for a user
export async function getAllAccountsForUser(userId: string): Promise<TAccount[]> {
    const result = await db
        .select({
            account: accounts,
            total_income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = ${TRANSACTION_TYPE.INCOME} THEN ${transactions.amount} ELSE 0 END), 0)`,
            total_expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = ${TRANSACTION_TYPE.EXPENSE} THEN ${transactions.amount} ELSE 0 END), 0)`,
        })
        .from(accounts)
        .leftJoin(transactions, eq(accounts.id, transactions.account_id))
        .where(eq(accounts.user_id, userId))
        .groupBy(accounts.id);

    const accountsWithTotals = map(result, ({ account, total_income, total_expense }) => ({
        ...account,
        initial_balance: Number(account.initial_balance),
        total_income: Number(total_income),
        total_expense: Number(total_expense),
    }));

    const allAccountsSummary: TAccount = {
        id: "acc_000",
        name: "All Accounts",
        description: "Combined view of all accounts",
        initial_balance: 0,
        color: "#333333",
        total_income: reduce(accountsWithTotals, (acc, curr) => acc + (curr.total_income ?? 0), 0),
        total_expense: reduce(accountsWithTotals, (acc, curr) => acc + (curr.total_expense ?? 0), 0),
    };

    return [allAccountsSummary, ...accountsWithTotals];
}
