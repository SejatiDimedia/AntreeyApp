import React, { useEffect, useState } from 'react';
import { BookingRepository } from '../../repositories/BookingRepository';
import { useAuth } from '../../context/AuthContext';
import { formatQueueNumber } from '../../utils/queueNumber';
import { toast } from 'sonner';
import { BusinessRepository } from '../../repositories/BusinessRepository';
import { BookingStatusTimeline } from '../../components/booking/BookingStatusTimeline';

export const MyBookingsPage = ({ businessId, onBack, onOpenTicket, queueConfig = {} }) => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proofNote, setProofNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  useEffect(() => {
    if (!businessId || !currentUser?.uid) return;
    const unsubscribe = BookingRepository.subscribeToCustomerBookings(
      businessId,
      currentUser.uid,
      setBookings
    );
    return () => unsubscribe();
  }, [businessId, currentUser?.uid]);

  useEffect(() => {
    async function loadPaymentMethods() {
      if (!businessId) {
        setPaymentMethods([]);
        return;
      }
      try {
        const business = await BusinessRepository.getBusiness(businessId);
        setPaymentMethods(Array.isArray(business?.paymentMethods) ? business.paymentMethods : []);
      } catch (error) {
        setPaymentMethods([]);
      }
    }
    loadPaymentMethods();
  }, [businessId]);

  const renderStatusBadge = (item) => {
    const status = String(item.status || 'pending').toLowerCase();
    const paymentStatus = String(item.paymentStatus || '').toLowerCase();

    const baseClass = "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full";

    if (status === 'awaiting_payment') {
      if (paymentStatus === 'rejected') {
        return <span className={`${baseClass} bg-rose-50 text-rose-600 border border-rose-100`}>Action Required</span>;
      }
      if (paymentStatus === 'proof_submitted') {
        return <span className={`${baseClass} bg-blue-50 text-blue-600 border border-blue-100`}>Reviewing</span>;
      }
      return <span className={`${baseClass} bg-amber-50 text-amber-700 border border-amber-100`}>Unpaid</span>;
    }
    
    if (status === 'pending') return <span className={`${baseClass} bg-surface-container-high text-on-surface-variant border border-outline-variant/20`}>Waiting</span>;
    if (status === 'confirmed') return <span className={`${baseClass} bg-emerald-50 text-emerald-600 border border-emerald-100`}>Confirmed</span>;
    if (status === 'in_progress') return <span className={`${baseClass} bg-indigo-50 text-indigo-600 border border-indigo-100`}>Serving</span>;
    if (status === 'completed') return <span className={`${baseClass} bg-green-50 text-green-600 border border-green-100`}>Completed</span>;
    if (status === 'cancelled') return <span className={`${baseClass} bg-rose-50 text-rose-600 border border-rose-100`}>Cancelled</span>;
    
    return <span className={`${baseClass} bg-surface-container-high text-on-surface-variant`}>{item.status || 'pending'}</span>;
  };

  const openProofModal = (booking) => {
    setSelectedBooking(booking);
    setProofNote('');
    setProofFile(null);
    setProofModalOpen(true);
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (!businessId || !selectedBooking?.id) return;
    if (!proofFile) {
      toast.error('Upload payment proof image first.');
      return;
    }

    setSubmitting(true);
    try {
      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        toast.error('Cloudinary is not configured. Please contact support.');
        setSubmitting(false);
        return;
      }
      const form = new FormData();
      form.append('file', proofFile);
      form.append('upload_preset', cloudinaryUploadPreset);
      form.append('folder', `antreey/payment-proofs/${businessId}/${selectedBooking.id}`);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: form
      });
      const json = await res.json();
      if (!res.ok || !json?.secure_url) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
      }
      await BookingRepository.submitPaymentProof(businessId, selectedBooking.id, {
        paymentProofUrl: json.secure_url,
        paymentProofNote: proofNote.trim()
      });
      toast.success(selectedBooking.paymentStatus === 'rejected' ? 'Corrected proof submitted.' : 'Payment proof submitted successfully.');
      setProofModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-surface-bright">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-outline-variant/10 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[18px] font-black text-on-surface tracking-tight">My Bookings</h1>
            <p className="text-[11px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-0.5">Order History</p>
          </div>
        </div>
        <div className="w-11"></div>
      </div>

      <div className="p-5 md:p-6 space-y-4">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass-card rounded-[40px] shadow-sm">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-on-surface-variant/30 text-[40px]">calendar_today</span>
            </div>
            <h3 className="text-lg font-black text-on-surface mb-2 tracking-tight">No Bookings Yet</h3>
            <p className="text-sm text-on-surface-variant/50 max-w-[200px]">You haven't made any appointments yet. Start booking now!</p>
          </div>
        ) : (
          bookings.map((item) => {
            const isAwaitingPayment = item.status === 'awaiting_payment';
            const isRejected = item.paymentStatus === 'rejected';
            const isExpanded = expandedIds.has(item.id);
            
            return (
              <div key={item.id} className="group bg-surface-container-low rounded-[32px] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-5 overflow-hidden relative">
                {/* Decorative Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                         <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
                      </div>
                      <h3 className="font-black text-on-surface tracking-tight truncate">{item.serviceName || 'Service'}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {item.date}
                      </div>
                      <div className="w-1 h-1 bg-outline-variant/30 rounded-full" />
                      <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {item.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {renderStatusBadge(item)}
                    <button 
                      onClick={() => toggleExpand(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                        isExpanded ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-bright border-outline-variant/10 text-on-surface-variant'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{isExpanded ? 'Hide' : 'Details'}</span>
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-surface-bright/50 rounded-2xl border border-outline-variant/10 p-4 mb-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Live Status</span>
                        <div className="bg-surface-container-high px-2 py-0.5 rounded-md text-[9px] font-black text-on-surface-variant uppercase">
                          Queue: {formatQueueNumber(item.queuePosition, queueConfig)}
                        </div>
                      </div>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <BookingStatusTimeline booking={item} compact />
                  </div>
                )}

                {isAwaitingPayment && (
                  <div className={`mb-4 p-4 rounded-2xl border text-[12px] font-medium leading-relaxed relative z-10 ${
                    isRejected
                      ? 'bg-rose-50 border-rose-100 text-rose-800'
                      : item.paymentStatus === 'proof_submitted'
                        ? 'bg-blue-50 border-blue-100 text-blue-800'
                        : 'bg-amber-50 border-amber-100 text-amber-900'
                  }`}>
                    <div className="flex gap-2.5">
                      <span className="material-symbols-outlined text-[18px] shrink-0">
                        {isRejected ? 'error' : item.paymentStatus === 'proof_submitted' ? 'info' : 'payments'}
                      </span>
                      <div>
                        {isRejected && 'Your payment proof needs revision. Please upload a clearer or corrected proof.'}
                        {item.paymentStatus === 'proof_submitted' && 'Your proof has been sent. The business team is reviewing it now.'}
                        {!isRejected && item.paymentStatus !== 'proof_submitted' && 'Complete your deposit payment to secure this booking slot.'}
                        
                        {isRejected && item.paymentReviewNote && (
                          <div className="mt-2.5 bg-white/60 rounded-xl p-2.5 text-[11px] border border-rose-200/50">
                            <span className="font-black uppercase text-[9px] block mb-0.5 text-rose-900/50">Admin Note</span>
                            {item.paymentReviewNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => onOpenTicket(item.id)}
                    className="flex-1 h-11 rounded-2xl bg-inverse-surface text-inverse-on-surface text-[13px] font-black tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                    View Ticket
                  </button>
                  {isAwaitingPayment && (
                    <button
                      onClick={() => openProofModal(item)}
                      className={`flex-1 h-11 rounded-2xl text-on-primary text-[13px] font-black tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        isRejected ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{isRejected ? 'upload' : 'payments'}</span>
                      {isRejected ? 'Revise Proof' : 'Pay Deposit'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {proofModalOpen && (
        <div className="fixed inset-0 z-[100] p-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={() => setProofModalOpen(false)} />
          <form onSubmit={submitProof} className="glass-card w-full max-w-md rounded-[40px] p-8 space-y-6 shadow-2xl relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[32px]">payments</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-on-surface tracking-tight">
                  {selectedBooking?.paymentStatus === 'rejected' ? 'Correct Payment' : 'Upload Proof'}
                </h3>
                <p className="text-sm text-on-surface-variant/60 mt-1 leading-relaxed">
                  {selectedBooking?.paymentStatus === 'rejected'
                    ? 'Please upload a corrected transfer proof for review.'
                    : 'Upload your transfer receipt to secure your slot.'}
                </p>
              </div>
            </div>

            {selectedBooking?.paymentStatus === 'rejected' && (
              <div className="rounded-[24px] border border-rose-100 bg-rose-50/50 p-4">
                <div className="flex gap-2 text-rose-800 mb-1">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <p className="text-[13px] font-black uppercase tracking-wide">Previous Rejection</p>
                </div>
                <p className="text-[13px] text-rose-700 leading-relaxed ml-7">
                  {selectedBooking.paymentReviewNote || 'Proof was unclear or incorrect.'}
                </p>
              </div>
            )}

            {paymentMethods.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Payment Options</p>
                <div className="space-y-2.5">
                  {paymentMethods.map((method, index) => (
                    <div key={`pm-${index}`} className="rounded-[24px] bg-surface-container-low p-4 border border-outline-variant/10 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-on-surface text-sm">{method.bankName || '-'}</p>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-bold text-on-surface-variant">{method.accountNumber || '-'}</p>
                        <p className="text-[11px] text-on-surface-variant/50">a/n {method.accountName || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Upload Receipt</p>
                <div className="relative group">
                  <input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  <div className={`w-full h-14 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                    proofFile ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 bg-surface-bright text-on-surface-variant/40 group-hover:border-outline-variant/40'
                  }`}>
                    <span className="material-symbols-outlined">{proofFile ? 'check_circle' : 'cloud_upload'}</span>
                    <span className="text-sm font-black tracking-tight truncate max-w-[200px]">
                      {proofFile ? proofFile.name : 'Select image file'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Notes (Optional)</p>
                <textarea
                  className="w-full bg-surface-container-low rounded-[24px] p-4 text-sm min-h-[100px] border border-outline-variant/10 focus:border-primary/30 focus:ring-0 outline-none transition-all resize-none text-on-surface"
                  placeholder="Anything we should know?"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setProofModalOpen(false)} 
                className="flex-1 h-13 rounded-2xl bg-surface-container-low text-on-surface-variant text-sm font-black transition-all hover:bg-surface-container active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex-[2] h-13 rounded-2xl bg-primary text-on-primary text-sm font-black transition-all shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
