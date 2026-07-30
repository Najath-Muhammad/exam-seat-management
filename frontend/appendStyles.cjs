const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');

const stylesToAppend = \`

/* Utility Classes for Pages */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.card {
  background: var(--surface);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255,255,255,0.8);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.text-muted {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-main);
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
}

.full-width {
  width: 100%;
}

.mt-4 {
  margin-top: 1.5rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #f87171;
  text-align: center;
}

/* Page Layouts */
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: var(--surface);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.dashboard-card h4 {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.dashboard-card h2 {
  font-size: 2rem;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
\`;

fs.appendFileSync(cssPath, stylesToAppend);
console.log('Appended styles to index.css');
