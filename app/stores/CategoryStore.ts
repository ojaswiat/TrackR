import { acceptHMRUpdate, defineStore } from "pinia";
import { CATEGORIES_FETCH } from "~~/shared/constants/api.const";
import { CATEGORY_TYPE } from "~~/shared/constants/enums";

const useCategoryStore = defineStore("CategoryStore", () => {
    const toast = useToast();

    const allCategories = ref<TCategory[]>([]);
    const loading = ref<boolean>(false);

    const expenseCategories = computed(() => {
        return allCategories.value.filter((category) => category.type !== CATEGORY_TYPE.INCOME);
    });

    const incomeCategory = computed(() => {
        return allCategories.value.find((category) => category.type === CATEGORY_TYPE.INCOME);
    });

    async function fetchCategories() {
        try {
            loading.value = true;
            const response = await $fetch<TAPIResponseSuccess<{ categories: TCategory[] }>>(CATEGORIES_FETCH);

            allCategories.value = response.data.categories;
        } catch (e) {
            const error = e as TAPIResponseError;
            const message = error.message || "Failed to fetch categories. Please try again.";

            toast.add({
                title: "Error",
                description: message,
                color: "error",
            });
            console.error(error);
        } finally {
            loading.value = false;
        }
    }

    return {
        allCategories,
        expenseCategories,
        incomeCategory,
        loading,
        fetchCategories,
    };
});

export default useCategoryStore;

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCategoryStore, import.meta.hot));
}
