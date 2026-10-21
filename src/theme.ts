import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                brand: {
                    500: { value: '#3182ce' },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);