<template>
    <UPopover>
        <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-calendar"
            :disabled="props.loading">
            <template v-if="selectedDateRange.start">
                <template v-if="selectedDateRange.end">
                    {{ df.format(selectedDateRange.start.toDate(getLocalTimeZone())) }} - {{ df.format(selectedDateRange.end.toDate(getLocalTimeZone())) }}
                </template>

                <template v-else>
                    {{ df.format(selectedDateRange.start.toDate(getLocalTimeZone())) }}
                </template>
            </template>
            <template v-else>
                Pick a date
            </template>
        </UButton>

        <template #content>
            <UCalendar
                v-model="selectedDateRange"
                class="p-2"
                :number-of-months="2"
                :min-value="minDate"
                :max-value="maxDate"
                range
            />
        </template>
    </UPopover>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import { APP_CONFIG } from "~~/shared/constants/config.const";

const props = defineProps({
    loading: {
        type: Boolean,
        required: true,
    },
});

const df = new DateFormatter("en-GB", {
    dateStyle: "medium",
});

const selectedDateRange = defineModel("selectedDateRange", {
    default: {
        start: today(getLocalTimeZone()).subtract({ months: APP_CONFIG.DATE_RANGE_DEFAULT_MONTHS }),
        end: today(getLocalTimeZone()),
    },
});
const minDate = today(getLocalTimeZone()).subtract({ years: 1 });
const maxDate = today(getLocalTimeZone());
</script>
