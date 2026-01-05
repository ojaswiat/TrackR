<template>
    <UCard class="border border-primary rounded-3xl text-center">
        <template #header>
            <h5 class="text-xl font-bold text-primary w-xl">
                {{ props.account.name }}
            </h5>
            <p v-if="props.account.description">
                {{ props.account.description }}
            </p>
        </template>
        <CategoryExpensesChart :categories="categories" />
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
    account: {
        type: Object as PropType<TAccount>,
        required: true,
    },
});

const accountId = computed(() => props.account.id);

const { data: response, refresh: _refetch } = await useAsyncData(
    () => `cat-exp-${accountId.value}`, // Dynamic key for caching
    () => $fetch(CATEGORIES_EXPENSE_FETCH, {
        method: "POST",
        body: { account_id: accountId.value },
    }),
    { watch: [accountId] },
);

const categories = computed<TCategory[]>(() => {
    return response.value?.data.categories ?? [];
});
</script>
