const fs = require('fs');
const path = 'f:\\تطبيقات\\تطبيق الروشته\\النسخة الاصلية\\drhyperclinic\\components\\admin\\account-type-controls\\constants.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace all occurrences of premium: { ... }, with premium: { ... }, plus: { ... },
const regex = /(    premium: \{\s+name: 'برو',[\s\S]*?whatsappMessageKey: 'premium[^']*',\s+\},?)/g;

content = content.replace(regex, (match) => {
    let plusBlock = match.replace(/premium/g, 'plus');
    plusBlock = plusBlock.replace(/Premium/g, 'Plus');
    plusBlock = plusBlock.replace(/برو/g, 'Plus');
    return match + '\n' + plusBlock;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
