import useUserStore from "~/stores/UserStore";

export function useCurrencyFormatter(amount: number): string {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";

    const userStore = useUserStore();
    const { currency } = storeToRefs(userStore);

    let value: number;
    let suffix: string;

    if (absAmount >= 1e12) {
    // Trillions
        value = absAmount / 1e12;
        suffix = "T";
    } else if (absAmount >= 1e9) {
    // Billions
        value = absAmount / 1e9;
        suffix = "B";
    } else if (absAmount >= 1e6) {
    // Millions
        value = absAmount / 1e6;
        suffix = "M";
    } else if (absAmount >= 1e5) {
    // Lakhs (Indian numbering system)
        value = absAmount / 1e5;
        suffix = "L";
    } else if (absAmount >= 1e3) {
    // Thousands
        value = absAmount / 1e3;
        suffix = "K";
    } else {
    // Less than 1000
        return `${sign}${currency.value?.symbol ?? "£"}${absAmount.toFixed(2)}`;
    }

    // Format with up to 2 decimal places, removing trailing zeros
    const formatted = Number.parseFloat(value.toFixed(2));

    return `${sign}${currency.value?.symbol ?? "£"}${formatted}${suffix}`;
}
