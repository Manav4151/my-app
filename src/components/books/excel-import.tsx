"use client";

import { useState, useRef, useMemo } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Loader2 } from "lucide-react";
import TemplateSelector from "./template-selector";
import SaveTemplateDialog from "./save-template-dialog";

import { ImportTemplate, TemplateMatchResult } from "@/types/template";
import { apiFunctions } from "@/services/api.service";

// --- TYPE DEFINITIONS ---
interface ValidationResult {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    headers: string[];
    mapping: Record<string, string>;
    unmappedHeaders: string[];
    suggestedMapping?: Record<string, string>;
    templateMatch?: boolean;
    templateMatchDetails?: TemplateMatchResult;
    validation: {
      totalRows: number;
    };
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    stats: {
      totalRows?: number;
      processed?: number;
      booksAdded?: number;
      pricesAdded?: number;
      pricesUpdated?: number;
      skippedAsDuplicate?: number;
      skippedAsConflict?: number;
      errors?: number;
      // Backward-compat fields
      total?: number;
      inserted?: number;
      updated?: number;
      skipped?: number;
      conflicts?: number;
      duplicates?: number;
    };
    logFile?: string;
    logFileUrl?: string;
  };
}

interface ExcelImportProps {
  onImportComplete?: () => void;
}

// --- CONSTANTS ---
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];
const REQUIRED_BOOK_FIELDS = ['title', 'author'];
const REQUIRED_PRICING_FIELDS = ['rate'];

type WizardStep = 'initial' | 'validating' | 'mapping' | 'importing' | 'complete' | 'review' | 'no-match';
type ImportStats = NonNullable<ImportResult['data']>['stats'];

