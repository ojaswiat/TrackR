import type { TUser } from "~~/shared/types/entity.types";
import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { addAccountForUser, checkCanUserAddAccount } from "~~/server/handlers/account.handler";
import { isDev } from "~~/server/utils/api.utils";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";
import { ZAddAccountSchema } from "~~/shared/schemas/zod.schema";

export default defineEventHandler(async (event) => {
    const dev = isDev();

    try {
        const user = event.context.user as TUser;
        const body = await readBody(event);
        const result = ZAddAccountSchema.safeParse(body);

        if (!result.success) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
                message: "Invalid input",
                data: result.error.issues,
            });
        }

        const canAdd = await checkCanUserAddAccount(user.id);

        if (!canAdd) {
            throw createError({
                statusCode: SERVER_STATUS_CODES.BAD_REQUEST,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.BAD_REQUEST],
                message: "User can only have 5 accounts!",
            });
        }

        const newAccount = await addAccountForUser(user.id, result.data);

        return {
            statusCode: SERVER_STATUS_CODES.CREATED,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.CREATED],
            message: "Account created successfully!",
            data: {
                account: newAccount,
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
