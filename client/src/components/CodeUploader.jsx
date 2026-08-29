import React, { useState, useRef } from 'react';
import { Upload, FileCode, FolderArchive, AlertCircle, ArrowRight, Layers, Code, Sparkles, Server, Cpu } from 'lucide-react';

const SAMPLE_JQUERY_CODE = `// Legacy User Signup & Preferences jQuery Component
$(document).ready(function() {
  var isSubmitting = false;
  var userSessionKey = 'user_pref_v1';

  var savedTheme = localStorage.getItem('theme_mode');
  if (savedTheme) {
    $('#theme-select').val(savedTheme);
    $('body').addClass('theme-' + savedTheme);
  }

  $('#open-signup-modal').on('click', function(e) {
    e.preventDefault();
    $('#signup-modal').fadeIn(200).addClass('active');
  });

  $('#signup-form').submit(function(e) {
    e.preventDefault();
    if (isSubmitting) return;

    var username = $('#username-input').val();
    var email = $('#email-input').val();

    if (!username || !email) {
      $('#error-banner').text('Please fill all required fields.').slideDown();
      return;
    }

    isSubmitting = true;
    $.ajax({
      url: '/api/v1/users/register',
      type: 'POST',
      dataType: 'json',
      data: { username: username, email: email },
      success: function(response) {
        isSubmitting = false;
        alert('Welcome ' + response.user.username);
      }
    });
  });
});`;

const SAMPLE_PHP_CODE = `<?php
// Legacy User Registration Script
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $username = $_POST['username'];
  $email = $_POST['email'];
  
  $conn = mysqli_connect("localhost", "db_user", "password", "legacy_db");
  $sql = "INSERT INTO users (username, email) VALUES ('$username', '$email')";
  $result = mysqli_query($conn, $sql);
  
  if ($result) {
    echo json_encode(["status" => "success"]);
  }
}`;

const SAMPLE_JAVA_CODE = `package com.legacy.app;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class UserServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        String username = request.getParameter("username");
        // Manual JDBC Query
    }
}`;

