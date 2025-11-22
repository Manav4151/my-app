"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { FileSpreadsheet, Plus, Search, Clock, User, Loader2 } from "lucide-react";
import { ImportTemplate } from "@/types/template";
import { apiFunctions } from "@/services/api.service";

interface TemplateSelectorProps {
  onTemplateSelect: (template: ImportTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onTemplateSelect, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log('Loading templates...');
      const response = await apiFunctions.getTemplates();
      console.log('Template API response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('Templates loaded successfully:', response.data);
        setTemplates(response.data);
      } else {
        console.error('API returned error or invalid data:', response.message);
        // Ensure templates is always an array
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Ensure templates is always an array even on error
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = Array.isArray(templates) ? templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.userId.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Select Import Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search templates by name, description, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Templates List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                {searchTerm ? 'No templates match your search' : 'No templates found'}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template._id}
                  className="border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--text-primary)]">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.userId}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" />
                          {template.expectedHeaders?.length || 0} columns
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Used {template.usageCount} times
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">
                      Use Template
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
