// Fetch all expenses categories only

import { STATUS_CODE_MESSAGE_MAP } from "~~/server/constants/server.const";
import { getAllCategories } from "~~/server/handlers/category.handler";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";

export default defineEventHandler(async () => {
    const dev = isDev();
    try {
        const categories = await getAllCategories();

        return {
            statusCode: SERVER_STATUS_CODES.OK,
            statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.OK],
            message: "Categories fetched successfully",
            data: {
                categories,
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
