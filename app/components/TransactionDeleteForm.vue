<template>
    <UForm
        @submit="onSubmit">
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
                <UIcon
                    name="i-lucide:alert-triangle"
                    class="w-8 h-8 text-error"
                />
                <p>This will permanently delete the transaction <span class="text-error">{{ props.transaction?.amount }}</span></p>
            </div>

            <div class="w-full flex justify-end gap-4 mt-4">
                <UButton
                    type="button"
                    :disabled="deleting"
                    class="w-fit"
                    variant="ghost"
                    color="neutral"
                    @click="open = false">
                    Cancel
                </UButton>
                <UButton
                    type="submit"
                    :loading="deleting"
                    class="w-fit"
                    color="error">
                    Delete
                </UButton>
            </div>
        </div>
    </UForm>
</template>

<script setup lang="ts">
const props = defineProps({
    transaction: {
        type: Object as PropType<TTransaction>,
        required: false,
    },
});

const toast = useToast();

const open = defineModel<boolean>("open");

const deleting = ref(false);

async function onSubmit() {
    try {
        deleting.value = true;
        await sleep();

        toast.add({ title: "Success", description: "Transaction deleted successfully!", color: "success" });
        console.info(props.transaction?.id);
        open.value = false;
    } catch (error) {
        toast.add({ title: "Error", description: "Something went wrong! Please try again later.", color: "error" });
        console.error(error);
    } finally {
        deleting.value = false;
    }
}
</script>
