const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src/controllers/implementations');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace standard multiline responses
  const standardRegex = /res\.status\((HttpStatus\.[A-Z_]+)\)\.json\(\{\s*success:\s*(true|false),\s*message:\s*(AppMessages\.[A-Z_]+)(?:,\s*data:\s*([\s\S]*?))?\s*\}\);/g;
  
  content = content.replace(standardRegex, (match, status, success, message, data) => {
    if (data) {
      return "sendResponse(res, " + status + ", " + message + ", " + data.trim() + ");";
    }
    return "sendResponse(res, " + status + ", " + message + ");";
  });

  // Replace single-line responses
  const singleLineRegex = /res\.status\((HttpStatus\.[A-Z_]+)\)\.json\(\{\s*success:\s*(true|false),\s*message:\s*(AppMessages\.[A-Z_]+)\s*\}\);/g;
  content = content.replace(singleLineRegex, (match, status, success, message) => {
    return "sendResponse(res, " + status + ", " + message + ");";
  });

  // Specifically for AuthController custom responses if they have different keys
  if (file === 'AuthController.ts') {
    // AuthController login response
    const authLoginRegex = /res\.status\((HttpStatus\.OK)\)\.json\(\{\s*success:\s*true,\s*message:\s*(AppMessages\.LOGIN_SUCCESSFUL),\s*data:\s*([\s\S]*?)\s*\}\);/g;
    content = content.replace(authLoginRegex, (match, status, message, data) => {
      return "sendResponse(res, " + status + ", " + message + ", " + data + ");";
    });
    
    // AuthController user details response
    const authUserRegex = /res\.status\((HttpStatus\.OK)\)\.json\(\{\s*success:\s*true,\s*message:\s*(AppMessages\.USER_DETAILS_FETCHED),\s*data:\s*([\s\S]*?)\s*\}\);/g;
    content = content.replace(authUserRegex, (match, status, message, data) => {
      return "sendResponse(res, " + status + ", " + message + ", " + data + ");";
    });
  }

  // Specifically for DashboardController custom responses if they have different keys
  if (file === 'DashboardController.ts') {
    // Has data: { summary, exams }
    const dashRegex = /res\.status\((HttpStatus\.OK)\)\.json\(\{\s*success:\s*true,\s*message:\s*(AppMessages\.DASHBOARD_DATA_RETRIEVED),\s*data:\s*([\s\S]*?)\s*\}\);/g;
    content = content.replace(dashRegex, (match, status, message, data) => {
      return "sendResponse(res, " + status + ", " + message + ", " + data + ");";
    });
  }

  if (content !== originalContent) {
    if (!content.includes('sendResponse')) {
      content = "import { sendResponse } from '../../utils/response.util';\n" + content;
    }
    fs.writeFileSync(filePath, content);
    console.log("Refactored " + file);
  }
}
