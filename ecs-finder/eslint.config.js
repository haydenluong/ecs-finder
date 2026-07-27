import next from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'dist/**', 'node_modules/**', 'next-env.d.ts'] },
  ...next,
  {
    rules: {
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