// --- MAIN COMPONENT ---
export default function ExcelImport({ onImportComplete }: ExcelImportProps) {
  // --- STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>('initial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template-related state
  const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplate | null>(null);
  const [templateMatchResult, setTemplateMatchResult] = useState<TemplateMatchResult | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  // --- DERIVED STATE & MEMOS ---
  const validationData = useMemo(() => validationResult?.data, [validationResult]);
  const importStats = useMemo(() => importResult?.data?.stats, [importResult]);

  const hasRequiredFields = useMemo(() => {
    const mappedValues = new Set(Object.values(customMapping));
    const hasBookFields = REQUIRED_BOOK_FIELDS.every(field => mappedValues.has(field));
    const hasPricingFields = REQUIRED_PRICING_FIELDS.every(field => mappedValues.has(field));
    const missingBookFields = REQUIRED_BOOK_FIELDS.filter(field => !mappedValues.has(field));
    const missingPricingFields = REQUIRED_PRICING_FIELDS.filter(field => !mappedValues.has(field));

    return {
      book: hasBookFields,
      pricing: hasPricingFields,
      missingBook: missingBookFields,
      missingPricing: missingPricingFields,
    };
  }, [customMapping]);

  const isImportDisabled = step === 'importing' || !hasRequiredFields.book || !hasRequiredFields.pricing;

  // --- STATIC DATA ---
  const availableFields = {
    book: [
      { value: 'title', label: 'Title (Required)' },
      { value: 'author', label: 'Author (Required)' },
      { value: 'isbn', label: 'ISBN' },
      { value: 'nonisbn', label: 'Non-ISBN' },
      { value: 'other_code', label: 'Other Code' },
      { value: 'edition', label: 'Edition' },
      { value: 'year', label: 'Year' },
      { value: 'publisher_name', label: 'Publisher' },
      { value: 'binding_type', label: 'Binding Type' },
      { value: 'classification', label: 'Classification' },
      { value: 'remarks', label: 'Remarks' }
    ],
    pricing: [
      { value: 'rate', label: 'Price/Rate (Required)' },
      { value: 'currency', label: 'Currency (Required)' },
      { value: 'discount', label: 'Discount' },
      { value: 'source', label: 'Source' }
    ]
  };

  // --- CORE LOGIC & HANDLERS ---
  const resetWizard = () => {
    setStep('initial');
    setSelectedFile(null);
    setValidationResult(null);
    setCustomMapping({});
    setImportResult(null);
    setSelectedTemplate(null);
    setTemplateMatchResult(null);
    setShowTemplateSelector(false);
    setShowSaveTemplateDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetWizard();
    }
    setIsOpen(open);
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);
    validateFile(file);
  };

  const validateFile = async (file: File) => {
    setStep('validating');
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      // Add template ID if template is selected
      if (selectedTemplate) {
        formData.append('templateId', selectedTemplate._id);
      }

      const response = await apiFunctions.validateExcel(formData);

      const result: ValidationResult = response

      if (result.success && result.data) {
        setValidationResult(result);

        if (selectedTemplate && result.data.templateMatch) {
          // Perfect template match
          setCustomMapping(result.data.mapping);
          setTemplateMatchResult(result.data.templateMatchDetails || null);
          setStep('review');
        } else if (selectedTemplate && result.data.templateMatchDetails) {
          // Template not compatible
          setTemplateMatchResult(result.data.templateMatchDetails);
          setStep('no-match');
        } else {
          // Manual mapping required
          setCustomMapping(result.data.mapping || {});
          setStep('mapping');
        }
      } else {
        throw new Error(result.message || 'Validation failed on the server.');
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to validate file.');
      resetWizard();
    }
  };

  const handleMappingChange = (excelHeader: string, fieldValue: string) => {
    if (['book_separator', 'pricing_separator'].includes(fieldValue)) return;
    setCustomMapping(prev => ({
      ...prev,
      [excelHeader]: fieldValue === 'none' ? '' : fieldValue
    }));
  };

  const handleImport = async () => {
    if (!selectedFile || !validationData) return;

    setStep('importing');
    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      formData.append('mapping', JSON.stringify(customMapping));

      const response = await apiFunctions.importExcel(formData);

      if (!response.success) {
        throw new Error(response.message);
      }

      const result: ImportResult = response;

      if (result.success && result.data) {
        setImportResult(result);
        setStep('complete');
        setIsOpen(false); // Close main wizard
        setResultDialogOpen(true); // Open result dialog
        // onImportComplete?.(); // <-- PROBLEM: This was called too early
      } else {
        throw new Error(result.message || 'Import failed on the server.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(error instanceof Error ? error.message : 'Failed to import file.');
      setStep('mapping');
    }
  };

  const handleCloseSuccessDialog = () => {
    setResultDialogOpen(false);
    onImportComplete?.(); // <-- SOLUTION: Call this after the dialog is closed
  };

  const downloadFile = (url: string, defaultFilename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLogFile = () => {
    if (importResult?.data?.logFileUrl) {
      downloadFile(importResult.data.logFileUrl, importResult.data.logFile || 'import-log.json');
    }
  };

  const downloadSampleTemplate = () => {
    downloadFile(`/sample-books-template.xlsx`, 'sample-books-template.xlsx');
  };

  // Template-related handlers
  const handleTemplateSelect = (template: ImportTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  const handleSaveTemplate = () => {
    if (validationData) {
      setShowSaveTemplateDialog(true);
    }
  };

  const handleTemplateSaved = () => {
    alert('Template saved successfully!');
  };

  // --- RENDER METHODS FOR EACH STEP ---
  const renderInitialStep = () => (
    <div className="text-center">
      <Upload className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Upload Excel File</h3>
      <p className="text-[var(--text-secondary)] mb-4">Select an Excel file (.xlsx or .xls) to import your book data.</p>

      {/* Template Selection Buttons */}
      <div className="flex gap-2 justify-center mb-4">
        <Button
          onClick={() => setShowTemplateSelector(true)}
          variant="outline"
          className="bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Load Template
        </Button>
      </div>

      {selectedTemplate && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-[var(--primary)]">
            <strong>Selected Template:</strong> {selectedTemplate.name}
          </p>
          <Button
            onClick={() => setSelectedTemplate(null)}
            variant="ghost"
            size="sm"
            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            Clear Template
          </Button>
        </div>
      )}

      <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8">
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mb-4">
          <Upload className="w-4 h-4 mr-2" /> Choose File
        </Button>
        <p className="text-sm text-[var(--text-secondary)]">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
        <div className="mt-3">
          <Button onClick={downloadSampleTemplate} variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-dark)]">
            <Download className="w-4 h-4 mr-2" /> Download Sample Template
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLoadingStep = (message: string) => (
    <div className="text-center py-8 flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="animate-spin text-[var(--primary)] h-10 w-10 mb-4" />
      <p className="text-[var(--text-secondary)] font-medium text-lg">{message}</p>
    </div>
  );

  const renderMappingStep = () => {
    if (!validationData) return renderLoadingStep('Preparing mapping...');

    const { headers, validation, unmappedHeaders, suggestedMapping } = validationData;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Column Mapping</h3>
          <Button onClick={resetWizard} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" /> Upload New File
          </Button>
        </div>

        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-4">
          <p className="font-medium text-[var(--primary)]">File: {validationData.fileName}</p>
          <p className="text-sm text-[var(--text-secondary)]">{validation.totalRows} data rows found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidationStatusCard
            title="Book Fields"
            isValid={hasRequiredFields.book}
            missingFields={hasRequiredFields.missingBook}
          />
          <ValidationStatusCard
            title="Pricing Fields"
            isValid={hasRequiredFields.pricing}
            missingFields={hasRequiredFields.missingPricing}
          />
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="font-medium text-[var(--text-primary)]">Map Excel Columns to Database Fields</h4>
          {(headers || []).map((header) => (
            <div key={header} className="grid grid-cols-[200px,1fr] items-center gap-4">
              <Label className="text-sm font-medium truncate text-[var(--text-primary)]" title={header}>{header}</Label>
              <Select value={customMapping[header] || ''} onValueChange={(value) => handleMappingChange(header, value)}>
                <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
                  <SelectItem value="none">-- Skip Column --</SelectItem>
                  <SelectItem value="book_separator" disabled>--- Book Fields ---</SelectItem>
                  {availableFields.book.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  <SelectItem value="pricing_separator" disabled>--- Pricing Fields ---</SelectItem>
                  {availableFields.pricing.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {unmappedHeaders && unmappedHeaders.length > 0 && (
          <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-4">
            <h4 className="font-medium text-[var(--warning)] mb-2">Unmapped Columns</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-2">Please map or skip the following columns:</p>
            <ul className="text-sm text-[var(--text-secondary)] list-disc list-inside">
              {unmappedHeaders.map(header => (
                <li key={header}>
                  <strong>{header}</strong>
                  {suggestedMapping?.[header] && (
                    <span> - Suggested: {suggestedMapping[header]}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-4">
          <Button
            onClick={handleSaveTemplate}
            variant="outline"
            className="text-[var(--success)] hover:text-[var(--success)]/80"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Save as Template
          </Button>
          <Button onClick={handleImport} disabled={isImportDisabled} className="bg-[var(--success)] hover:bg-[var(--success)]/90">
            {step === 'importing'
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              : 'Confirm Mapping & Import Data'
            }
          </Button>
        </div>
      </div>
    );
  };

  // Template-related render methods
  const renderPerfectMatch = () => (
    <div className="space-y-4">
      <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
          <h3 className="font-semibold text-[var(--success)]">Template Applied Successfully!</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          All columns matched perfectly. Ready to import.
        </p>
      </div>

      <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-4">
        <h4 className="font-medium text-[var(--primary)] mb-2">Mapped Columns:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(selectedTemplate?.mapping || {}).map(([excelHeader, dbField]) => (
            <div key={excelHeader} className="flex justify-between">
              <span className="text-[var(--text-primary)]">{excelHeader}</span>
              <span className="text-[var(--primary)] font-medium">{dbField}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button onClick={handleImport} className="bg-[var(--success)] hover:bg-[var(--success)]/90">
          Import Data Now
        </Button>
        <Button variant="outline" onClick={() => setStep('mapping')}>
          Edit Mapping
        </Button>
      </div>
    </div>
  );

  const renderNoMatch = () => (
    <div className="space-y-4">
      <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
          <h3 className="font-semibold text-[var(--warning)]">Template Not Compatible</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          File headers do not match template exactly. Manual mapping required.
        </p>
      </div>

      {templateMatchResult?.missingHeaders && templateMatchResult.missingHeaders.length > 0 && (
        <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg p-4">
          <h4 className="font-medium text-[var(--error)] mb-2">Missing Headers:</h4>
          <ul className="text-sm text-[var(--text-secondary)] list-disc list-inside">
            {templateMatchResult.missingHeaders.map(header => (
              <li key={header}>{header}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={() => setStep('mapping')} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
          Go to Manual Mapping
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-white">
            <Upload className="w-4 h-4 mr-2" /> Import Excel
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Excel Import Wizard</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            {step === 'initial' && renderInitialStep()}
            {step === 'validating' && renderLoadingStep('Validating your file...')}
            {step === 'mapping' && renderMappingStep()}
            {step === 'review' && renderPerfectMatch()}
            {step === 'no-match' && renderNoMatch()}
            {step === 'importing' && renderLoadingStep('Importing your data... Please wait.')}
          </div>
        </DialogContent>
      </Dialog>

      {importStats && (
        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold text-[var(--text-primary)] mb-2">Import Successful!</DialogTitle>
                <p className="text-[var(--text-secondary)]">Your Excel data has been processed.</p>
              </div>
            </DialogHeader>
            <div className="p-8 bg-[var(--surface)]">
              <ResultStats stats={importStats} />
            </div>
            <DialogFooter className="px-8 py-6 bg-[var(--surface-hover)] border-t border-[var(--border)] flex justify-between items-center">
              {importResult?.data?.logFileUrl && (
                <Button variant="outline" onClick={downloadLogFile}><Download className="w-4 h-4 mr-2" /> Download Log</Button>
              )}
              <Button onClick={handleCloseSuccessDialog} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)]">OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Components */}
      {showTemplateSelector && (
        <TemplateSelector
          onTemplateSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {showSaveTemplateDialog && (
        <SaveTemplateDialog
          isOpen={showSaveTemplateDialog}
          onClose={() => setShowSaveTemplateDialog(false)}
          mapping={customMapping}
          expectedHeaders={validationData?.headers || []}
          onTemplateSaved={handleTemplateSaved}
        />
      )}
    </>
  );
}

// --- HELPER SUB-COMPONENTS ---

const ValidationStatusCard = ({ title, isValid, missingFields }: {
  title: string;
  isValid: boolean;
  missingFields: string[];
}) => (
  <div className={`p-3 rounded-lg border ${isValid ? 'bg-[var(--success)]/10 border-[var(--success)]/20' : 'bg-[var(--error)]/10 border-[var(--error)]/20'}`}>
    <div className="flex items-center gap-2">
      {isValid ? <CheckCircle className="w-4 h-4 text-[var(--success)]" /> : <AlertCircle className="w-4 h-4 text-[var(--error)]" />}
      <span className="font-medium text-[var(--text-primary)]">{title}</span>
    </div>
    <p className="text-sm text-[var(--text-secondary)] mt-1">
      {isValid ? 'All required fields mapped' : `Missing: ${missingFields.join(', ')}`}
    </p>
  </div>
);

const ResultStats = ({ stats }: { stats: ImportStats }) => {
  const total = stats.totalRows ?? stats.total ?? 0;
  const booksAdded = stats.booksAdded ?? (stats.inserted ?? 0);
  const pricesAdded = stats.pricesAdded ?? 0;
  const pricesUpdated = stats.pricesUpdated ?? (stats.updated ?? 0);
  const duplicates = stats.skippedAsDuplicate ?? stats.duplicates ?? 0;
  const conflicts = stats.skippedAsConflict ?? stats.conflicts ?? 0;
  const errors = stats.errors ?? 0;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-3">Import Summary</h3>
      <div className="space-y-2">
        <StatRow label="Total rows in file" value={total} />
        <StatRow label="New books inserted" value={booksAdded} color="green" />
        <StatRow label="Prices added" value={pricesAdded} color="green" />
        <StatRow label="Records updated" value={pricesUpdated} color="blue" />
        {conflicts > 0 && <StatRow label="Skipped (Conflicts)" value={conflicts} color="orange" />}
        {duplicates > 0 && <StatRow label="Skipped (Duplicates)" value={duplicates} color="yellow" />}
        {errors > 0 && <StatRow label="Rows with errors" value={errors} color="red" />}
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) => {
  const colorClasses: { [key: string]: string } = {
    gray: 'text-[var(--text-primary)]',
    green: 'text-[var(--success)]',
    blue: 'text-[var(--primary)]',
    yellow: 'text-[var(--warning)]',
    orange: 'text-[var(--warning)]',
    red: 'text-[var(--error)]',
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={`font-semibold ${colorClasses[color]}`}>{value}</span>
    </div>
  );
};