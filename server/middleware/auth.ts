import { serverSupabaseUser } from "#supabase/server";
import { SERVER_STATUS_CODES } from "~~/shared/constants/enums";
import { PROTECTED_ROUTES, STATUS_CODE_MESSAGE_MAP } from "../constants/server.const";

export default defineEventHandler(async (event) => {
    // Only run auth check on protected routes
    const url = event.node.req.url;

    // Skip auth check for public routes
    const isProtected = PROTECTED_ROUTES.some((route) => url?.includes(route));

    if (isProtected) {
        try {
            const user = await serverSupabaseUser(event);

            if (!user) {
                throw createError({
                    statusCode: SERVER_STATUS_CODES.UNAUTHORIZED,
                    statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.UNAUTHORIZED],
                });
            }

            // Store user in event context for use in route handlers
            event.context.user = user;
        } catch (error) {
            console.error(error);
            throw createError({
                statusCode: SERVER_STATUS_CODES.UNAUTHORIZED,
                statusMessage: STATUS_CODE_MESSAGE_MAP[SERVER_STATUS_CODES.UNAUTHORIZED],
            });
        }
    }
});
