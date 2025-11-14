// "use client";

// import { useState } from "react";
// import { Send, Paperclip, X, FileText } from "lucide-react";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Textarea } from "../ui/textarea";
// import { Label } from "../ui/label";
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
// interface ComposeEmailProps {
//   onClose: () => void;
//   onEmailSent?: () => void;
// }

// export default function ComposeEmail({ onClose, onEmailSent }: ComposeEmailProps) {
//   const [formData, setFormData] = useState({
//     to: '',
//     subject: '',
//     text: '',
//     html: ''
//   });
//   const [attachment, setAttachment] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAttachment(file);
//     }
//   };

//   const removeAttachment = () => {
//     setAttachment(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.to || !formData.subject || !formData.text) {
//       setError('To, Subject, and Text are required');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const formDataToSend = new FormData();
//       formDataToSend.append('to', formData.to);
//       formDataToSend.append('subject', formData.subject);
//       formDataToSend.append('text', formData.text);
//       formDataToSend.append('html', formData.html);

//       if (attachment) {
//         formDataToSend.append('attachment', attachment);
//       }

//       const response = await fetch(`${API_URL}/api/emails/send`, {
//         method: 'POST',
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to send email');
//       }

//       // Reset form
//       setFormData({ to: '', subject: '', text: '', html: '' });
//       setAttachment(null);

//       if (onEmailSent) {
//         onEmailSent();
//       }

//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//       console.error('Error sending email:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
//           <h2 className="text-lg font-semibold text-gray-900">Compose Email</h2>
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             onClick={onClose}
//             className="w-8 h-8 p-0"
//           >
//             <X className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             <div>
//               <Label htmlFor="to" className="text-sm font-medium text-gray-700">To</Label>
//               <Input
//                 id="to"
//                 name="to"
//                 type="email"
//                 value={formData.to}
//                 onChange={handleInputChange}
//                 placeholder="recipient@example.com"
//                 required
//                 className="mt-1 h-10"
//               />
//             </div>

//             <div>
//               <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
//               <Input
//                 id="subject"
//                 name="subject"
//                 value={formData.subject}
//                 onChange={handleInputChange}
//                 placeholder="Email subject"
//                 required
//                 className="mt-1 h-10"
//               />
//             </div>

//             <div>
//               <Label htmlFor="text" className="text-sm font-medium text-gray-700">Message</Label>
//               <Textarea
//                 id="text"
//                 name="text"
//                 value={formData.text}
//                 onChange={handleInputChange}
//                 placeholder="Type your message here..."
//                 rows={6}
//                 required
//                 className="mt-1 resize-none"
//               />
//             </div>

//             <div>
//               <Label htmlFor="html" className="text-sm font-medium text-gray-700">HTML Content (Optional)</Label>
//               <Textarea
//                 id="html"
//                 name="html"
//                 value={formData.html}
//                 onChange={handleInputChange}
//                 placeholder="HTML content (optional)"
//                 rows={3}
//                 className="mt-1 resize-none"
//               />
//             </div>

//             {/* File Upload */}
//             <div>
//               <Label htmlFor="attachment" className="text-sm font-medium text-gray-700">Attachment (Optional)</Label>
//               <div className="mt-1">
//                 {!attachment ? (
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="file"
//                       id="attachment"
//                       onChange={handleFileChange}
//                       className="hidden"
//                     />
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => document.getElementById('attachment')?.click()}
//                       className="h-8 px-3 text-xs"
//                     >
//                       <Paperclip className="w-3 h-3 mr-1" />
//                       Attach File
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
//                     <div className="flex items-center gap-2">
//                       <FileText className="w-4 h-4 text-gray-500" />
//                       <div>
//                         <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
//                         <p className="text-xs text-gray-500">
//                           {(attachment.size / 1024).toFixed(1)} KB
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={removeAttachment}
//                       className="w-6 h-6 p-0"
//                     >
//                       <X className="w-3 h-3 text-red-500" />
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="border-t border-gray-200 p-4 bg-gray-50">
//             <div className="flex items-center justify-end gap-3">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={onClose}
//                 size="sm"
//                 className="h-8 px-4 border-amber-300 text-amber-700 hover:bg-amber-50"
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 type="submit" 
//                 disabled={loading}
//                 size="sm"
//                 className="h-8 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
//               >
//                 {loading ? (
//                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
//                 ) : (
//                   <Send className="w-3 h-3 mr-1" />
//                 )}
//                 {loading ? 'Sending...' : 'Send'}
//               </Button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { Send, Paperclip, X, FileText, Frown, Minus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { apiFunctions } from "@/services/api.service";

interface ComposeEmailProps {
  onClose: () => void;
  onEmailSent?: () => void;
}

export default function ComposeEmail({ onClose, onEmailSent }: ComposeEmailProps) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should not exceed 5MB.");
        return;
      }
      setAttachment(file);
      setError(null);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to || !formData.subject || !formData.text) {
      setError('To, Subject, and Message are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('to', formData.to);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('text', formData.text);
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      const response = await apiFunctions.sendEmail(formDataToSend);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send email.');
      }

      if (onEmailSent) onEmailSent();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 z-50 w-full max-w-lg">
      <div className="bg-[var(--surface)] rounded-t-lg shadow-2xl border border-[var(--border)] flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-[var(--border)] cursor-pointer bg-[var(--surface-hover)] rounded-t-lg"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <h2 className="text-sm font-bold text-[var(--text-primary)]">New Message</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
              <Minus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form Body - Collapsible */}
        {!isMinimized && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" style={{ height: '450px' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {error && (
                <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg p-2 flex items-center gap-2">
                  <Frown className="w-4 h-4 text-[var(--error)]" />
                  <p className="text-xs font-medium text-[var(--error)]">{error}</p>
                </div>
              )}
              <Input
                name="to"
                type="email"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="To"
                required
                className="h-9 border-0 border-b rounded-none focus-visible:ring-0 focus:border-[var(--primary)] px-0 bg-transparent"
              />
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Subject"
                required
                className="h-9 border-0 border-b rounded-none focus-visible:ring-0 focus:border-[var(--primary)] px-0 bg-transparent"
              />
              <Textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Message..."
                required
                className="flex-1 border-none focus-visible:ring-0 resize-none p-0 text-sm bg-transparent h-50"
              />
              {attachment && (
                <div className="flex items-center justify-between p-2 bg-[var(--surface-hover)] rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-primary)]">{attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={removeAttachment} className="w-5 h-5 text-[var(--error)] rounded-full hover:bg-[var(--error)]/10">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] p-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={loading} className="px-5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold h-8">
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {loading ? 'Sending' : 'Send'}
                  </Button>
                  <input type="file" id="attachment-file" onChange={handleFileChange} className="hidden" />
                  <Button type="button" variant="ghost" onClick={() => document.getElementById('attachment-file')?.click()} className="text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] h-8 px-3">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}