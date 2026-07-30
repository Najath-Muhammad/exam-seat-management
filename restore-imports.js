const fs = require('fs');
const path = require('path');

const files = [
    'frontend/src/features/assignments/pages/SeatAssignmentPage.tsx',
    'frontend/src/features/auth/pages/LoginPage.tsx',
    'frontend/src/features/candidates/pages/CandidateDetailsPage.tsx',
    'frontend/src/features/complaints/pages/ComplaintsPage.tsx',
    'frontend/src/features/dashboard/pages/AdminDashboardPage.tsx',
    'frontend/src/features/seats/pages/SeatManagementPage.tsx',
    'frontend/src/features/sessions/pages/CreateSessionPage.tsx',
    'frontend/src/features/sessions/pages/ExamListPage.tsx',
    'frontend/src/features/sessions/pages/SessionDetailsPage.tsx',
    'frontend/src/features/sessions/pages/SessionListPage.tsx'
];

const typesPath = path.join(__dirname, 'frontend', 'src', 'types', 'any.ts');

files.forEach(f => {
    try {
        const fullPath = path.join(__dirname, f);
        let content = fs.readFileSync(fullPath, 'utf-8');
        
        // Skip if already imported
        if (content.includes('import { TAny }')) return;

        // Calculate relative path
        const fileDir = path.dirname(fullPath);
        let relativePath = path.relative(fileDir, path.join(__dirname, 'frontend', 'src', 'types', 'any'));
        
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        relativePath = relativePath.replace(/\\/g, '/');

        const importStmt = `import { TAny } from '${relativePath}';\n`;
        
        // Add to the top of the file
        content = importStmt + content;
        
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Restored import in ${f}`);
    } catch(e) {
        console.error(e);
    }
});
