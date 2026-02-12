
import fs from 'fs';

const part1 = JSON.parse(fs.readFileSync('migration_grh/data_APP_LIST_part1.json', 'utf8'));
const part2 = JSON.parse(fs.readFileSync('migration_grh/data_APP_LIST_part2.json', 'utf8'));

// Remove RN from part2
const part2Clean = part2.map(row => {
    const { RN, ...rest } = row;
    return rest;
});

const merged = [...part1, ...part2Clean];

fs.writeFileSync('migration_grh/data_APP_LIST.json', JSON.stringify(merged, null, 2));

console.log('Merged data_APP_LIST.json created.');
