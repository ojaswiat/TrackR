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
            :loading="loading"
            @refresh="() => refreshTransactions()"
        />

        <TransactionsTable
            class="px-4"
            :selected-account-name="selectedAccountName"
            :selected-date-range="selectedDateRange"
            :transactions="transactions"
        />
    </div>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import type { TTransactionType } from "~~/shared/constants/enums";
import { getLocalTimeZone, today } from "@internationalized/date";
import { filter, find, map, reduce } from "lodash-es";
import { ACCOUNTS_FETCH, CATEGORIES_FETCH, TRANSACTIONS_FETCH } from "~~/shared/constants/api.const";
import { DEFAULT_ALL_ACCOUNT_ID } from "~~/shared/constants/data.const";
import { TRANSACTION_TYPE } from "~~/shared/constants/enums";

definePageMeta({
    title: "Transactions",
    description: "Manage your transactions here",
    layout: "app",
});

useHead({
    title: "Transactions",
});

const selectedAccount = ref<string>(DEFAULT_ALL_ACCOUNT_ID);
const selectedCategory = ref<string>();

const { data: accountsResponse } = await useFetch(ACCOUNTS_FETCH);
const { data: categoryResponse } = await useFetch(CATEGORIES_FETCH);
const { data: transactionsResponse, pending: loading, refresh: refreshTransactions } = await useAsyncData(
    () => `transactions-${selectedAccount.value}`, // Dynamic key for caching
    () => $fetch(TRANSACTIONS_FETCH, {
        method: "GET",
        query: {
            account_id: selectedAccount.value === DEFAULT_ALL_ACCOUNT_ID ? undefined : selectedAccount,
        },
    }),
    { watch: [() => selectedAccount] },
);

const categories = computed(() => {
    const categoriesWithoutIncome = filter(
        categoryResponse.value?.data?.categories,
        (category) => category.id !== "cat_001",
    );
    return categoriesWithoutIncome as TCategory[];
});

const accounts = computed(() => {
    return accountsResponse.value?.data?.accounts || [];
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
    return find(accounts.value, (account) => account.id === (selectedAccount.value ?? DEFAULT_ALL_ACCOUNT_ID))?.name ?? "";
});

const transactions = computed(() => {
    const transactionsWithoutCategory = transactionsResponse.value?.data.transactions;
    const transactionWithCategory = map(transactionsWithoutCategory, (transaction) => {
        const transactionCategory = categoriesMap.value[transaction.category_id];
        const transactionAccount = accountsMap.value[transaction.account_id];

        return {
            ...transaction,
            category_name: transactionCategory?.name,
            category_color: transactionCategory?.color,
            account_name: transactionAccount?.name,
            account_color: transactionAccount?.color,
        };
    });

    return transactionWithCategory as TTransactionUI[];
});

const selectedType = ref<TTransactionType>(TRANSACTION_TYPE.EXPENSE);

const selectedDateRange = ref<{ start: DateValue; end: DateValue }>({
    start: today(getLocalTimeZone()).subtract({ months: 1 }),
    end: today(getLocalTimeZone()),
});

onMounted(async () => {
    await refreshTransactions();
});
</script>
