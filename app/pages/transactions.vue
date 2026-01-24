<template>
    <div class="w-full flex flex-col gap-8">
        <TransactionFilters
            v-model:selected-account="selectedAccount"
            v-model:selected-date-range="selectedDateRange"
            v-model:selected-type="selectedType"
            v-model:selected-category="selectedCategory"
            class="px-4"
            :accounts="accounts"
            :categories="categories"
            :loading="status === 'pending'"
            @refresh="() => refreshTransactions()"
        />

        <TransactionsTable
            class="px-4"
            :selected-account-name="selectedAccountName"
            :selected-date-range="selectedDateRange"
            :transactions="transactions"
            :loading="status === 'pending'"
            :has-more-data="hasMoreData"
            @load-more="loadMoreTransactions"
        />
    </div>
</template>

<script setup lang="ts">
import type { TTransactionType } from "~~/shared/constants/enums";
import { getLocalTimeZone, today } from "@internationalized/date";
import { find, map, reduce } from "lodash-es";
import { ACCOUNTS_FETCH, CATEGORIES_FETCH, TRANSACTIONS_FETCH } from "~~/shared/constants/api.const";
import { APP_CONFIG } from "~~/shared/constants/config.const";

definePageMeta({
    title: "Transactions",
    description: "Manage your transactions here",
    layout: "app",
});

useHead({
    title: "Transactions",
});

const selectedAccount = ref<string>();
const selectedCategory = ref<string>();
const selectedType = ref<TTransactionType>();

const hasMoreData = ref<boolean>(true);

const selectedDateRange = ref({
    start: today(getLocalTimeZone()).subtract({ months: APP_CONFIG.DATE_RANGE_DEFAULT_MONTHS }),
    end: today(getLocalTimeZone()),
});

const { data: accountsResponse } = await useFetch(ACCOUNTS_FETCH);
const { data: categoryResponse } = await useFetch(CATEGORIES_FETCH);

const cursor = ref<string | null>(null);
const accumulatedTransactions = ref<TTransaction[]>([]);

const { data: transactionsResponse, status, execute: fetchMoreTransactions } = useFetch(
    TRANSACTIONS_FETCH,
    {
        key: "transactions-infinite-scroll",
        query: computed(() => {
            const baseQuery = {
                account_id: selectedAccount.value,
                category_id: selectedCategory.value,
                type: selectedType.value,
                startDate: selectedDateRange.value.start.toString(),
                endDate: selectedDateRange.value.end.toString(),
                limit: APP_CONFIG.TRANSACTIONS_PER_PAGE,
            };

            // Only add cursor if it exists
            if (cursor.value) {
                return { ...baseQuery, cursor: cursor.value };
            }

            return baseQuery;
        }),
        immediate: false, // Don't fetch automatically
        watch: false, // Disable automatic watching
    },
);
const categories = computed(() => {
    return categoryResponse.value?.data?.categories ?? [];
});

const accounts = computed(() => {
    return accountsResponse.value?.data?.accounts ?? [];
});

const categoriesMap = computed<Record<string, TCategory>>(() => {
    return reduce(
        categories.value,
        (accumulator, category) => {
            accumulator[category.id] = category;
            return accumulator;
        },
        {} as Record<string, TCategory>,
    );
});

const accountsMap = computed<Record<string, TAccount>>(() => {
    return reduce(
        accounts.value,
        (accumulator, account) => {
            accumulator[account.id] = account;
            return accumulator;
        },
        {} as Record<string, TAccount>,
    );
});

const selectedAccountName = computed(() => {
    const selectedAccountItem = find(accounts.value, (account) => account.id === selectedAccount.value);

    return selectedAccountItem?.name ?? "";
});

function mapTransactions(rawTransactions: TTransaction[]) {
    return map(rawTransactions, (transaction) => {
        const transactionCategory = categoriesMap.value[transaction.category_id];
        const transactionAccount = accountsMap.value[transaction.account_id];

        return {
            ...transaction,
            category_name: transactionCategory?.name,
            category_color: transactionCategory?.color,
            account_name: transactionAccount?.name,
            account_color: transactionAccount?.color,
        };
    }) as TTransactionUI[];
}

const transactions = computed(() => {
    return mapTransactions(accumulatedTransactions.value);
});

// Function to reset and refresh all transactions
async function refreshTransactions() {
    cursor.value = null;
    accumulatedTransactions.value = [];
    hasMoreData.value = true;
    await fetchMoreTransactions();
}

async function loadMoreTransactions() {
    if (status.value === "pending" || !hasMoreData.value) {
        return; // Don't fetch if already loading or no more data
    }

    await fetchMoreTransactions();
}

onMounted(() => {
    refreshTransactions();
});

// Watch for new data and append to accumulated array
watch(transactionsResponse, (newResponse) => {
    if (newResponse?.data?.transactions) {
        accumulatedTransactions.value = [
            ...accumulatedTransactions.value,
            ...newResponse.data.transactions,
        ];

        // Check if there's more data
        if (newResponse.data.meta?.next_cursor) {
            cursor.value = newResponse.data.meta.next_cursor;
            hasMoreData.value = true;
        } else {
            hasMoreData.value = false; // No more data to load
        }
    }
});

// Watch filters and reset when they change
watch([selectedAccount, selectedCategory, selectedType, selectedDateRange], () => {
    refreshTransactions();
}, { deep: true });
</script>
