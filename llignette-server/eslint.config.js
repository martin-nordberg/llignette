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
  }
);
