import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];



// Ignore specific files
eslintConfig.push({
  files: [
    "src/utils/valid-json.ts",
    "src/contexts/UserContext.tsx",
    "src/app/api/user/verify/[id]/route.ts",
    "src/app/api/stores/verify/route.ts"
  ],
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-object-type": "off",
  },
});

export default eslintConfig;
