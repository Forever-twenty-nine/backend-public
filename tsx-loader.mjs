import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// Load tsconfig.json
const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
const { baseUrl = '.', paths = {} } = tsconfig.compilerOptions || {};

export async function resolve(specifier, context, nextResolve) {
  // Handle path aliases
  for (const [alias, targets] of Object.entries(paths)) {
    const aliasPattern = alias.replace('/*', '');
    if (specifier.startsWith(aliasPattern)) {
      const target = targets[0].replace('/*', '');
      const relativePath = specifier.slice(aliasPattern.length);
      const resolvedPath = resolve(baseUrl, target, relativePath);
      
      try {
        return nextResolve(pathToFileURL(resolvedPath).href, context);
      } catch {
        // Try with .ts extension
        try {
          return nextResolve(pathToFileURL(resolvedPath + '.ts').href, context);
        } catch {
          // Try with /index.ts
          try {
            return nextResolve(pathToFileURL(resolvedPath + '/index.ts').href, context);
          } catch {
            // Continue to next alias
          }
        }
      }
    }
  }
  
  return nextResolve(specifier, context);
}
