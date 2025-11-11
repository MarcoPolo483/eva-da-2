import type { StorybookConfig } from '@storybook/react-webpack5';
import * as path from 'path';

const config: StorybookConfig = {
  // Story file patterns for EVA DA 2.0 components
  stories: [
    '../src/design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/pages/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],

  // Essential add-ons for enterprise development
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-accessibility',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: { importLoaders: 1 }
              },
              {
                loader: 'postcss-loader',
                options: { implementation: require.resolve('postcss') }
              }
            ]
          }
        ]
      }
    }
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  // Documentation configuration
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },

  // Core configuration for enterprise features
  core: {
    disableTelemetry: true, // Government compliance
  },

  // Features for advanced component development
  features: {
    // Enable modern features
    buildStoriesJson: true,
    storyStoreV7: true,
  },

  // Environment variables for government compliance
  env: (config) => ({
    ...config,
    STORYBOOK_ENV: 'enterprise',
    WCAG_COMPLIANCE_LEVEL: 'AA',
    PROTECTED_B_MODE: 'true',
    BILINGUAL_SUPPORT: 'true',
  }),
  // Webpack configuration for optimal development
  webpackFinal: async (config) => {
    // Ensure proper handling of design system assets
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/design-system': path.resolve(__dirname, '../src/design-system'),
      '@/components': path.resolve(__dirname, '../src/components'),
      '@/types': path.resolve(__dirname, '../src/types'),
      '@/utils': path.resolve(__dirname, '../src/utils'),
    };

    return config;
  },

  // Static directories for assets
  staticDirs: ['../public', '../src/design-system/assets'],
};

export default config;