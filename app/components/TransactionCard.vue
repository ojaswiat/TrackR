<template>
    <UCard class="w-xs">
        <template #header>
            <div
                class="flex items-center gap-2 font-semibold"
                :class="{
                    'text-red-500': transaction.type === TRANSACTION_TYPE.EXPENSE,
                    'text-primary': transaction.type === TRANSACTION_TYPE.INCOME,
                }">
                <p>
                    {{ props.transaction.amount }}
                </p>
                <Icon
                    :name="transaction.type === TRANSACTION_TYPE.EXPENSE
                        ? 'i-lucide:square-arrow-up-right'
                        : 'i-lucide:square-arrow-down-right'"
                    class="h-4 w-4"
                />
            </div>
        </template>
        <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
                <div
                    class="h-4 w-4 rounded-sm"
                    :style="{ backgroundColor: `${transaction.category_color}` }">
                </div>
                <p>{{ transaction.category_name }}</p>
            </div>

            <p
                v-if="transaction.description"
                class="text-sm">
                {{ transaction.description }}
            </p>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { TRANSACTION_TYPE } from "~~/shared/constants/enums";

const props = defineProps({
    transaction: {
        type: Object as PropType<TTransactionUI>,
        required: true,
    },
});
</script>
