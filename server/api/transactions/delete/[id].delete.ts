import type { TUser } from "~~/shared/types/entity.types";
import { z } from "zod";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import {
    canUserUpdateTransaction,
    checkTransactionExists,
    deleteTransactionForUser,
} from "~~/server/handlers/transaction.handler";
import { isDev } from "~~/server/utils/api.utils";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

export default defineEventHandler(async (event) => {
    const dev = isDev();

    try {
        const user = event.context.user as TUser;
        const id = getRouterParam(event, "id");

        // Validate ID
        const idSchema = z.uuid("Invalid transaction ID");
        const idResult = idSchema.safeParse(id);
        if (!idResult.success) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
                message: "Invalid transaction ID",
            });
        }

        // Check existence
        const exists = await checkTransactionExists(id!);
        if (!exists) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.NOT_FOUND,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.NOT_FOUND],
                message: "Transaction not found",
            });
        }

        // Check ownership
        const canDelete = await canUserUpdateTransaction(id!, user.id);
        if (!canDelete) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.FORBIDDEN,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.FORBIDDEN],
                message: "You are not allowed to delete this transaction",
            });
        }

        const deletedTransaction = await deleteTransactionForUser(user.id, id!);

        return {
            statusCode: SERVER_STATUS_CODES.OK,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
            message: "Transaction deleted successfully!",
            data: {
                transaction: deletedTransaction,
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
