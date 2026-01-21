import type { TUser } from "~~/shared/types/entity.types";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { checkAccountBelongsToUser } from "~~/server/handlers/account.handler";
import {
    getAllTransactionsForUser,
} from "~~/server/handlers/transaction.handler";
import { isDev } from "~~/server/utils/api.utils";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
    const dev = isDev();

    try {
        const user = event.context.user as TUser;
        const { id: userId } = user;

        const query = getQuery(event);
        const account_id = query.account_id ? String(query.account_id) : undefined;

        if (account_id) {
            const isAccountOwner = await checkAccountBelongsToUser(account_id, userId);
            if (!isAccountOwner) {
                throw createError({
                    statusCode: SERVER_STATUS_CODES.FORBIDDEN,
                    statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.FORBIDDEN],
                    message: "Account does not belong to user",
                });
            }
        }

        const transactions = await getAllTransactionsForUser(userId, { account_id });
        return {
            statusCode: SERVER_STATUS_CODES.OK,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
            message: "Transactions fetched successfully!",
            data: {
                transactions,
            },
        };
    } catch (error) {
        if (dev) {
            console.error(error);
        }

        throw createError({
            statusCode: SERVER_STATUS_CODES.INTERNAL_SERVER_ERROR,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.INTERNAL_SERVER_ERROR],
            message: "Internal server error!",
        });
    }
});
