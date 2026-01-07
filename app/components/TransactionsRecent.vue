<template>
    <UCard
        :ui="{
            body: 'p-0 sm:p-0',
        }">
        <template #header>
            <h5 class="text-xl text-primary font-bold">
                Recent Transactions
            </h5>
            <p class="text-muted text-sm">
                Showing transactions for {{ props.selectedAccount.name }}
            </p>
        </template>
        <div class="flex flex-col gap-4 items-center w-fit p-4">
            <UTable
                :columns="columns"
                :column-visibility="columnVisibility"
                :data="transactions"
            />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { TTransactionType } from "~~/shared/constants/enums";
import { map, reduce } from "lodash-es";
import { TRANSACTION_TYPE } from "~~/shared/constants/enums";

const props = defineProps({
    selectedAccount: {
        type: Object as PropType<TAccount>,
        required: true,
    },
});

const { data: categoriesRepsonse } = await useFetch(CATEGORIES_FETCH);

// const { data: categoriesRepsonse } = await useAsyncData(
//     () => "`categories-all",
//     () => $fetch(CATEGORIES_FETCH, {
//         method: "GET",
//     }),
// );

const { data: transactionsResponse, refresh: _refetch } = await useAsyncData(
    () => `transactions-${props.selectedAccount.id}`, // Dynamic key for caching
    () => $fetch(TRANSACTIONS_FETCH, {
        method: "POST",
        body: { account_id: props.selectedAccount.id },
    }),
    { watch: [props.selectedAccount] },
);

const categoriesMap = computed(() => {
    const categories = categoriesRepsonse.value?.data.categories ?? [];

    const catMap = reduce(categories, (accumulator, category) => {
        accumulator[category.id] = category as TCategory;
        return accumulator;
    }, {} as Record<string, TCategory>);

    return catMap;
});

const transactions = computed(() => {
    const transactionsWithoutCategory = transactionsResponse.value?.data.transactions;
    const transactionWithCategory = map(transactionsWithoutCategory, (transaction) => {
        const transactionCategory = categoriesMap.value[transaction.category_id];

        return {
            ...transaction,
            category_name: transactionCategory?.name,
            category_color: transactionCategory?.color,
        };
    });

    return transactionWithCategory as TTransactionUI[];
});

const columns: TableColumn<TTransactionUI>[] = [
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
        accessorKey: "category_name",
        header: "Category",
        cell: ({ row }) => {
            const COLOR_MAP = {
                [TRANSACTION_TYPE.EXPENSE]: "text-red-500",
                [TRANSACTION_TYPE.INCOME]: "text-primary",
            };

            const transactionType: TTransactionType = row.getValue("type");
            const categoryColor: string = row.getValue("category_color");
            const categoryName: string = row.getValue("category_name");

            const categoryBlipElement = h(
                "div",
                {
                    class: "h-2 w-2 rounded-sm",
                    style: { backgroundColor: categoryColor },
                },
            );
            const categoryTextElement = h(
                "span",
                { class: `font-semibold ${COLOR_MAP[transactionType]}` },
                categoryName,
            );
            const cellElement = h(
                "div",
                {
                    class: "flex items-center gap-2",
                },
                [
                    categoryBlipElement,
                    categoryTextElement,
                ],
            );

            return cellElement;
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        meta: {
            class: {
                th: "text-right",
                td: "text-right font-medium",
            },
        },
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue("amount"));
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GBP",
            }).format(amount);
        },
    },

    // Hidden, just there to make the category cell work with the accessor keys
    {
        accessorKey: "type",
    },
    {
        accessorKey: "category_color",
    },
];

const columnVisibility = {
    type: false,
    category_color: false,
};
</script>
