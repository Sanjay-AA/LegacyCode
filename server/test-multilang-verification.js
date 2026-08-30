import { detectTechnology } from './src/services/technologyDetector.js';
import { migrationRegistry } from './src/adapters/MigrationRegistry.js';
import { analyzeProject } from './src/services/projectAnalyzer.js';
import { detectProjectStack } from './src/modernization/projectDetector.js';

console.log('==================================================');
console.log('TESTING MULTI-LANGUAGE DETECTION & MODERNIZATION MAP');
console.log('==================================================\n');

// Test 1: Java Code
const javaCode = `package com.legacy.app;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class UserServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        String username = req.getParameter("username");
    }
}`;

const javaDet = detectTechnology(javaCode, 'UserServlet.java');
console.log('[Test 1] Java Detection:', javaDet.detectedTechnology, '→ Adapter:', javaDet.primaryAdapterId);
if (javaDet.detectedTechnology !== 'Java' || javaDet.primaryAdapterId !== 'java-to-spring') {
  console.error('FAIL: Java detection failed');
  process.exit(1);
}

// Test 2: PHP Code
const phpCode = `<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $username = $_POST['username'];
  $conn = mysqli_connect("localhost", "db_user", "password", "legacy_db");
}`;

const phpDet = detectTechnology(phpCode, 'register.php');
console.log('[Test 2] PHP Detection:', phpDet.detectedTechnology, '→ Adapter:', phpDet.primaryAdapterId);
if (phpDet.detectedTechnology !== 'PHP' || phpDet.primaryAdapterId !== 'php-to-laravel') {
  console.error('FAIL: PHP detection failed');
  process.exit(1);
}

// Test 3: Python Code
const pyCode = `import os
from flask import Flask, request

app = Flask(__name__)

@app.route("/api/register", methods=["POST"])
def register():
    username = request.form.get("username")
    return {"status": "ok"}
`;

const pyDet = detectTechnology(pyCode, 'app.py');
console.log('[Test 3] Python Detection:', pyDet.detectedTechnology, '→ Adapter:', pyDet.primaryAdapterId);
if (pyDet.detectedTechnology !== 'Python' || pyDet.primaryAdapterId !== 'python-to-fastapi') {
  console.error('FAIL: Python detection failed');
  process.exit(1);
}

// Test 4: Mixed Multi-Technology Project Stack
const projectFiles = new Map([
  ['js/app.js', '$(document).ready(function() { $("#btn").click(function() { $.ajax({ url: "/api" }); }); });'],
  ['backend/UserServlet.java', 'package com.app; public class UserServlet extends javax.servlet.http.HttpServlet {}'],
  ['database/schema.sql', 'CREATE TABLE users (id INT PRIMARY KEY, username VARCHAR(255));'],
  ['deploy.sh', '#!/bin/bash\necho "Deploying application"']
]);

const stackDet = detectProjectStack(projectFiles);
console.log('\n[Test 4] Mixed Multi-Technology Project Detection:');
stackDet.technologies.forEach(t => console.log(`  ✓ Detected: ${t.technology} (${t.layer}) - Confidence: ${t.confidence}%`));
stackDet.migrations.forEach(m => console.log(`  ✓ Migration Rule: ${m.source} → ${m.target} [Adapter: ${m.adapterId}]`));

if (stackDet.technologies.length < 3) {
  console.error('FAIL: Multi-technology stack detection failed');
  process.exit(1);
}

console.log('\n==================================================');
console.log('ALL MULTI-LANGUAGE VERIFICATION TESTS PASSED!');
console.log('==================================================');
