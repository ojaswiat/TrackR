I've verified the "Add Account" flow and solidified the implementation to be robust and type-safe.

### Verification & Improvements

1.  **Type Safety Verification**: I identified a potential issue where the form input for `initial_balance` might be sent as a string, causing the strict Zod validation (`z.number()`) to fail.
2.  **Robust Fixes**:
    - **Schema**: Updated `ZAddAccountSchema` in `shared/schemas/zod.schema.ts` to use `z.coerce.number()`. This ensures that even if the API receives a string representation of a number, it will be correctly parsed.
    - **Frontend**: Updated `AccountAddForm.vue` to use `v-model.number` on the balance input. This ensures the client-side state remains a number, matching the TypeScript types.

### API Development Pattern

Based on the changes, here is the foundational pattern for creating new APIs in this project:

1.  **Shared Schema (`shared/schemas/`)**:
    - Define the request body validation schema using Zod.
    - Use `z.coerce` for primitive types (numbers, booleans) to handle serialization variations.

2.  **Server Handlers (`server/handlers/`)**:
    - **Granular Logic**: Create small, focused functions (e.g., `canUserAddAccount` vs `addAccountForUser`).
    - **No HTTP Errors**: Handlers should perform database operations and return data or booleans. Avoid throwing HTTP errors (like `createError`) inside handlers; let the API route decide the response code.
    - **Strict Typing**: Define explicit return types (e.g., `Promise<TAccount>`, `Promise<boolean>`) to ensure contract safety.

3.  **API Route (`server/api/`)**:
    - **Validation**: First, validate the input using `Schema.safeParse(body)`. Throw `400 Bad Request` if it fails.
    - **Logic Checks**: Call "Check" handlers (e.g., permission, limits) and throw appropriate errors (`403`, `400`) if conditions aren't met.
    - **Execution**: Call "Action" handlers to perform the mutation.
    - **Standard Response**: Return a structured object: `{ statusCode, statusMessage, message, data }`.
    - **Error Handling**: Wrap everything in a `try/catch`. Rethrow `H3Error` instances, and catch unknown errors as `500 Internal Server Error`.

4.  **Client Integration (`app/components/`)**:
    - Use `UForm` with the shared Zod schema.
    - Bind inputs correctly (e.g., `v-model.number`).
    - Call the API using `$fetch`.
    - Handle errors gracefully by displaying the error message returned from the API.

**Code References:**

- [shared/schemas/zod.schema.ts](file:///Users/ojaswi/projects/trackr/shared/schemas/zod.schema.ts) (Updated Schema)
- [app/components/AccountAddForm.vue](file:///Users/ojaswi/projects/trackr/app/components/AccountAddForm.vue) (Updated Component)
- [server/handlers/account.handler.ts](file:///Users/ojaswi/projects/trackr/server/handlers/account.handler.ts) (Handlers)
- [server/api/accounts/add.post.ts](file:///Users/ojaswi/projects/trackr/server/api/accounts/add.post.ts) (API Route)
