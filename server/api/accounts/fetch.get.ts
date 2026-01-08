import type { TAccount } from "~~/shared/types/entity.types";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/api";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";
import accountsData from "../../../data/account.json";

export default defineEventHandler((event) => {
    const query = getQuery(event);
    const accountId = query.account_id as string | undefined;

    const allAccounts = accountsData.accounts as TAccount[];

    // If account_id is provided, return only that account
    if (accountId) {
        const account = allAccounts.find((acc) => acc.id === accountId);
        return {
            statusCode: SERVER_STATUS_CODES.OK,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
            message: "Account fetched successfully",
            data: {
                accounts: account ? [account] : [],
            },
        };
    }

    // If no account_id is provided, create a pseudo "all accounts" object
    const allAccountsSummary = allAccounts.reduce(
        (acc, current) => ({
            id: "acc_000",
            name: "All Accounts",
            description: "Combined view of all accounts",
            total_income: acc.total_income + current.total_income,
            total_expense: acc.total_expense + current.total_expense,
        }),
        {
            id: "acc_000",
            name: "All Accounts",
            description: "Combined view of all accounts",
            total_income: 0,
            total_expense: 0,
        } as TAccount,
    );

    // Return the pseudo "all accounts" object followed by individual accounts
    return {
        statusCode: SERVER_STATUS_CODES.OK,
        statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
        message: "Accounts fetched successfully",
        data: {
            accounts: [allAccountsSummary, ...allAccounts],
        },
    };
});
