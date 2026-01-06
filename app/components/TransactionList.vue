<template>
    <TransactionCard
        v-for="transaction in props.transactions"
        :key="`transaction-list-${transaction.id}`"
        :transaction="transaction"
    />
</template>

<script setup lang="ts">
const props = defineProps({
    transactions: {
        type: Object as PropType<TTransactionUI[]>,
        required: true,
    },
});
</script>
