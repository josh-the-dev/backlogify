import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
	js.configs.recommended,
	tseslint.configs.recommended,
	{
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	prettierConfig,
	{
		ignores: ['dist/**'],
	},
)