export default function CodeUploader({
  onUpload,
  onUploadProject,
  adapters = [],
  isProcessing = false,
  error = null
}) {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('single'); // 'single' | 'project'
  const [dragActive, setDragActive] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [customFilename, setCustomFilename] = useState('legacy-code.js');
  const [selectedAdapterId, setSelectedAdapterId] = useState('jquery-to-react');

  const handleFile = (file) => {
    if (!file) return;
    const filename = file.name;

    if (filename.endsWith('.zip')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        if (onUploadProject) {
          onUploadProject(base64, filename, selectedAdapterId);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const codeContent = e.target.result || '';
        if (codeContent.trim() && onUpload) {
          onUpload(codeContent, filename, selectedAdapterId);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (type) => {
    if (type === 'php') {
      onUpload(SAMPLE_PHP_CODE, 'register.php', 'php-to-laravel');
    } else if (type === 'java') {
      onUpload(SAMPLE_JAVA_CODE, 'UserServlet.java', 'java-to-spring');
    } else {
      onUpload(SAMPLE_JQUERY_CODE, 'legacy-signup.js', 'jquery-to-react');
    }
  };

  const handleStartPasted = () => {
    if (pastedCode.trim() && onUpload) {
      onUpload(pastedCode, customFilename || 'legacy-code.js', selectedAdapterId);
    }
  };

  return (
    <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl p-8 max-w-6xl mx-auto shadow-2xl space-y-6">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2 pb-4 border-b border-[#1c2e38]">
        <h2 className="text-2xl font-extrabold text-white tracking-wide font-mono">
          What are you modernizing?
        </h2>
        <p className="text-xs text-slate-400">
          Choose a single file or upload a complete legacy project archive (.zip)
        </p>
      </div>

      {/* Migration Path Selector */}
      <div className="bg-[#070a0e] border border-[#1c2e38] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="font-bold text-slate-200 flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-[#10b981]" />
          <span>Select Migration Path:</span>
        </label>
        <select
          value={selectedAdapterId}
          onChange={(e) => setSelectedAdapterId(e.target.value)}
          className="bg-[#0c1219] border border-[#1c2e38] rounded-lg px-3 py-1.5 text-xs text-[#10b981] font-mono font-bold focus:outline-none focus:border-[#10b981]"
        >
          <optgroup label="Web Stack">
            <option value="jquery-to-react">jQuery → React</option>
            <option value="vue-to-react">Vue.js → React</option>
            <option value="angular-to-react">Angular → React</option>
          </optgroup>
          <optgroup label="Backend Stack">
            <option value="php-to-laravel">PHP → Laravel</option>
            <option value="java-to-spring">Java → Spring Boot</option>
            <option value="python-to-fastapi">Python → FastAPI</option>
          </optgroup>
          <optgroup label="Mobile Stack">
            <option value="android-java-to-kotlin">Android Java → Kotlin</option>
            <option value="react-native-modernization">React Native Modernization</option>
            <option value="legacy-mobile">Cordova → React Native</option>
          </optgroup>
          <optgroup label="Data & API Stack">
            <option value="schema-modernization">MySQL DDL → PostgreSQL Prisma</option>
            <option value="database-migration">SQL Dump → Knex.js Migration</option>
            <option value="api-modernization">SOAP WSDL → OpenAPI 3.0 REST</option>
          </optgroup>
          <optgroup label="Infrastructure Stack">
            <option value="infrastructure-modernization">Shell Script → Kubernetes Manifests</option>
            <option value="legacy-cloud-config">CloudFormation → Terraform IaC</option>
          </optgroup>
        </select>
      </div>

      {/* Two Ingestion Columns (LEFT: File/ZIP Upload, RIGHT: Code Paste) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: PROJECT / FILE UPLOAD */}
        <div className="bg-[#070a0e] border border-[#1c2e38] rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2e38]">
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-[#10b981]" />
              PROJECT / FILE UPLOAD
            </span>

            <div className="flex items-center space-x-1 bg-[#0c1219] p-1 rounded-lg border border-[#1c2e38] text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  mode === 'single' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single File
              </button>
              <button
                type="button"
                onClick={() => setMode('project')}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  mode === 'project' ? 'bg-[#1c2e38] text-[#10b981]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload .zip
              </button>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-[220px] ${
              dragActive
                ? 'border-[#10b981] bg-[#10b981]/10'
                : 'border-[#1c2e38] bg-[#0c1219]/60 hover:border-[#10b981]/50 hover:bg-[#0c1219]'
            }`}
          >
            <div className="p-3 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] mb-3">
              {mode === 'project' ? <FolderArchive className="w-8 h-8" /> : <FileCode className="w-8 h-8" />}
            </div>

            <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono">
              Drag & Drop your legacy {mode === 'project' ? 'project ZIP' : 'file'} here
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs mb-4">
              We'll analyze your code and identify modernization opportunities automatically.
            </p>

            <button
              type="button"
              disabled={isProcessing}
              className="bg-[#10b981] hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Files</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={mode === 'project' ? '.zip' : '*/*'}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: PASTE LEGACY CODE */}
        <div className="bg-[#070a0e] border border-[#1c2e38] rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2e38]">
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-400" />
              PASTE LEGACY CODE
            </span>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="filename (e.g. app.js / script.php)"
              className="bg-[#0c1219] border border-[#1c2e38] rounded px-2 py-0.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div className="flex-1 flex flex-col space-y-3">
            <textarea
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              placeholder="// Paste your legacy code here..."
              rows={8}
              spellCheck={false}
              className="w-full flex-1 bg-[#0c1219] border border-[#1c2e38] rounded-xl p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-[#10b981]/50"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStartPasted}
                disabled={!pastedCode.trim() || isProcessing}
                className="bg-[#10b981] hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold font-mono px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-lg"
              >
                <span>Start Modernizing</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sample Loaders */}
      <div className="flex items-center justify-between bg-[#070a0e] p-3 rounded-xl border border-[#1c2e38] text-xs font-mono">
        <span className="text-slate-400 font-semibold">Or test with realistic legacy fixtures:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleLoadSample('jquery')}
            type="button"
            disabled={isProcessing}
            className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded border border-amber-500/20 transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>jQuery Cart</span>
          </button>

          <button
            onClick={() => handleLoadSample('php')}
            type="button"
            disabled={isProcessing}
            className="text-[11px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold px-3 py-1.5 rounded border border-purple-500/20 transition-all flex items-center space-x-1"
          >
            <Server className="w-3 h-3" />
            <span>PHP Script</span>
          </button>

          <button
            onClick={() => handleLoadSample('java')}
            type="button"
            disabled={isProcessing}
            className="text-[11px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold px-3 py-1.5 rounded border border-sky-500/20 transition-all flex items-center space-x-1"
          >
            <Cpu className="w-3 h-3" />
            <span>Java Servlet</span>
          </button>
        </div>
      </div>

      {/* Error Banner if Any */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-xs text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
