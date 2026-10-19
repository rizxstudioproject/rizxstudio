const fs = require('fs');
const p = 'C:/Users/fomir/.gemini/antigravity/brain/8869d61c-5ebc-4792-b361-9730ce26d0a2/.system_generated/tasks/task-288.log';
const content = fs.readFileSync(p, 'utf8');
const idx = content.lastIndexOf('digest:');
if (idx !== -1) {
  console.log(content.substring(Math.max(0, idx - 1200), idx + 200));
} else {
  console.log('No digest found, last 1000 chars:');
  console.log(content.slice(-1000));
}
