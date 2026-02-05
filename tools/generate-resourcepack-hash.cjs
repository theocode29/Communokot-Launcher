const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

if (process.argv.length < 4) {
    console.log('Usage: node generate-resourcepack-hash.js <path-to-pack.zip> <version-number>');
    process.exit(1);
}

const filePath = process.argv[2];
const version = process.argv[3];

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const fileBuffer = fs.readFileSync(filePath);
const hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);

const hex = hashSum.digest('hex');
const size = fs.statSync(filePath).size;

const output = {
    version: version,
    sha256: hex,
    size: size
};

console.log(JSON.stringify(output, null, 2));

const outputPath = path.join(path.dirname(filePath), 'version.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nGenerated version.json at: ${outputPath}`);
