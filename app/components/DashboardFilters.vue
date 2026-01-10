<template>
    <div class="flex flex-wrap items-end justify-between gap-4 w-full">
        <p class="text-sm font-semibold text-muted">
            Data between {{ df.format(selectedDateRange.start?.toDate(getLocalTimeZone())) }} - {{ df.format(selectedDateRange.end?.toDate(getLocalTimeZone())) }}
        </p>

        <div class="flex flex-wrap gap-4 items-center">
            <USelect
                v-model="selectedAccount"
                class="w-60"
                :items="accountSelectOptions"
                placeholder="Select an account"
            />

            <UIDateFilter v-model:selected-date-range="selectedDateRange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";

const props = defineProps({
    accounts: {
        type: Object as PropType<TAccount[]>,
        required: true,
    },
});

const selectedAccount = defineModel<string>("selectedAccount");
const selectedDateRange = defineModel<{ start: DateValue; end: DateValue }>("selectedDateRange", {
    default: {
        start: today(getLocalTimeZone()).subtract({ months: 1 }),
        end: today(getLocalTimeZone()),
    },
});

const accountSelectOptions = computed(() => props.accounts.map((account) => ({
    label: account.name,
    value: account.id,
})));

const df = new DateFormatter("en-GB", {
    dateStyle: "medium",
});
</script>
