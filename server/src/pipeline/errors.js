/**
 * Standardized Error Model for Legacy Rescue Pipeline
 */
export class PipelineError extends Error {
  constructor(category, code, message, stage, retryable = false, details = null) {
    super(message);
    this.name = 'PipelineError';
    this.category = category; // UPLOAD_ERROR | DETECTION_ERROR | ANALYSIS_ERROR | etc.
    this.code = code;
    this.stage = stage;
    this.retryable = retryable;
    this.details = details;
  }

  toJSON() {
    return {
      stage: this.stage,
      code: this.code,
      category: this.category,
      message: this.message,
      retryable: this.retryable,
      details: this.details
    };
  }
}
