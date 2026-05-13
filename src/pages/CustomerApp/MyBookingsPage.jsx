import React, { useEffect, useState } from 'react';
import { BookingRepository } from '../../repositories/BookingRepository';
import { useAuth } from '../../context/AuthContext';
import { formatQueueNumber } from '../../utils/queueNumber';
import { toast } from 'sonner';
import { BusinessRepository } from '../../repositories/BusinessRepository';

export const MyBookingsPage = ({ businessId, onBack, onOpenTicket, queueConfig = {} }) => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
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

    if (status === 'awaiting_payment') {
      if (paymentStatus === 'rejected') {
        return <span className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">Payment Needs Revision</span>;
      }
      if (paymentStatus === 'proof_submitted') {
        return <span className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Proof Sent · Waiting Review</span>;
      }
      return <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Payment Needed</span>;
    }
    if (status === 'pending') return <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Waiting for Queue</span>;
    if (status === 'confirmed') return <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Confirmed</span>;
    if (status === 'in_progress') return <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">Now Serving</span>;
    if (status === 'completed') return <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">Completed</span>;
    if (status === 'cancelled') return <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">Cancelled</span>;
    return <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container">{item.status || 'pending'}</span>;
  };

  const openProofModal = (booking) => {
    setSelectedBooking(booking);
    setProofUrl(booking?.paymentProofUrl || '');
    setProofNote(booking?.paymentProofNote || '');
    setProofFile(null);
    setProofModalOpen(true);
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (!businessId || !selectedBooking?.id) return;
    if (!proofFile && !proofUrl.trim()) {
      toast.error('Upload payment proof image first.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedProofUrl = proofUrl.trim();
      if (proofFile) {
        if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
          toast.error('Cloudinary belum dikonfigurasi. Hubungi admin.');
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
        uploadedProofUrl = json.secure_url;
      }
      await BookingRepository.submitPaymentProof(businessId, selectedBooking.id, {
        paymentProofUrl: uploadedProofUrl,
        paymentProofNote: proofNote.trim()
      });
      toast.success('Payment proof submitted successfully.');
      setProofModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-surface-bright">
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-label-md text-[16px]">My Bookings</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 space-y-3">
        {bookings.length === 0 && (
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 text-on-surface-variant text-sm">
            No bookings yet.
          </div>
        )}

        {bookings.map((item) => (
          <div key={item.id} className="bg-white border border-outline-variant/20 rounded-2xl p-4 w-full text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="font-label-md">{item.serviceName || 'Service'}</p>
              {renderStatusBadge(item)}
            </div>
            <p className="text-sm text-on-surface-variant">{item.date} • {item.timeSlot}</p>
            <p className="text-sm text-on-surface-variant">Queue: {formatQueueNumber(item.queuePosition, queueConfig)}</p>

            {item.status === 'awaiting_payment' && (
              <div className={`mt-3 p-3 rounded-xl border text-xs ${
                item.paymentStatus === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {item.paymentStatus === 'rejected'
                  ? 'Your payment proof needs revision. Please upload a clearer or corrected proof.'
                  : 'Complete your deposit payment to secure this booking slot.'}
                {item.paymentStatus === 'rejected' && item.paymentReviewNote ? (
                  <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-[11px]">
                    Note: {item.paymentReviewNote}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onOpenTicket(item.id)}
                className="px-3 py-2 rounded-xl bg-surface-container text-xs font-semibold"
              >
                View Ticket
              </button>
              {item.status === 'awaiting_payment' && (
                <button
                  onClick={() => openProofModal(item)}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                >
                  Upload Payment Proof
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {proofModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <form onSubmit={submitProof} className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface text-[18px]">Confirm Your Payment</h3>
                <p className="text-xs text-on-surface-variant mt-1">Upload transfer proof to lock your booking slot.</p>
              </div>
            </div>

            {paymentMethods.length > 0 && (
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-3 text-xs space-y-2">
                <p className="font-semibold text-on-surface">Payment Accounts</p>
                {paymentMethods.map((method, index) => (
                  <div key={`pm-${index}`} className="rounded-lg bg-white p-2 border border-outline-variant/20">
                    <p className="font-semibold">{method.bankName || '-'}</p>
                    <p>a/n {method.accountName || '-'}</p>
                    <p>{method.accountNumber || '-'}</p>
                    {method.note ? <p className="text-on-surface-variant">{method.note}</p> : null}
                  </div>
                ))}
              </div>
            )}

            <input
              className="w-full bg-surface-container rounded-2xl p-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white file:text-xs"
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            <input
              className="w-full bg-surface-container rounded-2xl p-3 text-sm"
              placeholder="Optional: paste proof URL"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
            />
            <textarea
              className="w-full bg-surface-container rounded-2xl p-3 text-sm min-h-20"
              placeholder="Payment note (optional)"
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setProofModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container text-sm">Later</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-primary text-white text-sm">{submitting ? 'Submitting...' : 'Submit Payment Proof'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
