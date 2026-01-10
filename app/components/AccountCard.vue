<template>
    <UCard
        class="w-60 flex-shrink-0 flex flex-col card-hover"
        :style="{
            borderColor: props.account.color,
            background: `linear-gradient(to right, ${props.account.color}00, ${props.account.color}11)`,
            backgroundColor: props.account.id === selectedAccount ? props.account.color : 'transparent',
            color: props.account.id === selectedAccount ? 'white' : 'inherit',
        }"
        as="button"
        @click="handleAccountSelect(props.account.id)">
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
                <UIcon
                    name="i-lucide:wallet"
                    class="size-6"
                    :style="{ color: props.account.id === selectedAccount ? 'white' : props.account.color }"
                />

                <UIcon
                    v-if="props.account.id === selectedAccount"
                    name="i-lucide:circle-check"
                    class="size-6"
                    :style="{ color: props.account.id === selectedAccount ? 'white' : props.account.color }"
                />
                <UIcon
                    v-else
                    name="i-lucide:circle"
                    class="size-6"
                    :style="{ color: props.account.id === selectedAccount ? 'white' : props.account.color }"
                />
            </div>

            <div class="text-sm text-inherit text-left">
                {{ props.account.name }}
            </div>

            <div class="text-lg font-bold text-left">
                {{ currency }} {{ (props.account.total_income ?? 0) - (props.account.total_expense ?? 0) }}
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
    account: {
        type: Object as PropType<TAccount>,
        required: true,
    },
});

const selectedAccount = defineModel<string>("selectedAccount");

// TODO: Get this from the user store
const currency = computed(() => {
    // return useUserStore().user?.currency || "£";
    return "£";
});

function handleAccountSelect(accountId: string) {
    selectedAccount.value = accountId;
}
</script>

<style scoped>
.card-hover {
    transform-origin: bottom center;
    transform: scale(1);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid;
}
.card-hover:hover {
    transform: scale(1.03);
}
</style>
