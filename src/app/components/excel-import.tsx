"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from "lucide-react";
import { toast } from "sonner";

interface ValidationResult {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    headers: string[];
    mapping: Record<string, string>;
    unmappedHeaders: string[];
    suggestedMapping: Record<string, string>;
    validation: {
      hasRequiredBookFields: boolean;
      hasRequiredPricingFields: boolean;
      missingBookFields: string[];
      missingPricingFields: string[];
      totalRows: number;
      mappedFields: {
        book: string[];
        pricing: string[];
      };
    };
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    stats: {
      total: number;
      inserted: number;
      updated: number;
      skipped: number;
      conflicts: number;
      duplicates: number;
      errors: number;
    };
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
      conflicts: number;
      duplicates: number;
      errors: number;
      skipped: number;
    };
    logFile: string;
    logFileUrl: string;
  };
}

interface ExcelImportProps {
  onImportComplete?: () => void;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ExcelImport({ onImportComplete }: ExcelImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'validation' | 'import'>('validation');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mappingConfirmed, setMappingConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available field mappings
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      validateFile(file);
    }
  };

  const validateFile = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch(`${API_URL}/api/books/validate-excel`, {
        method: 'POST',
        body: formData
      });

      const result: ValidationResult = await response.json();
      setValidationResult(result);

      if (result.success && result.data) {
        // Initialize custom mapping with auto-detected mapping
        setCustomMapping(result.data.mapping);
        console.log('Validation result:', result.data);
        console.log('Auto-mapping:', result.data.mapping);
        console.log('Has required book fields:', result.data.validation.hasRequiredBookFields);
        console.log('Has required pricing fields:', result.data.validation.hasRequiredPricingFields);
        toast.success('File validated successfully! Please review the mapping below.');
      } else {
        toast.error(result.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate file');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (excelHeader: string, fieldValue: string) => {
    // Ignore separator values
    if (fieldValue === 'book_separator' || fieldValue === 'pricing_separator') {
      return;
    }
    
    setCustomMapping(prev => ({
      ...prev,
      [excelHeader]: fieldValue === 'none' ? '' : fieldValue
    }));
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.data) return;

    // Debug: Check if mapping is empty
    console.log('Custom mapping:', customMapping);
    console.log('Mapping keys:', Object.keys(customMapping));
    
    if (Object.keys(customMapping).length === 0) {
      toast.error('Please map at least one column before importing');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      formData.append('mapping', JSON.stringify(customMapping));

      const response = await fetch(`${API_URL}/api/books/bulk-import`, {
        method: 'POST',
        body: formData
      });

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success) {
        setCurrentStep('import');
        console.log('Import result:', result);
        console.log('Log file URL:', result.data?.logFileUrl);
        
        // Simple success message
        toast.success(`Import completed! ${result.data?.stats.inserted} records added (new books + pricing), ${result.data?.stats.duplicates} duplicates skipped`);
        
        console.log('🔄 Calling onImportComplete callback...');
        onImportComplete?.();
        console.log('✅ onImportComplete callback called');
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setCurrentStep('validation');
    setSelectedFile(null);
    setValidationResult(null);
    setCustomMapping({});
    setImportResult(null);
    setMappingConfirmed(false);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadLogFile = () => {
    if (importResult?.data?.logFileUrl) {
      const link = document.createElement('a');
      link.href = importResult.data.logFileUrl;
      link.download = importResult.data.logFile;
      link.click();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel Import Wizard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            {[
              { key: 'validation', label: 'Validate & Map', icon: FileSpreadsheet },
              { key: 'import', label: 'Import', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = currentStep === 'import' && step.key === 'validation';
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Validation & Mapping */}
          {currentStep === 'validation' && (
            <div className="space-y-4">
              {!validationResult ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
                    <p className="text-gray-600 mb-4">
                      Select an Excel file (.xlsx or .xls) containing book and pricing data
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="mb-4"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Column Mapping</h3>
                    <Button onClick={resetImport} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Upload New File
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">File: {validationResult.data?.fileName}</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {validationResult.data?.validation.totalRows} rows found
                    </p>
                  </div>

                  {/* Validation Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${
                      validationResult.data?.validation.hasRequiredBookFields 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {validationResult.data?.validation.hasRequiredBookFields ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">Book Fields</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {validationResult.data?.validation.hasRequiredBookFields 
                          ? 'All required fields mapped' 
                          : `Missing: ${validationResult.data?.validation.missingBookFields.join(', ')}`
                        }
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      validationResult.data?.validation.hasRequiredPricingFields 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {validationResult.data?.validation.hasRequiredPricingFields ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">Pricing Fields</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {validationResult.data?.validation.hasRequiredPricingFields 
                          ? 'All required fields mapped' 
                          : `Missing: ${validationResult.data?.validation.missingPricingFields.join(', ')}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Column Mapping */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Map Excel Columns to Database Fields</h4>
                    {validationResult.data?.headers.map((header) => (
                      <div key={header} className="flex items-center gap-4">
                        <div className="w-48">
                          <Label className="text-sm font-medium">{header}</Label>
                        </div>
                        <div className="flex-1">
                          <Select
                            value={customMapping[header] || ''}
                            onValueChange={(value) => handleMappingChange(header, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-- Skip Column --</SelectItem>
                              <SelectItem value="book_separator" disabled>--- Book Fields ---</SelectItem>
                              {availableFields.book.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                              <SelectItem value="pricing_separator" disabled>--- Pricing Fields ---</SelectItem>
                              {availableFields.pricing.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mapping Suggestions */}
                  {validationResult.data?.unmappedHeaders && validationResult.data.unmappedHeaders.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Unmapped Columns</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        The following columns were not automatically mapped. Please map them manually or skip them:
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {validationResult.data?.unmappedHeaders.map((header) => (
                          <li key={header}>
                            <strong>{header}</strong>
                            {validationResult.data?.suggestedMapping[header] && (
                              <span> - Suggested: {validationResult.data.suggestedMapping[header]}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleImport} 
                      disabled={loading || !validationResult.data?.validation.hasRequiredBookFields}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Importing...' : 'Import Data'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Import Results */}
          {currentStep === 'import' && importResult?.data && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
                <p className="text-gray-600 mb-4">
                  Your Excel file has been processed successfully
                </p>
              </div>

              {/* Main Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">Import Summary</h4>
                  <p className="text-blue-700">Total books processed: <span className="font-semibold">{importResult.data.stats.total}</span></p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{importResult.data.stats.inserted}</div>
                      <div className="text-sm text-green-700 font-medium">Records Added</div>
                      <div className="text-xs text-green-600">(New books + New pricing)</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-yellow-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">{importResult.data.stats.duplicates}</div>
                      <div className="text-sm text-yellow-700 font-medium">Duplicates Skipped</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-red-100 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{importResult.data.stats.errors}</div>
                      <div className="text-sm text-red-700 font-medium">Errors</div>
                    </div>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-800"><strong>✅ Successfully Added:</strong> {importResult.data.stats.inserted} records (new books + new pricing)</p>
                      <p className="text-blue-800"><strong>⏭️ Skipped:</strong> {importResult.data.stats.duplicates} duplicates</p>
                    </div>
                    <div>
                      <p className="text-blue-800"><strong>❌ Errors:</strong> {importResult.data.stats.errors} records</p>
                      <p className="text-blue-800"><strong>📊 Total Processed:</strong> {importResult.data.stats.total} records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">📄 Detailed Log File</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      A detailed log file has been created with information about all processed records.
                    </p>
                    <p className="text-xs text-blue-600">
                      File: {importResult.data.logFile}
                    </p>
                    {importResult.data.logFileUrl && (
                      <p className="text-xs text-blue-600">
                        URL: {importResult.data.logFileUrl}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={downloadLogFile}
                    variant="outline" 
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Log
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={resetImport} variant="outline">
                  Import Another File
                </Button>
                <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-700">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {currentStep === 'validation' ? 'Validating file...' : 'Processing import...'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
