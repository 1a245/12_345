import React, { useState } from 'react';
import { X, MessageCircle, Send, Download, Copy, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    content: string;
    fileName: string;
    csvContent: string;
  };
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `${data.title}\n\n${data.content}`;

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const encodedText = encodeURIComponent(shareText);
    const telegramUrl = `https://t.me/share/url?text=${encodedText}`;
    window.open(telegramUrl, '_blank');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', data.fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const file = new File([blob], data.fileName, { type: 'text/csv' });

        await navigator.share({
          title: data.title,
          text: data.content,
          files: [file]
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
        handleDownloadCSV();
      }
    } else {
      handleDownloadCSV();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Share Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{data.title}</h4>
            <p className="text-sm text-gray-600">{data.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>

            <button
              onClick={handleTelegramShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              Telegram
            </button>

            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              More Apps
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadCSV}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CSV File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}