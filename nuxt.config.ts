// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

    // build: {
    //     transpile: ["to-px", "@unovis/ts", "@unovis/vue"],
    // },

    css: ["~/assets/css/main.css"],

    devtools: {
        enabled: true,
    },

    modules: [
        "@nuxt/eslint",
        "@nuxt/ui",
        "nuxt-charts",
        "@pinia/nuxt",
        "@nuxtjs/supabase",
        "nuxt-ssr-api-logger",
    ],

    imports: {
        dirs: [
            "constants",
            "stores",
            "types",
        ],
    },

    compatibilityDate: "2025-01-15",

    eslint: {
        config: {
            stylistic: {
                commaDangle: "never",
                braceStyle: "1tbs",
            },
        },
    },

    supabase: {
        redirectOptions: {
            login: "/signin",
            callback: "/confirm",
            exclude: [
                "/",
                "/about",
                "/terms",
                "/privacy",
            ], // Add public pages here
        },
    },

    // ssr: false,
    nitro: {
        experimental: {
            openAPI: false,
        },
    },

    vite: {
    // plugins: [tailwindcss()],
        ssr: {
            noExternal: ["to-px"],
        },
    },
});
