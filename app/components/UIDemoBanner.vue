<template>
    <div
        class="bg-warning border-b border-warning px-4 py-2 text-center">
        <p class="text-sm text-black">
            <Icon
                name="i-lucide-info"
                class="inline"
            />
            <span class="text-wrap">
                You're viewing a demo account with read-only access.
                <NuxtLink
                    :to="ROUTE_SIGNIN"
                    class="underline font-semibold">
                    Sign up for free
                </NuxtLink> to create your own account! You can view the data for the date range <strong>01 December 2025 - 15 January 2026.</strong>
            </span>
        </p>
    </div>
</template>
