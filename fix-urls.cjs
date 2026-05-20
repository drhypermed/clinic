const fs = require('fs');

const path1 = './components/guidelines/data/ada2026/sources.ts';
let content1 = fs.readFileSync(path1, 'utf8');

content1 = content1.replace(/url: 'https:\/\/doi\.org\/10\.2337\/dc26-S(\d+)'/g, (match, digits) => {
    let paddedNum = digits.padStart(3, '0');
    return `url: 'https://doi.org/10.2337/dc26-S${paddedNum}'`;
});

fs.writeFileSync(path1, content1, 'utf8');
console.log('Fixed sources.ts padding');

const path2 = './components/guidelines/guidelinesData.ts';
let content2 = fs.readFileSync(path2, 'utf8');

content2 = content2.replace(/url: 'https:\/\/doi\.org\/10\.2337\/dc26-S(\d+)'/g, (match, digits) => {
    let paddedNum = digits.padStart(3, '0');
    return `url: 'https://doi.org/10.2337/dc26-S${paddedNum}'`;
});

fs.writeFileSync(path2, content2, 'utf8');
console.log('Fixed guidelinesData.ts padding');
