import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Database,
  Smartphone,
  Monitor,
  Users,
} from "lucide-react";
import { hasSupabaseCredentials } from "../lib/supabase";

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupGuide({ isOpen, onClose }: SetupGuideProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, step: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const isConfigured = hasSupabaseCredentials();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Multi-Device Setup
              </h3>
              <p className="text-sm text-gray-600">
                Enable data sync across all your devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isConfigured ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Multi-Device Sync Enabled!
              </h4>
              <p className="text-gray-600 mb-6">
                Your data now syncs automatically across all your devices. Log
                in with the same credentials on any device to access your data.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Mobile</p>
                </div>
                <div className="text-center">
                  <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Desktop</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Team</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Why Enable Multi-Device Sync?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Access your data from any device</li>
                  <li>• Real-time synchronization across devices</li>
                  <li>• Secure cloud backup of your business data</li>
                  <li>• Team collaboration capabilities</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Setup Instructions:
                </h4>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Create Supabase Account
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Go to Supabase and create a free account. The database
                        schema will be created automatically.
                      </p>
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Supabase
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Create New Project
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Click "New Project", name it "M13 Business Management",
                        and wait 2-3 minutes for setup
                      </p>
                      <div className="bg-blue-50 p-3 rounded border text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Choose a region closest to your
                        location for better performance
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Get API Credentials
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        In your project dashboard, go to Settings → API and copy
                        these values:
                      </p>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Project URL
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard("VITE_SUPABASE_URL=", 1)
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {copiedStep === 1 ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <code className="text-xs text-gray-600">
                            https://your-project.supabase.co
                          </code>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Anon/Public Key
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard("VITE_SUPABASE_ANON_KEY=", 2)
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {copiedStep === 2 ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <code className="text-xs text-gray-600">
                            eyJhbGciOiJIUzI1NiIsInR5cCI6...
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Configure Environment
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Update your{" "}
                        <code className="bg-gray-100 px-1 rounded">.env</code>{" "}
                        file in the project root:
                      </p>

                      <div className="mt-2 bg-yellow-50 p-3 rounded border text-sm text-yellow-800">
                        ⚠️ <strong>Important:</strong> Replace the placeholder
                        values with your actual credentials
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      5
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Restart Application
                      </h5>
                      <p className="text-sm text-gray-600">
                        Save the .env file and restart with{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          npm run dev
                        </code>
                        . Look for "Online\" status in the top-right corner.
                      </p>
                      <div className="mt-2 bg-green-50 p-3 rounded border text-sm text-green-800">
                        ✅ <strong>Success:</strong> You should see "Online"
                        instead of "Local Only"
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  🔄 How Sync Works:
                </h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Automatic:</strong> Data syncs in real-time when
                    online
                  </li>
                  <li>
                    • <strong>Offline-first:</strong> App works without internet
                  </li>
                  <li>
                    • <strong>Multi-device:</strong> Same login on all devices
                  </li>
                  <li>
                    • <strong>Secure:</strong> Your data is encrypted and
                    isolated
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 mb-2">
                  Important Notes:
                </h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Your existing local data will be preserved</li>
                  <li>• First device uploads local data to cloud</li>
                  <li>• Other devices download and sync automatically</li>
                  <li>• Default login: admin@m13.com / admin123</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isConfigured ? "Close" : "I'll Set This Up Later"}
          </button>
        </div>
      </div>
    </div>
  );
}
