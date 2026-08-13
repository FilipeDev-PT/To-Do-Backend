import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/modules/**/domain/**/*.js',
        'src/modules/**/application/**/*.js',
        'src/shared/**/*.js',
        'src/modules/**/infrastructure/http/**/*.js',
      ],
      exclude: ['src/**/*.test.js', 'src/test/**'],
      thresholds: {
        lines: 70,
      },
    },
  },
})
