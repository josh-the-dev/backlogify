import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
	js.configs.recommended,
	tseslint.configs.recommended,
	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat['jsx-runtime'],
	{
		plugins: {
			'react-hooks': reactHooksPlugin,
		},
		languageOptions: {
			globals: globals.browser,
		},
		settings: {
			react: { version: 'detect' },
		},
		rules: {
			...reactHooksPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},
	prettierConfig,
	{
		ignores: ['dist/**', '.output/**', 'routeTree.gen.ts', '.storybook/**'],
	},
)
