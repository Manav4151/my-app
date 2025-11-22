"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import { apiFunctions } from "@/services/api.service";

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: Record<string, string>;
  expectedHeaders: string[];
  onTemplateSaved: () => void;
}

export default function SaveTemplateDialog({
  isOpen,
  onClose,
  mapping,
  expectedHeaders,
  onTemplateSaved
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);
      const response = await apiFunctions.createTemplate({
        name: name.trim(),
        description: description.trim(),
        mapping,
        expectedHeaders
      });

      if (response.success) {
        onTemplateSaved();
        onClose();
        // Reset form
        setName("");
        setDescription("");
      } else {
        alert(response.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Save Current Mapping as Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Book Import"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
              disabled={saving}
            />
          </div>

          {/* Mapping Preview */}
          <div className="bg-[var(--surface-hover)] rounded-lg p-4">
            <h4 className="font-medium mb-2 text-[var(--text-primary)]">Mapping Preview:</h4>
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {Object.entries(mapping).map(([excelHeader, dbField]) => (
                <div key={excelHeader} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[var(--success)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)] truncate">{excelHeader}</span>
                  <span className="text-[var(--text-secondary)]">→</span>
                  <span className="text-[var(--primary)] font-medium">{dbField}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || saving}
            className="bg-[var(--success)] hover:bg-[var(--success)]/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

