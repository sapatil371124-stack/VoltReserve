import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Hash, Copy, Check } from 'lucide-react';
import { blockchainService } from '../services/api';

export const BlockchainBadge = ({ bookingId, initialStatus = 'VERIFIED', blockIndex, transactionHash }) => {
  const [status, setStatus] = useState(initialStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyDetails, setVerifyDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setModalOpen(true);
    try {
      const res = await blockchainService.verifyBooking(bookingId);
      setVerifyDetails(res);
      setStatus(res.status);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = status === 'VERIFIED';

  return (
    <>
      <div className="inline-flex items-center space-x-1.5">
        <button
          onClick={handleVerify}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-warm-sm ${
            isVerified
              ? 'bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA] hover:bg-[#D9EFE2]'
              : 'bg-[#FDE8E8] text-[#9E3B3B] border border-[#F8B4B4] hover:bg-[#FCD4D4] animate-pulse'
          }`}
        >
          {isVerified ? (
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#2D6A4F]" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#9E3B3B]" />
          )}
          <span>{isVerified ? 'BLOCKCHAIN VERIFIED' : 'TAMPER DETECTED'}</span>
          <span className="ml-1 text-[10px] opacity-75 font-mono">
            {blockIndex ? `#${blockIndex}` : ''}
          </span>
        </button>
      </div>

      {/* Cryptographic Proof Inspection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D211A]/60 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 shadow-warm-xl border border-[#E8DFD5] max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8DFD5]">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isVerified ? 'bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]' : 'bg-[#FDE8E8] text-[#9E3B3B] border border-[#F8B4B4]'
                }`}>
                  {isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D211A]">Cryptographic Verification Proof</h3>
                  <p className="text-xs text-[#7D6B5E]">SHA-256 Distributed State Ledger</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#7D6B5E] hover:text-[#2D211A] text-sm font-bold p-1 rounded-lg hover:bg-[#F5F0E8]"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#9A5B35] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#7D6B5E]">Recalculating SHA-256 cryptographic hash across canonical fields...</p>
              </div>
            ) : verifyDetails ? (
              <div className="space-y-4 mt-4 text-xs font-sans">
                {/* Result Alert */}
                <div className={`p-3.5 rounded-2xl border flex items-start space-x-2.5 ${
                  verifyDetails.isTamperDetected
                    ? 'bg-[#FDE8E8] border-[#F8B4B4] text-[#9E3B3B]'
                    : 'bg-[#E8F3ED] border-[#B7DFCA] text-[#2D6A4F]'
                }`}>
                  {verifyDetails.isTamperDetected ? (
                    <AlertTriangle className="w-5 h-5 text-[#9E3B3B] shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {verifyDetails.isTamperDetected ? 'Ledger Invalidation / Tamper Detected' : 'Cryptographic Integrity Confirmed'}
                    </h4>
                    <p className="mt-0.5 opacity-90 leading-relaxed text-xs">
                      {verifyDetails.verificationMessage}
                    </p>
                  </div>
                </div>

                {/* Block Meta */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Block Sequence</span>
                    <span className="font-mono text-xs font-bold text-[#2D211A]">#{verifyDetails.blockIndex}</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Hash Algorithm</span>
                    <span className="font-mono text-xs font-bold text-[#9A5B35]">{verifyDetails.hashAlgorithm || 'SHA-256'}</span>
                  </div>
                </div>

                {/* Hashes Comparison */}
                <div className="space-y-2">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-[#8B786A]">Recorded Block Hash (Header)</span>
                      <button
                        onClick={() => handleCopyHash(verifyDetails.recordedTransactionHash)}
                        className="text-[#9A5B35] hover:text-[#844A29] flex items-center text-[10px]"
                      >
                        {copied ? <Check className="w-3 h-3 mr-0.5" /> : <Copy className="w-3 h-3 mr-0.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-[#2D211A] break-all block">
                      {verifyDetails.recordedTransactionHash}
                    </code>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block mb-1">Recomputed Live State Hash</span>
                    <code className="text-[11px] font-mono text-[#9A5B35] break-all block">
                      {verifyDetails.calculatedHash}
                    </code>
                  </div>
                </div>

                {/* Canonical Data Payload */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8B786A] block mb-1">Canonical String Signed in Ledger</span>
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] font-mono text-[10px] text-[#5D4A3E] break-all">
                    {verifyDetails.canonicalData}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 pt-3 border-t border-[#E8DFD5] flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#9A5B35] text-white font-bold text-xs hover:bg-[#844A29] transition-colors"
              >
                Close Audit Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
