<template>
    <UCard class="border border-primary rounded-3xl text-center">
        <template #header>
            <h5 class="text-xl font-bold text-primary w-xl">
                {{ selectedAccount?.name }}
            </h5>
            <p v-if="selectedAccount?.description">
                {{ selectedAccount.description }}
            </p>
        </template>
        <CategoryExpensesChart :categories="categories" />
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
    selectedAccount: {
        type: Object as PropType<TAccount>,
        required: true,
    },
});

const { data: response, refresh: _refetch } = await useAsyncData(
    () => `cat-exp-${props.selectedAccount.id}`, // Dynamic key for caching
    () => $fetch(CATEGORIES_EXPENSE_FETCH, {
        method: "POST",
        body: { account_id: props.selectedAccount.id },
    }),
    { watch: [props.selectedAccount] },
);

const categories = computed<TCategory[]>(() => {
    return response.value?.data.categories ?? [];
});
</script>
