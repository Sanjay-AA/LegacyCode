import React, { useState, useRef, useEffect } from 'react';
import { Upload, FolderArchive, Code2, Sparkles, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { validateCodeInput } from '../services/inputValidator';

const SAMPLE_JQUERY_CODE = `// Legacy User Signup & Preferences jQuery Component
$(document).ready(function() {
  var isSubmitting = false;

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

function detectLanguageLocal(code, filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  if (ext === 'php') return { source: 'PHP', target: 'Laravel', adapterId: 'php-to-laravel', langBadge: 'PHP' };
  if (ext === 'java') return { source: 'Java', target: 'Spring Boot', adapterId: 'java-to-spring', langBadge: 'JAVA' };
  if (ext === 'py') return { source: 'Python', target: 'FastAPI', adapterId: 'python-to-fastapi', langBadge: 'PY' };
  if (ext === 'rb') return { source: 'Ruby', target: 'Rails', adapterId: 'ruby-to-rails', langBadge: 'RB' };
  if (ext === 'vue') return { source: 'Vue.js', target: 'React', adapterId: 'vue-to-react', langBadge: 'VUE' };
  if (ext === 'ts' || ext === 'tsx') return { source: 'Angular', target: 'React', adapterId: 'angular-to-react', langBadge: 'TS' };

  if (code) {
    if (code.includes('<?php')) return { source: 'PHP', target: 'Laravel', adapterId: 'php-to-laravel', langBadge: 'PHP' };
    if (code.includes('javax.servlet') || code.includes('import java') || code.includes('public class')) {
      return { source: 'Java', target: 'Spring Boot', adapterId: 'java-to-spring', langBadge: 'JAVA' };
    }
    if (code.includes('def ') && code.includes('import ')) return { source: 'Python', target: 'FastAPI', adapterId: 'python-to-fastapi', langBadge: 'PY' };
    if (code.includes('<template>') || code.includes('Vue.component')) return { source: 'Vue.js', target: 'React', adapterId: 'vue-to-react', langBadge: 'VUE' };
    if (code.includes('@Component') || code.includes('@Injectable')) return { source: 'Angular', target: 'React', adapterId: 'angular-to-react', langBadge: 'TS' };
  }

  return { source: 'jQuery', target: 'React', adapterId: 'jquery-to-react', langBadge: 'JS' };
}

export default function CodeUploader({
  onUpload,
  onUploadProject,
  adapters = [],
  isProcessing = false,
  error = null
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Editor State
  const [pastedCode, setPastedCode] = useState(SAMPLE_JQUERY_CODE);
  const [customFilename, setCustomFilename] = useState('legacy-code.js');
  const [selectedAdapterId, setSelectedAdapterId] = useState('jquery-to-react');
  const [detectedTech, setDetectedTech] = useState({ source: 'jQuery', target: 'React', langBadge: 'JS' });

  // Auto-detect technology on code or filename change
  useEffect(() => {
    const detected = detectLanguageLocal(pastedCode, customFilename);
    setDetectedTech(detected);
    if (!selectedAdapterId || selectedAdapterId === 'jquery-to-react') {
      setSelectedAdapterId(detected.adapterId);
    }
  }, [pastedCode, customFilename]);

  // Sync scroll between textarea and line numbers
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const lineCount = Math.max(1, pastedCode.split('\n').length);
  const lineNumbersArray = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleFile = (file) => {
    if (!file) return;
    setValidationError(null);
    const filename = file.name;

    if (filename.endsWith('.zip')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
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
        } catch (err) {
          setValidationError({
            title: 'Project could not be analyzed',
            message: 'The uploaded project appears to be incomplete, corrupted, or missing required source files. Please check the project and try again.'
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const codeContent = e.target.result || '';
        const check = validateCodeInput(codeContent, filename);
        if (!check.valid) {
          setValidationError({
            title: check.title,
            message: check.message
          });
          return;
        }
        if (onUpload) {
          onUpload(codeContent, filename, selectedAdapterId);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFolderUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files[0]) handleFile(files[0]);
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
    setValidationError(null);
    if (type === 'php') {
      setPastedCode(SAMPLE_PHP_CODE);
      setCustomFilename('register.php');
      setSelectedAdapterId('php-to-laravel');
    } else if (type === 'java') {
      setPastedCode(SAMPLE_JAVA_CODE);
      setCustomFilename('UserServlet.java');
      setSelectedAdapterId('java-to-spring');
    } else {
      setPastedCode(SAMPLE_JQUERY_CODE);
      setCustomFilename('legacy-signup.js');
      setSelectedAdapterId('jquery-to-react');
    }
  };

  const handleStartPasted = () => {
    setValidationError(null);
    const check = validateCodeInput(pastedCode, customFilename);
    if (!check.valid) {
      setValidationError({
        title: check.title,
        message: check.message
      });
      return;
    }

    if (onUpload) {
      onUpload(pastedCode, customFilename || 'legacy-code.js', selectedAdapterId);
    }
  };

  const handleClear = () => {
    setValidationError(null);
    setPastedCode('');
  };

  const activeError = validationError || (error ? { title: 'Migration Error', message: error } : null);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 font-sans">
      {/* HERO TITLE & SUBTITLE */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono uppercase">
          MODERNIZE YOUR LEGACY PROJECT
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Upload your project or paste legacy source code.
        </p>
      </div>

      {/* SEGMENTED CONTROL / TABS: [ Upload Project ] [ Paste Code ] */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-[#0c1219] p-1.5 rounded-xl border border-[#1c2e38] text-xs font-mono font-bold shadow-lg">
          <button
            type="button"
            onClick={() => { setValidationError(null); setInputMode('upload'); }}
            className={`px-5 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              inputMode === 'upload'
                ? 'bg-[#1c2e38] text-[#10b981] shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Upload Project</span>
          </button>

          <button
            type="button"
            onClick={() => { setValidationError(null); setInputMode('paste'); }}
            className={`px-5 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              inputMode === 'paste'
                ? 'bg-[#1c2e38] text-[#10b981] shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Paste Code</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          OPTION 1 — UPLOAD PROJECT VIEW
         ======================================================== */}
      {inputMode === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-[#10b981] bg-[#10b981]/10 scale-[1.01]'
              : 'border-[#1c2e38] bg-[#0c1219] hover:border-[#10b981]/60 hover:bg-[#0e1721]'
          }`}
        >
          <div className="p-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] mb-4">
            <FolderArchive className="w-10 h-10 stroke-[1.5]" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1 font-mono">
            Upload your project
          </h3>

          <p className="text-xs text-slate-400 max-w-md mb-6 font-mono">
            Drop ZIP or project folder here
          </p>

          <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Files</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip, .js, .jsx, .ts, .tsx, .php, .java, .py, .rb, .sql, .kt, .cs, .json, .xml, */*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          OPTION 2 — PASTE CODE VIEW (LINE-NUMBERED CODE EDITOR)
         ======================================================== */}
      {inputMode === 'paste' && (
        <div className="space-y-4 font-mono">
          <div className="bg-[#0c1219] border border-[#1c2e38] rounded-2xl overflow-hidden shadow-2xl space-y-0">
            {/* EDITOR HEADER */}
            <div className="bg-[#070a0e] px-4 py-3 border-b border-[#1c2e38] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  LEGACY SOURCE
                </span>
                <span className="text-slate-600">|</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 text-[11px]">Filename:</span>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => { setValidationError(null); setCustomFilename(e.target.value); }}
                    placeholder="legacy-code.js"
                    className="bg-[#0c1219] border border-[#1c2e38] rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-[#10b981] w-36"
                  />
                </div>
              </div>

              {/* Language Badge & Stack Preset Selector */}
              <div className="flex items-center space-x-3">
                <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-bold px-2 py-0.5 rounded text-[10px]">
                  {detectedTech.langBadge}
                </span>

                <select
                  value={selectedAdapterId}
                  onChange={(e) => setSelectedAdapterId(e.target.value)}
                  className="bg-[#0c1219] border border-[#1c2e38] rounded px-2.5 py-1 text-xs text-[#10b981] font-bold focus:outline-none focus:border-[#10b981]"
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
                    <option value="ruby-to-rails">Ruby → Rails</option>
                  </optgroup>
                  <optgroup label="Mobile Stack">
                    <option value="android-java-to-kotlin">Android Java → Kotlin</option>
                    <option value="react-native-modernization">React Native Modernization</option>
                    <option value="legacy-mobile">Cordova → React Native</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* EDITOR BODY WITH LINE NUMBERS & SCROLLING */}
            <div className="relative flex bg-[#070a0e] min-h-[280px] max-h-[460px] text-xs">
              {/* Line Numbers Column */}
              <div
                ref={lineNumbersRef}
                className="select-none py-3 pl-3 pr-2 bg-[#0c1219] text-slate-600 border-r border-[#1c2e38] text-right font-mono leading-relaxed overflow-hidden shrink-0 min-w-[40px]"
              >
                {lineNumbersArray.map((num) => (
                  <div key={num} className="leading-6">{num}</div>
                ))}
              </div>

              {/* Editable Textarea */}
              <textarea
                ref={textareaRef}
                value={pastedCode}
                onChange={(e) => { setValidationError(null); setPastedCode(e.target.value); }}
                onScroll={handleScroll}
                placeholder="// Paste or type legacy source code here..."
                spellCheck={false}
                rows={12}
                className="w-full flex-1 bg-transparent p-3 text-slate-200 font-mono leading-6 resize-none focus:outline-none overflow-auto border-none select-text selection:bg-[#10b981]/30"
              />
            </div>

            {/* EDITOR FOOTER / STATUS & ACTIONS */}
            <div className="bg-[#070a0e] px-4 py-3 border-t border-[#1c2e38] flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Detected Language Indicator */}
              <div className="flex items-center space-x-2 text-slate-400">
                <span>Detected: <strong className="text-slate-200">{detectedTech.source}</strong></span>
                <span>→</span>
                <span>Target: <strong className="text-[#10b981]">{detectedTech.target}</strong></span>
              </div>

              {/* Sample Loader Helpers & Clear / Start Modernization Buttons */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-1 border-r border-[#1c2e38] pr-3 text-[11px] text-slate-500">
                  <span>Samples:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('jquery')}
                    className="hover:text-amber-400 px-1 font-bold"
                  >
                    jQuery
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('php')}
                    className="hover:text-purple-400 px-1 font-bold"
                  >
                    PHP
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('java')}
                    className="hover:text-sky-400 px-1 font-bold"
                  >
                    Java
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-[#111a22] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-[#1c2e38] px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartPasted}
                  disabled={isProcessing}
                  className="bg-[#10b981] hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2 rounded-xl transition-all shadow-lg flex items-center space-x-2"
                >
                  <span>Start Modernization</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER-FRIENDLY ERROR BANNER */}
      {activeError && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 font-mono space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>⚠ {activeError.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{activeError.message}</p>
        </div>
      )}
    </div>
  );
}
