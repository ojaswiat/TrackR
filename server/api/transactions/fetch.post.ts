import { filter, map, sortBy } from "lodash-es";
import accountsData from "~~/data/account.json";
import transactionData from "~~/data/transaction.json";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

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

    // Get transactions for the selected account(s)
    const transactionsByAccount = filter(transactionData.transactions, (transaction) =>
        targetAccountIds.includes(transaction.account_id));

    const dateTransactions = map(transactionsByAccount, (transaction) => {
        return {
            ...transaction,
            created_at: new Date(transaction.created_at),
            updated_at: new Date(transaction.updated_at),
        };
    });

    const sortedTransactionsByDate = sortBy(dateTransactions, ["updated_at"]);

    return {
        statusCode: SERVER_STATUS_CODES.OK,
        statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
        message: "Transactions fetched successfully",
        data: {
            transactions: sortedTransactionsByDate,
            cursor: {
                handle: "some-random",
                limit: 20,
            },
        },
    };
});
