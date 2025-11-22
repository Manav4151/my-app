import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BookFilters } from "@/types/books";

interface BookFiltersProps {
  show: boolean;
  onToggle: () => void;
  filters: BookFilters;
  setFilters: (f: BookFilters | ((prev: BookFilters) => BookFilters)) => void;
  onApply: () => void;
  onClear: () => void;
}

export function BookFilterBar({ show, onToggle, filters, setFilters, onApply, onClear }: BookFiltersProps) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Filters</h2>
        <Button onClick={onToggle} variant="outline" size="sm">
          {show ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {show && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterInput label="Title" val={filters.title} onChange={(v: any) => setFilters(p => ({...p, title: v}))} />
            <FilterInput label="ISBN" val={filters.isbn} onChange={(v: any) => setFilters(p => ({...p, isbn: v}))} />
            <FilterInput label="Author" val={filters.author} onChange={(v: any) => setFilters(p => ({...p, author: v}))} />
            <FilterInput label="Publisher" val={filters.publisher_name} onChange={(v: any) => setFilters(p => ({...p, publisher_name: v}))} />
            <FilterInput label="Year" val={filters.year} onChange={(v: any) => setFilters(p => ({...p, year: v}))} />
            
            <div>
              <Label className="font-medium">Classification</Label>
              <Select value={filters.classification || ''} onValueChange={(v) => setFilters(p => ({ ...p, classification: v === 'all' ? undefined : v }))}>
                <SelectTrigger className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['all', 'Fantasy', 'Classic Literature', 'Science Fiction', 'Mystery', 'Non-Fiction'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={onApply} className="bg-[var(--primary)]">Apply Filters</Button>
            <Button onClick={onClear} variant="outline">Clear</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterInput = ({ label, val, onChange }: any) => (
  <div>
    <Label className="font-medium">{label}</Label>
    <Input placeholder={`Search ${label}...`} value={val || ''} onChange={(e) => onChange(e.target.value)} className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl" />
  </div>
);