import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
    ...ts.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    },
    {
        languageOptions: {
            parserOptions: {
                parser: ts.parser
            }
        }
    },
    {
        ignores: ["build/", "dist/"]
    },
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ]
        }
    }
);
