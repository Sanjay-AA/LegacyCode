import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle, Sparkles, Play, ArrowRight } from 'lucide-react';

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
  onUpload,
  isProcessing = false,
  error = null
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [customFilename, setCustomFilename] = useState('legacy-component.js');

  const handleFile = (file) => {
    if (!file) return;
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const codeContent = e.target.result || '';
      if (codeContent.trim() && onUpload) {
        onUpload(codeContent, filename);
      }
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

  const handleLoadSample = () => {
    if (onUpload) {
      onUpload(SAMPLE_JQUERY_CODE, 'legacy-signup.js');
    }
  };

  const handleStartPasted = () => {
    if (pastedCode.trim() && onUpload) {
      onUpload(pastedCode, customFilename || 'legacy-component.js');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col h-full max-w-4xl mx-auto shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Upload Legacy jQuery Component</h3>
            <p className="text-xs text-slate-400">
              Uploading a file automatically triggers the 5-stage modernization pipeline.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSample}
          type="button"
          disabled={isProcessing}
          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold px-3.5 py-2 rounded-xl border border-amber-500/20 transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample jQuery Component</span>
        </button>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-6 ${
          dragActive
            ? 'border-sky-400 bg-sky-950/30'
            : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950/90'
        }`}
      >
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-3">
          <FileCode className="w-8 h-8" />
        </div>

        <h4 className="text-sm font-semibold text-slate-200 mb-1">
          Drag & Drop your `.js` jQuery file here
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Select a legacy JavaScript file to begin autonomous migration.
        </p>

        <button
          type="button"
          disabled={isProcessing}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Browse File</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.javascript,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Alternative Paste Code Section */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Or Paste Legacy jQuery Code Directly:
          </label>
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            placeholder="Filename (e.g. counter.js)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

        <textarea
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          placeholder="// Paste legacy jQuery code here..."
          rows={5}
          spellCheck={false}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-sky-500/50"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleStartPasted}
            disabled={!pastedCode.trim() || isProcessing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-md"
          >
            <span>Start Autonomous Migration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Message if Any */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
