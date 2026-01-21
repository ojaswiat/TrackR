import type { TUser } from "~~/shared/types/entity.types";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { addTransactionForUser } from "~~/server/handlers/transaction.handler";
import { isDev } from "~~/server/utils/api.utils";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";
import { ZAddTransactionSchema } from "~~/shared/schemas/zod.schema";

export default defineEventHandler(async (event) => {
    const dev = isDev();

    try {
        const user = event.context.user as TUser;
        const body = await readBody(event);
        const result = ZAddTransactionSchema.safeParse(body);

        if (!result.success) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
                message: "Invalid input",
                data: result.error.issues,
            });
        }

        const newTransaction = await addTransactionForUser(user.id, result.data);

        return {
            statusCode: SERVER_STATUS_CODES.CREATED,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.CREATED],
            message: "Transaction created successfully!",
            data: {
                transaction: newTransaction,
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
