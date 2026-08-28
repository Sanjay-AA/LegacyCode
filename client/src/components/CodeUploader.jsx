import React, { useState, useRef } from 'react';
import { Upload, FileCode, Play, AlertCircle, RefreshCw, Sparkles, Check } from 'lucide-react';

const SAMPLE_JQUERY_CODE = `// Legacy User Signup & Preferences jQuery Component
$(document).ready(function() {
  var isSubmitting = false;
  var userSessionKey = 'user_pref_v1';

  // Load cached settings
  var savedTheme = localStorage.getItem('theme_mode');
  if (savedTheme) {
    $('#theme-select').val(savedTheme);
    $('body').addClass('theme-' + savedTheme);
  }

  // Open modal handler
  $('#open-signup-modal').on('click', function(e) {
    e.preventDefault();
    $('#signup-modal').fadeIn(200).addClass('active');
    $('.modal-backdrop').show();
  });

  // Close modal handler
  $('.close-modal').click(function() {
    $('#signup-modal').fadeOut(150).removeClass('active');
    $('.modal-backdrop').hide();
  });

  // Form submit handler with AJAX
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
    $('#submit-btn').prop('disabled', true).text('Saving...');

    $.ajax({
      url: '/api/v1/users/register',
      type: 'POST',
      dataType: 'json',
      data: { username: username, email: email },
      success: function(response) {
        isSubmitting = false;
        $('#submit-btn').prop('disabled', false).text('Submit');
        $('#signup-modal').hide();
        localStorage.setItem(userSessionKey, JSON.stringify(response.user));
        alert('Welcome ' + response.user.username);
      },
      error: function(err) {
        isSubmitting = false;
        $('#submit-btn').prop('disabled', false).text('Submit');
        $('#error-banner').text('Registration failed. Try again.').show();
      }
    });
  });
});`;

export default function CodeUploader({
  code,
  setCode,
  filename,
  setFilename,
  onAnalyze,
  isAnalyzing,
  error
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result || '');
    };
    reader.readAsText(file);
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

  const loadSample = () => {
    setFilename('legacy-modal-signup.js');
    setCode(SAMPLE_JQUERY_CODE);
  };

  // Calculate formatted file size
  const getFormattedSize = () => {
    if (!code) return '0 B';
    const bytes = new Blob([code]).size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
      {/* Step Flow Progress Bar */}
      <div className="mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">Pipeline Flow:</span>
          <span className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${code ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            1. Upload {code ? '✓' : ''}
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${isAnalyzing ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse' : 'bg-slate-800 text-slate-400 border border-slate-700/50'}`}>
            2. Analyze
          </span>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Upload Legacy jQuery File</h3>
            <p className="text-xs text-slate-400">Select `.js` file or paste raw jQuery source code</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadSample}
            type="button"
            className="text-xs bg-slate-800 hover:bg-slate-700/80 text-amber-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Browse JS File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.javascript,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Zone or Editor */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col relative rounded-xl transition-all ${
          dragActive ? 'border-2 border-dashed border-sky-400 bg-sky-950/20' : 'border border-slate-800 bg-slate-950/70'
        }`}
      >
        {/* Filename & File Size Indicator Bar */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-200 font-semibold flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${code ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>Filename: {filename || 'untitled-legacy.js'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
              Size: <strong className="text-sky-300 font-bold">{getFormattedSize()}</strong>
            </span>
            {code && (
              <span className="text-slate-400 hidden sm:inline">
                {code.split('\n').length} lines
              </span>
            )}
          </div>
        </div>

        {/* Code Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Drop a legacy .js file above, click 'Browse JS File', or paste code directly..."
          spellCheck={false}
          className="flex-1 w-full bg-transparent p-4 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500/50 leading-relaxed"
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Error</p>
            <p className="text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Target Engine: <strong className="text-slate-300 font-mono">AST & Pattern Extraction</strong>
        </span>

        <button
          onClick={onAnalyze}
          disabled={!code.trim() || isAnalyzing}
          className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Analyze Stage</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
