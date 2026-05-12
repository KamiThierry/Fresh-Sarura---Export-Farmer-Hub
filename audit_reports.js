const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Thierry\\Desktop\\Final Year Project\\FreshSarura_web\\Fresh Sarura_UI_v.1\\src\\portals';

function scanDir(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = scanDir(dir);

let report = '# Export Audit Report\n\n';

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('jsPDF') || content.includes('XLSX') || content.includes('exportTo')) {
    report += `## ${path.basename(file)}\n\n`;
    
    // Extract th content
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/g;
    let match;
    let ths = [];
    while ((match = thRegex.exec(content)) !== null) {
      let text = match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      ths.push(text);
    }
    if (ths.length > 0) {
      report += `**UI Table Columns:**\n${ths.join(' | ')}\n\n`;
    }
    
    // Extract XLSX
    const xlsxRegex = /XLSX\.utils\.book_append_sheet\([\s\S]*?\[(.*?)\]/g;
    let xlsxMatch;
    while ((xlsxMatch = xlsxRegex.exec(content)) !== null) {
        report += `**XLSX Export Headers:** ${xlsxMatch[1]}\n`;
    }

    // Extract PDF
    const pdfRegex = /head:\s*\[\[(.*?)\]\]/g;
    let pdfMatch;
    while ((pdfMatch = pdfRegex.exec(content)) !== null) {
        report += `**PDF Export Headers:** ${pdfMatch[1]}\n`;
    }
    
    report += '\n';
  }
});

console.log(report);
console.log('done');
