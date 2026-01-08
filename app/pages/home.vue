<template>
    <div class="flex flex-wrap items-start gap-8 w-fit mx-auto flex-none h-full px-4">
        <div class="flex flex-col gap-4 h-full">
            <div
                v-if="pendingAccounts"
                class="flex-none h-[38%]">
                <UCard>
                    <template #header>
                        <USkeleton class="h-6 w-48" />
                        <USkeleton class="h-4 w-64 mt-2" />
                    </template>
                    <div class="flex flex-col gap-4 p-4">
                        <USkeleton class="h-32 w-full" />
                        <USkeleton class="h-32 w-full" />
                    </div>
                </UCard>
            </div>
            <AccountList
                v-else
                class="flex-none h-[38%]"
                :accounts="accounts"
                @select-account="onAccountSelect"
            />
            <TransactionAddForm
                :accounts="accounts"
                :categories="categories"
                :pending-accounts="pendingAccounts"
                :pending-categories="pendingCategories"
            />
        </div>

        <div class="flex flex-col gap-4 justify-between">
            <div v-if="pendingAccounts || !selectedAccountRef">
                <UCard>
                    <template #header>
                        <USkeleton class="h-6 w-48" />
                        <USkeleton class="h-4 w-64 mt-2" />
                    </template>
                    <USkeleton class="h-[240px] w-full" />
                </UCard>
            </div>
            <CategoryExpenses
                v-else
                :selected-account="selectedAccountRef"
            />
            <div v-if="pendingAccounts">
                <UCard>
                    <template #header>
                        <USkeleton class="h-6 w-48" />
                        <USkeleton class="h-4 w-64 mt-2" />
                    </template>
                    <USkeleton class="h-[300px] w-full" />
                </UCard>
            </div>
            <AccountSummary
                v-else
                :accounts="accounts"
            />
        </div>

        <div
            v-if="pendingAccounts || !selectedAccountRef"
            class="flex-none">
            <UCard class="h-[90%]">
                <template #header>
                    <USkeleton class="h-6 w-48" />
                    <USkeleton class="h-4 w-64 mt-2" />
                </template>
                <div class="flex flex-col gap-4 p-4">
                    <USkeleton class="h-12 w-full" />
                    <USkeleton class="h-12 w-full" />
                    <USkeleton class="h-12 w-full" />
                </div>
            </UCard>
        </div>
        <TransactionsRecent
            v-else
            class="flex-none"
            :selected-account="selectedAccountRef"
            :categories="categories"
        />
    </div>
</template>

<script setup lang="ts">
import { find } from "lodash-es";

const { data: accountsResponse, pending: pendingAccounts } = await useFetch(ACCOUNTS_FETCH);

const accounts = computed<TAccountList>(() => {
    return (accountsResponse.value?.data.accounts ?? []) as TAccountList;
});

const { data: categoriesResponse, pending: pendingCategories } = await useFetch(CATEGORIES_FETCH);

const categories = computed<TCategoryList>(() => {
    return (categoriesResponse.value?.data.categories ?? []) as TCategoryList;
});

const selectedAccountRef = ref<TAccount | null>(null);

watch([accounts, pendingAccounts], () => {
    if (!pendingAccounts.value && accounts.value.length > 0 && !selectedAccountRef.value) {
        selectedAccountRef.value = accounts.value[0] ?? null;
    }
}, { immediate: true });

function onAccountSelect(accountId: string) {
    const account = find(accounts.value, (account) => account.id === accountId);
    if (account) {
        selectedAccountRef.value = account;
    }
}
</script>
