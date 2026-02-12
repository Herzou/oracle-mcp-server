const fs = require('fs');

if (process.argv.length < 4) {
    console.error('Usage: node merge_json.js <output_file> <input_file1> [input_file2] ...');
    process.exit(1);
}

const outputFile = process.argv[2];
const inputFiles = process.argv.slice(3);

let mergedData = [];

try {
    for (const file of inputFiles) {
        if (!fs.existsSync(file)) {
            console.warn(`Warning: File not found ${file}, skipping.`);
            continue;
        }
        const content = fs.readFileSync(file, 'utf8');
        try {
            const json = JSON.parse(content);
            if (Array.isArray(json)) {
                // Clean RN field if present
                const cleaned = json.map(row => {
                    if (row.RN !== undefined) {
                        const { RN, ...rest } = row;
                        return rest;
                    }
                    return row;
                });
                mergedData = mergedData.concat(cleaned);
            } else if (typeof json === 'object' && json !== null) {
                 // Handle single object if needed, though unlikely for list
                 if (json.RN !== undefined) {
                     const { RN, ...rest } = json;
                     mergedData.push(rest);
                 } else {
                    mergedData.push(json);
                 }
            }
        } catch (e) {
            console.error(`Error parsing JSON from ${file}:`, e.message);
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2));
    console.log(`Successfully merged ${mergedData.length} rows into ${outputFile}`);

} catch (err) {
    console.error('Error merging files:', err);
    process.exit(1);
}
