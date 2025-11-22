import {
    BookOpen, Calendar, Building, Hash, Tag, Info,
    Edit, Plus, TrendingUp, TrendingDown, Minus, ShoppingCart, User, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- HELPER FUNCTIONS ---
const formatPrice = (rate: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(rate);

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const getPriceTrend = (rate: number, avg: number) => {
    if (rate > avg) return { icon: TrendingUp, color: "text-[var(--error)]", label: "Above Avg" };
    if (rate < avg) return { icon: TrendingDown, color: "text-[var(--success)]", label: "Below Avg" };
    return { icon: Minus, color: "text-[var(--text-secondary)]", label: "Average" };
};

// Clean Color Maps
const BINDING_COLORS: Record<string, string> = {
    'Hardcover': 'bg-[var(--primary)]/10 text-[var(--primary)]',
    'Paperback': 'bg-[var(--success)]/10 text-[var(--success)]',
    'Ebook': 'bg-[var(--secondary)]/10 text-[var(--secondary)]',
    'Audiobook': 'bg-[var(--warning)]/10 text-[var(--warning)]'
};

const CLASS_COLORS: Record<string, string> = {
    'Fantasy': 'bg-[var(--secondary)]/10 text-[var(--secondary)]',
    'Non-Fiction': 'bg-[var(--success)]/10 text-[var(--success)]',
    'Mystery': 'bg-[var(--error)]/10 text-[var(--error)]',
    // Default fallback handles others
};

interface BookDetailViewProps {
    data: any;
    lastPurchaseData: any;
    onEdit: () => void;
    onMarkOutOfPrint: () => void;
    onAddPrice: () => void;
    onInsertNew: () => void;
}

export function BookDetailView({
    data, lastPurchaseData, onEdit, onMarkOutOfPrint, onAddPrice, onInsertNew
}: BookDetailViewProps) {
    const { book, pricing, statistics } = data;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Book Details</h1>
                    <p className="text-[var(--text-secondary)]">Complete book information and pricing</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={onEdit} className="bg-[var(--primary)] text-white"><Edit className="w-4 h-4 mr-2" /> Edit Book</Button>
                    <Button onClick={onMarkOutOfPrint} variant="outline" className="border-[var(--border)]"><Edit className="w-4 h-4 mr-2" /> Out of Print</Button>
                    <Button onClick={onInsertNew} variant="secondary"><Plus className="w-4 h-4 mr-2" /> Add New</Button>
                </div>
            </div>

            {/* --- BOOK INFO CARD --- */}
            <section className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{book.title}</h1>
                        <p className="text-lg text-[var(--text-secondary)] mt-1">by {book.author}</p>
                    </div>

                    {/* BADGES SECTION */}
                    <div className="flex gap-2">
                        {/* Binding Type always displays if present */}
                        {book.binding_type && (
                            <Badge className={`border ${BINDING_COLORS[book.binding_type] || 'bg-gray-100 text-gray-600'}`}>
                                {book.binding_type}
                            </Badge>
                        )}

                        {/* CONDITIONAL: Classification - Only renders if exists */}
                        {book.classification && (
                            <Badge className={`border ${CLASS_COLORS[book.classification] || 'bg-gray-100 text-gray-600'}`}>
                                {book.classification}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 border-t border-[var(--border)] py-6">
                    <InfoItem icon={Calendar} label="Year" value={book.year} />
                    <InfoItem icon={Building} label="Publisher" value={book.publisher_name} />
                    {book.isbn && <InfoItem icon={Hash} label="ISBN" value={book.isbn} />}
                    {book.edition && <InfoItem icon={Tag} label="Edition" value={book.edition} />}
                </div>

                {book.remarks && (
                    <div className="pt-6 border-t border-[var(--border)]">
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Remarks</p>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{book.remarks}</p>
                    </div>
                )}

                {/* PRICING ANALYSIS */}
                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Pricing Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Overview Card */}
                        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                            <h3 className="font-semibold mb-4">Overview</h3>
                            <div className="space-y-3 text-sm">
                                <Row label="Total Sources" value={statistics.totalSources} />
                                <Row label="Average Price" value={formatPrice(statistics.averageRate, pricing[0]?.currency || 'USD')} />
                                <Row label="Range" value={`${formatPrice(statistics.minRate, 'USD')} - ${formatPrice(statistics.maxRate, 'USD')}`} />
                            </div>
                        </div>

                        {/* Source List */}
                        <div className="space-y-3">
                            {pricing.length > 0 ? pricing.map((p: any) => {
                                const trend = getPriceTrend(p.rate, statistics.averageRate);
                                return (
                                    <div key={p._id} className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{p.source}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{formatDate(p.last_updated)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatPrice(p.rate, p.currency)}</p>
                                            <div className={`flex items-center justify-end gap-1 text-xs ${trend.color}`}>
                                                <trend.icon className="w-3 h-3" /> {trend.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center p-6 border border-dashed rounded-xl">
                                    <p className="text-sm text-[var(--text-secondary)] mb-3">No pricing yet.</p>
                                    <Button size="sm" onClick={onAddPrice}><Plus className="w-3 h-3 mr-2" /> Add Price</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- LAST PURCHASE SECTION --- */}
            <section className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-6 md:p-8">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[var(--primary)]" />
                    Last Purchase Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <InfoItem icon={Calendar} label="Purchase Date" value={formatDate(lastPurchaseData.date)} />
                    <InfoItem icon={User} label="Customer" value={lastPurchaseData.customer} />
                    <InfoItem icon={Tag} label="Edition" value={lastPurchaseData.edition} />
                    <InfoItem icon={DollarSign} label="Price" value={formatPrice(lastPurchaseData.price, lastPurchaseData.currency)} />
                </div>
            </section>

        </div>
    );
}

// Micro-components for cleaner JSX
const InfoItem = ({ icon: Icon, label, value }: any) => (
    <div>
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mb-1"><Icon className="w-4 h-4" /> {label}</p>
        <p className="font-medium text-[var(--text-primary)]">{value}</p>
    </div>
);

const Row = ({ label, value }: any) => (
    <div className="flex justify-between"><span className="text-[var(--text-secondary)]">{label}</span><span className="font-medium">{value}</span></div>
);