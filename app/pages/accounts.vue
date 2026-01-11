<template>
    <div class="flex flex-col gap-8">
        <div class="flex justify-end px-4">
            <UButton
                class="w-fit"
                icon="i-lucide:plus"
                @click="showAddAccountModal = true">
                Add Account
            </UButton>
        </div>

        <AccountsAccounts
            v-model:selected-account="selectedAccount"
            class="px-4"
            :accounts="accounts"
            @on-add-account="showAddAccountModal = true"
        />

        <AccountDetails
            v-if="!isEmpty(accounts)"
            class="px-4 mt-8"
            :account="selectedAccountItem"
            :summary="summary"
            @on-edit-account="showAddAccountModal = true"
            @on-delete-account="showDeleteAccountModal = true"
        />

        <UModal
            v-model:open="showAddAccountModal"
            :modal="true"
            :dismissible="false"
            title="New Account"
            :close="{
                color: 'neutral',
                class: 'rounded-full',
            }">
            <template #body>
                <AccountAddForm
                    v-model:open="showAddAccountModal"
                    :account="selectedAccountItem"
                />
            </template>
        </UModal>

        <UModal
            v-model:open="showDeleteAccountModal"
            :modal="true"
            :dismissible="false"
            title="Delete Account"
            :close="{
                color: 'neutral',
                class: 'rounded-full',
            }">
            <template #body>
                <p>This will permanently delete the account {{ selectedAccountItem?.name }}. Are you sure you want to proceed?</p>
            </template>

            <template #footer>
                <div class="w-full flex justify-end gap-4">
                    <UButton
                        class="w-fit"
                        variant="ghost"
                        color="neutral"
                        @click="showDeleteAccountModal = false">
                        Cancel
                    </UButton>
                    <UButton
                        class="w-fit"
                        color="error"
                        @click="deleteAccount">
                        Delete
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { find, isEmpty } from "lodash-es";

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

const showAddAccountModal = ref<boolean>(false);
const showDeleteAccountModal = ref<boolean>(false);

const selectedAccountItem = computed(() => {
    return find(accounts.value, (account) => account.id === selectedAccount.value);
});
// TODO: remove mock data
const summary = computed(() => ({
    total_income: selectedAccountItem.value?.total_income || 0,
    total_expense: selectedAccountItem.value?.total_expense || 0,
}));

function deleteAccount() {
    console.info(`Deleting account ${selectedAccountItem.value?.name}`);
}
</script>
