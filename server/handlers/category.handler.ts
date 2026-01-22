import type { TCategoryType } from "~~/shared/constants/enums";
import type { TCategory } from "~~/shared/types/entity.types";
import { filter, map } from "lodash-es";
import { db } from "~~/server/utils/db";
import { DEFAULT_ALL_CATEGORY_ID } from "~~/shared/constants/data.const";
import { CATEGORY_TYPE } from "~~/shared/constants/enums";
import { categories } from "~~/shared/db/schema";

export async function getAllCategories(): Promise<TCategory[]> {
    const result = await db.select().from(categories);

    const allCategories = map(result, (cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || "",
        color: cat.color,
        type: cat.type as TCategoryType,
        total_amount: 0,
    }));

    const defaultAllCategory = {
        id: DEFAULT_ALL_CATEGORY_ID,
        name: "All Categories",
        description: "All categories",
        color: "#90a1b9",
        type: CATEGORY_TYPE.EXPENSE,
        total_amount: 0,
    };

    const noIncomeCategory = filter(allCategories, (cat) => cat.type !== CATEGORY_TYPE.INCOME);

    return [
        defaultAllCategory,
        ...noIncomeCategory,
    ];
}
