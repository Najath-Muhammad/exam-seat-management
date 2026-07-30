const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src/controllers/implementations');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('sendResponse') && !content.includes('import { sendResponse }')) {
    content = "import { sendResponse } from '../../utils/response.util';\n" + content;
    fs.writeFileSync(filePath, content);
    console.log("Fixed imports in " + file);
  }
}
