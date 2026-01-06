<template>
    <UCard>
        <template #header>
            <div>
                <h5 class="text-xl text-primary font-bold">
                    All Accounts
                </h5>
                <p>Click on an account to view its details</p>
            </div>
        </template>
        <div class="flex flex-col gap-4 items-center w-fit">
            <AccountCard
                v-for="account in props.accounts"
                :key="`account-card-${account.id}`"
                :account="account"
                @select-account="onAccountSelect"
            />
        </div>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
    accounts: {
        type: Object as PropType<TAccountList>,
        required: true,
    },
});

const emits = defineEmits(["selectAccount"]);

function onAccountSelect(accountId: string) {
    emits("selectAccount", accountId);
}
</script>
