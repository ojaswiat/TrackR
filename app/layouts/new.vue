<template>
    <div class="w-screen p-16">
        <UIPageHeader class="px-4" />
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk ? `TrackR - ${titleChunk}` : "TrackR";
    },
});
</script>
