// Category-wise expenses - per account, for scalability, account id is must

import type { TCategory } from "~~/shared/types/entity.types";
import { filter, includes, reduce } from "lodash-es";
import accountsData from "~~/data/account.json";
import categoriesData from "~~/data/category.json";
import transactionsData from "~~/data/transaction.json";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { CATEGORY_TYPE, SERVER_STATUS_CODES, TRANSACTION_TYPE } from "~~/shared/constants/enums";

type TRequestBody = {
    filters?: {
        account_id?: string[];
    };
};

export default defineEventHandler(async (event) => {
    const body = (await readBody(event)) as TRequestBody;
    const accountIds = body.filters?.account_id ?? [];

    const allAccounts = accountsData.accounts;
    const allAccountIds = allAccounts.map((acc) => acc.id);

    // Determine which account IDs to process
    // If empty array, process all accounts
    const shouldProcessAllAccounts = accountIds.length === 0;
    const targetAccountIds = shouldProcessAllAccounts ? allAccountIds : accountIds;

    // Validate account IDs (if not processing all)
    if (!shouldProcessAllAccounts) {
        const invalidAccountIds = targetAccountIds.filter((id) => !allAccountIds.includes(id));
        if (invalidAccountIds.length > 0) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.NOT_FOUND,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.NOT_FOUND],
                message: "One or more accounts not found",
                data: {
                    errors: { account_id: invalidAccountIds },
                },
            });
        }
    }

    // Expenses for the selected account(s)
    const expenses = filter(transactionsData.transactions, (transaction) => {
        return transaction.type === TRANSACTION_TYPE.EXPENSE && targetAccountIds.includes(transaction.account_id);
    });

    type TNewCategory = TCategory & { total_amount: number };

    const categories = filter(categoriesData.categories, (category) => category.type === CATEGORY_TYPE.EXPENSE) as TNewCategory[];
    categories.forEach((category) => {
        category.total_amount = 0;
    });

    // Aggregate expenses by category across all selected accounts
    const categoryAmount: Record<string, number> = reduce(
        expenses,
        (accumulator, expense) => {
            if (!accumulator[expense.category_id]) {
                accumulator[expense.category_id] = expense.amount;
            } else {
                accumulator[expense.category_id] += expense.amount;
            }

            return accumulator;
        },
        {} as Record<string, number>,
    );

    categories.forEach((category) => {
        category.total_amount = categoryAmount[category.id] ?? 0;
    });

    return {
        statusCode: SERVER_STATUS_CODES.OK,
        statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
        message: "Category expenses fetched successfully",
        data: {
            categories,
        },
    };
});
