<template>
    <div class="flex flex-col">
        <div>
            <h5 class="text-2xl font-semibold">
                {{ props.account?.name ?? 'Select an account' }}
            </h5>
            <p class="text-muted">
                {{ props.account?.description ?? 'Select an account to view its details and manage it' }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    account: {
        type: Object as PropType<TAccount>,
        required: false,
    },
});
</script>
