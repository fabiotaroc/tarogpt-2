// This script generates the ai-config.ts file during build time on Vercel
// It uses environment variables to populate the schema

const fs = require("fs");
const path = require("path");

// Only run this in production/Vercel environment
if (process.env.VERCEL) {
  console.log("Generating ai-config.ts for production build...");

  // Get the table schema from environment variable
  const tableSchema = process.env.TABLE_SCHEMA;

  if (!tableSchema) {
    console.error("Error: TABLE_SCHEMA environment variable is not set");
    process.exit(1);
  }

  // Create the content for ai-config.ts
  const configContent = `// Auto-generated during build
export const tableSchema = \`${tableSchema}\`;
`;

  // Write the file
  const configPath = path.join(__dirname, "..", "lib", "ai-config.ts");
  fs.writeFileSync(configPath, configContent);

  console.log("Successfully generated ai-config.ts");
}
