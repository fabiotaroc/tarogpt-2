// This script generates the ai-config.ts file during build time on Vercel
// It uses environment variables to populate the schema

const fs = require("fs");
const path = require("path");

// Only run this in production/Vercel environment
if (process.env.VERCEL) {
  console.log("Generating ai-config.ts for production build...");

  // Get the table schema from environment variable
  let tableSchema = process.env.TABLE_SCHEMA;

  // If TABLE_SCHEMA is not available, try using TABLE_SCHEMA_BASE64
  if (!tableSchema && process.env.TABLE_SCHEMA_BASE64) {
    try {
      // Decode the Base64 encoded schema
      const base64Schema = process.env.TABLE_SCHEMA_BASE64;
      const decodedSchema = Buffer.from(base64Schema, "base64").toString(
        "utf-8"
      );

      // Extract just the schema part from the decoded content
      // This handles the case where the entire file was Base64 encoded
      if (decodedSchema.includes("export const tableSchema =")) {
        // Extract the schema between the backticks
        const match = decodedSchema.match(
          /export const tableSchema = `\\?([\s\S]*?)`/
        );
        if (match && match[1]) {
          tableSchema = match[1];
        } else {
          tableSchema = decodedSchema
            .replace(/export const tableSchema = `\\/, "")
            .replace(/`;$/, "");
        }
      } else {
        tableSchema = decodedSchema;
      }

      console.log("Successfully decoded TABLE_SCHEMA_BASE64");
    } catch (error) {
      console.error("Error decoding TABLE_SCHEMA_BASE64:", error);
    }
  }

  if (!tableSchema) {
    console.error(
      "Error: Neither TABLE_SCHEMA nor TABLE_SCHEMA_BASE64 environment variable is set"
    );
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
