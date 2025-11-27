const express = require('express');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// ✅ Add this line here, before routes
app.use(express.static('public'));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/json', limit: '50mb' }));

// === CONFIGURATION ===
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Node.js server running on port ${PORT}`);
});

const PYTHON_SCRIPT = path.join(__dirname, 'CSPxGA.py');

// Same passphrase as in PHP
const PASSPHRASE = "ZGNIVm5FNkVNeStmdnozaWdYSDRwNGwvckIwSjVMNDJ2OXN0dnl6ckVOc0MrZmh5UzEwRG83bkx6VXJkWTMzZUlSWXEybVk1NUNZbmQyZ3lhMmw1MEtoeUZMRjFGUlZnTFhidGRXU251S3M9OjqrcZLErLUyMmxE9ETC_SLASH_cYF";

// === AUTO-DETECT PYTHON ===
function findPython() {
    const possibleCommands = process.platform === 'win32'
        ? ['python', 'python3', 'py']
        : ['python3', 'python'];

    for (const cmd of possibleCommands) {
        try {
            const result = require('child_process').spawnSync(cmd, ['--version'], {
                stdio: 'pipe',
                timeout: 3000
            });
            
            if (result.status === 0) {
                console.log(`✓ Found Python: ${cmd} (${result.stdout.toString().trim()})`);
                return cmd;
            }
        } catch (err) {
            // Command not found, continue
        }
    }
    
    throw new Error('Python not found. Please install Python 3.x and ensure it\'s in your PATH');
}

let PYTHON_PATH;
try {
    PYTHON_PATH = findPython();
} catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
}

// === XOR + Base64 Encryption (identical to PHP version) ===
function generateKey(passphrase) {
    return crypto.createHash('sha256').update(passphrase).digest();
}

function xorEncryptDecrypt(data, key) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        result.push(data[i] ^ key[i % key.length]);
    }
    return Buffer.from(result);
}

function encrypt(data, passphrase) {
    const key = generateKey(passphrase);
    const encrypted = xorEncryptDecrypt(Buffer.from(data, 'utf8'), key);
    return encrypted.toString('base64');
}

function decrypt(encryptedBase64, passphrase) {
    const key = generateKey(passphrase);
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const decrypted = xorEncryptDecrypt(encrypted, key);
    return decrypted.toString('utf8');
}

// === MAIN ENDPOINT ===
app.post('/generate-schedule', (req, res) => {
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let rawBody = '';
    
    if (Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString('utf8');
    } else if (typeof req.body === 'string') {
        rawBody = req.body;
    } else {
        rawBody = JSON.stringify(req.body);
    }

    if (!rawBody || rawBody.trim() === '') {
        res.write(JSON.stringify({ error: 'No JSON data received.' }) + '\n');
        res.end();
        return;
    }

    let decodedData;
    try {
        decodedData = JSON.parse(rawBody);
    } catch (err) {
        res.write(JSON.stringify({ error: 'Invalid JSON: ' + err.message }) + '\n');
        res.end();
        return;
    }

    // Optional: Save input for debugging
    const tempFile = `school_data_${Date.now()}.json`;
    fs.writeFileSync(tempFile, JSON.stringify(decodedData, null, 2));

    const jsonString = JSON.stringify(decodedData);
    let encryptedData;

    try {
        encryptedData = encrypt(jsonString, PASSPHRASE);
    } catch (err) {
        res.write(JSON.stringify({ error: 'Encryption failed: ' + err.message }) + '\n');
        res.end();
        return;
    }

    // === Spawn Python Process ===
    const pythonProcess = spawn(PYTHON_PATH, [PYTHON_SCRIPT]);

    let fullOutput = '';
    let isCollectingResult = false;

    pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();

        output.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return;

            // Detect progress messages
            const isProgress = /\b(Generating|Generation|Best fitness|Starting genetic|Finalizing|Successfully|Failed)\b/.test(line);

            if (isProgress) {
                res.write(`[PROGRESS] ${line}\n`);
                res.flush?.();
                isCollectingResult = false;
            } else {
                // This is likely the encrypted result
                fullOutput += line;
                isCollectingResult = true;
            }
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        const err = data.toString();
        res.write(`[ERROR] ${err}\n`);
        res.flush?.();
    });

    pythonProcess.on('close', (code) => {
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }

        if (code !== 0) {
            res.write(`[ERROR] Python process exited with code ${code}\n`);
            res.end();
            return;
        }

        if (!fullOutput.trim()) {
            res.write(JSON.stringify({ error: 'No output received from Python' }) + '\n');
            res.end();
            return;
        }

        try {
            const decrypted = decrypt(fullOutput.trim(), PASSPHRASE);
            let result = JSON.parse(decrypted);

            // Remove large debug field if exists (same as PHP)
            if (result.all_schedule) {
                delete result.all_schedule;
            }

            res.write(JSON.stringify(result) + '\n');
        } catch (err) {
            res.write(JSON.stringify({
                error: 'Decryption or parsing failed',
                details: err.message,
                raw: fullOutput.substring(0, 500) + '...'
            }) + '\n');
        }

        res.end();
    });

    pythonProcess.on('error', (err) => {
        res.write(JSON.stringify({ error: 'Failed to start Python: ' + err.message }) + '\n');
        res.end();
    });

    // Send encrypted data to Python via stdin
    setTimeout(() => {
        pythonProcess.stdin.write(PASSPHRASE + '\n');
        pythonProcess.stdin.write(encryptedData + '\n');
        pythonProcess.stdin.end();
    }, 100);
});

// Health check
app.get('/', (req, res) => {
    res.send('Schedule Generator API is running (Node.js + Python)\n');
});

app.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
    console.log(`Using Python: ${PYTHON_PATH}`);
    console.log(`Send POST requests to /generate-schedule`);
});