/**
 * Fix ES module imports by adding .js extensions
 * This script processes compiled JS files and adds .js extensions to relative imports
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = glob.sync('dist/**/*.js', { ignore: ['**/node_modules/**', '**/*.map'] });

let filesModified = 0;

files.forEach((file) => {
  const content = readFileSync(file, 'utf8');
  const fileDir = dirname(file);
  
  // Match import statements
  // 1. Relative paths: './path' or '../path'
  // 2. Node modules with subpaths: 'package/subpath'
  const modifiedContent = content.replace(
    /(from\s+['"])((?:\.\.[/\\]|\.{1,2}[/\\])[\w\/\\.-]*|[\w@][\w\/-]*[/\\][\w\/\\.-]+)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // Don't add .js if it already has an extension
      if (importPath.match(/\.(js|json|node|mjs|cjs)$/)) {
        return match;
      }
      
      // Handle relative imports
      if (importPath.startsWith('.')) {
        // Resolve the absolute path of the import
        const absolutePath = path.resolve(fileDir, importPath);
        
        // Check if it's a directory with an index file
        if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
          filesModified++;
          return `${prefix}${importPath}/index.js${suffix}`;
        }
        
        // Otherwise, just add .js
        filesModified++;
        return `${prefix}${importPath}.js${suffix}`;
      }
      
      // Handle node_modules imports with subpaths (e.g., 'dayjs/plugin/utc')
      // These need .js extension in ES modules
      if (importPath.includes('/')) {
        filesModified++;
        return `${prefix}${importPath}.js${suffix}`;
      }
      
      // Don't modify bare module imports (e.g., 'express', 'dayjs')
      return match;
    }
  );
  
  if (content !== modifiedContent) {
    writeFileSync(file, modifiedContent, 'utf8');
  }
});

console.log(`✅ Fixed imports in ${filesModified} locations across ${files.length} files`);
