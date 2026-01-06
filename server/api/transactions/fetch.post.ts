import { filter, find, isEmpty, map, sortBy } from "lodash-es";
import accountsData from "~~/data/account.json";
import transactionData from "~~/data/transaction.json";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/api";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
    const { account_id } = await readBody(event);

    // If there's no account id in the request
    if (!account_id) {
        throw createError({
            statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
            message: "Account ID required",
            data: {
                errors: { account_id: "required" },
            },
        },
        );
    }

    const allAccounts = accountsData.accounts;
    const account = find(allAccounts, (account) => account.id === account_id);

    // Account with the given account ID is not found
    if (isEmpty(account)) {
        throw createError({
            statusCode: SERVER_STATUS_CODES.NOT_FOUND,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.NOT_FOUND],
            message: "Account not found",
            data: {
                errors: { account_id: "not found" },
            },
        });
    }

    const transactionsByAccount = filter(transactionData.transactions, (transaction) => transaction.account_id === account_id);
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
