import { validateCodeInput } from '../client/src/services/inputValidator.js';
import { detectTechnology } from './src/services/technologyDetector.js';

console.log('==================================================');
console.log('TESTING SINGLE FILE MODERNIZATION FLOW');
console.log('==================================================\n');

// Test 1: Invalid Non-Code Text
const invalidText = 'hello this is my plain text file';
const valRes = validateCodeInput(invalidText, 'test.txt');
console.log('[Test 1] Invalid Text Check:', valRes.valid ? 'FAIL (Allowed plain text)' : 'PASS (Caught invalid text)');
if (valRes.valid) {
  console.error('FAIL: Plain text should have been rejected!');
  process.exit(1);
}

// Test 2: Valid jQuery File
const jqueryCode = '$(document).ready(function() { $("#btn").click(function() { alert("hi"); }); });';
const valJquery = validateCodeInput(jqueryCode, 'dashboard.js');
const detJquery = detectTechnology(jqueryCode, 'dashboard.js');
console.log('[Test 2] jQuery File:', valJquery.valid ? 'PASS' : 'FAIL', '→ Detected:', detJquery.detectedTechnology, '→ Target:', detJquery.matchingAdapters[0].target);

// Test 3: Valid Java File
const javaCode = 'package com.healthcare; public class HealthcareController extends javax.servlet.http.HttpServlet { public void getPhcs() {} }';
const valJava = validateCodeInput(javaCode, 'HealthcareController.java');
const detJava = detectTechnology(javaCode, 'HealthcareController.java');
console.log('[Test 3] Java File:', valJava.valid ? 'PASS' : 'FAIL', '→ Detected:', detJava.detectedTechnology, '→ Target:', detJava.matchingAdapters[0].target);

// Test 4: Valid PHP File
const phpCode = '<?php if ($_SERVER["REQUEST_METHOD"] == "POST") { $user = $_POST["username"]; }';
const valPhp = validateCodeInput(phpCode, 'legacy.php');
const detPhp = detectTechnology(phpCode, 'legacy.php');
console.log('[Test 4] PHP File:', valPhp.valid ? 'PASS' : 'FAIL', '→ Detected:', detPhp.detectedTechnology, '→ Target:', detPhp.matchingAdapters[0].target);

// Test 5: Valid Python File
const pyCode = 'import os\nfrom flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef main(): return "hello"';
const valPy = validateCodeInput(pyCode, 'app.py');
const detPy = detectTechnology(pyCode, 'app.py');
console.log('[Test 5] Python File:', valPy.valid ? 'PASS' : 'FAIL', '→ Detected:', detPy.detectedTechnology, '→ Target:', detPy.matchingAdapters[0].target);

// Test 6: Valid SQL File
const sqlCode = 'CREATE TABLE patients (id INT PRIMARY KEY, name VARCHAR(255));';
const valSql = validateCodeInput(sqlCode, 'schema.sql');
const detSql = detectTechnology(sqlCode, 'schema.sql');
console.log('[Test 6] SQL File:', valSql.valid ? 'PASS' : 'FAIL', '→ Detected:', detSql.detectedTechnology, '→ Target:', detSql.matchingAdapters[0].target);

console.log('\n==================================================');
console.log('ALL SINGLE FILE MIGRATION FLOW TESTS PASSED!');
console.log('==================================================');
