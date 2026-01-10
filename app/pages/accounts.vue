<template>
    <div class="flex flex-col gap-8">
        <div class="flex justify-end px-4">
            <UButton
                class="w-fit"
                icon="i-lucide:plus"
                @click="onAddAccount">
                Add Account
            </UButton>
        </div>
        <AccountsAccounts
            v-model:selected-account="selectedAccount"
            class="px-4"
            :accounts="accounts"
            @on-add-account="onAddAccount"
        />
        <AccountDetails
            class="px-4"
            :account="selectedAccountItem"
        />
    </div>
</template>

<script setup lang="ts">
import { find } from "lodash-es";

definePageMeta({
    title: "Accounts",
    description: "Manage your income sources",
    layout: "new",
});

useHead({
    title: "Accounts",
});

const { data: accountsResponse } = await useFetch(ACCOUNTS_FETCH);

const accounts = computed(() => {
    return accountsResponse.value?.data?.accounts?.slice(1) || [];
});

const selectedAccount = ref<string>("");

const selectedAccountItem = computed(() => {
    return find(accounts.value, (account) => account.id === selectedAccount.value);
});

function onAddAccount() {
    console.info("Add account clicked");
}
</script>
