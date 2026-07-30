const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if TAny is used but not imported
    if (content.includes('TAny') && !content.includes('import { TAny }')) {
        const fileDir = path.dirname(filePath);
        let relativePath = path.relative(fileDir, path.join(__dirname, 'frontend/src/types/any'));
        
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        relativePath = relativePath.replace(/\\/g, '/');

        const importStmt = `import { TAny } from '${relativePath}';\n`;
        content = importStmt + content;
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Restored import in ${filePath}`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', 'dist', 'build'].includes(file)) {
                walkDir(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'frontend/src'));
