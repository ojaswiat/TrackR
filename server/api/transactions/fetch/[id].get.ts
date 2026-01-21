import type { TUser } from "~~/shared/types/entity.types";
import { z } from "zod";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import {
    checkTransactionBelongsToUser,
    checkTransactionExists,
    getTransactionDetails,
} from "~~/server/handlers/transaction.handler";
import { isDev } from "~~/server/utils/api.utils";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
    const dev = isDev();

    try {
        const user = event.context.user as TUser;
        const transactionId = getRouterParam(event, "id");
        const { id: userId } = user;

        // Validate ID
        const idSchema = z.uuidv4("Invalid transaction ID");
        const idResult = idSchema.safeParse(transactionId);

        if (!idResult.success) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
                message: "Invalid transaction ID",
            });
        }

        const exists = await checkTransactionExists(transactionId!);

        if (!exists) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.NOT_FOUND,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.NOT_FOUND],
                message: "Transaction not found",
            });
        }

        const transactionBelongsToUser = await checkTransactionBelongsToUser(transactionId!, userId);

        if (!transactionBelongsToUser) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.FORBIDDEN,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.FORBIDDEN],
                message: "You are not allowed to view this transaction",
            });
        }

        const transaction = await getTransactionDetails(transactionId!);
        return {
            statusCode: SERVER_STATUS_CODES.OK,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
            message: "Transaction details fetched successfully!",
            data: {
                transaction,
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
