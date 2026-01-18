'use client';

import { useState } from 'react';
import { Mic, Square, Loader2, PlayCircle, FileText, Sparkles } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { processVoiceNote } from '@/app/actions';
import { cn } from '@/lib/utils';

export default function Home() {
  const { isRecording, audioUrl, audioBlob, startRecording, stopRecording } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ transcript: string; summary: string } | null>(null);

  const handleProcess = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // 1. Create FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      // 2. Trigger Server Action (Upload + Process)
      const response = await processVoiceNote(formData);

      if (response.success) {
        setResult({
          transcript: response.transcript!,
          summary: response.summary!,
        });
      } else {
        alert('Error: ' + response.error);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Upload failed. Check your environment variables.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl space-y-12 text-center">

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Voice-First AI
          </h1>
          <p className="text-neutral-400 text-lg">
            Record, transcribe, and summarize instantly.
          </p>
        </div>

        {/* Recording Interface */}
        <div className="flex flex-col items-center space-y-8">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-white/5 border border-white/10 hover:bg-white/10 glow-primary",
              isRecording && "bg-red-500/10 border-red-500/50 animate-pulse-red"
            )}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-red-500 fill-current" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium uppercase tracking-widest">Recording</span>
            </div>
          )}
        </div>

        {/* Audio Review & Action */}
        {audioUrl && !isRecording && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Review your recording</span>
                <PlayCircle className="w-5 h-5 text-neutral-400" />
              </div>
              <audio src={audioUrl} controls className="w-full accent-white" />
            </div>

            {!result && (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Insights</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center space-x-2 text-neutral-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Transcript</span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-200">
                  {result.transcript}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 border-emerald-500/20">
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">AI Summary</span>
                </div>
                <p className="text-sm leading-relaxed text-white italic">
                  &ldquo;{result.summary}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                // audioUrl stays until next recording
              }}
              className="text-neutral-500 hover:text-white text-sm transition-colors pt-4"
            >
              Reset and record new
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
