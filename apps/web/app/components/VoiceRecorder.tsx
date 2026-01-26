/**
 * Voice Recorder Component
 * Record voice replies using MediaRecorder API
 * v0.37.9 - Voice Replies
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  questionId: string;
  onUploadComplete?: (audioUrl: string) => void;
  onCancel?: () => void;
  className?: string;
}

const MAX_DURATION_MS = 30 * 1000; // 30 seconds

export function VoiceRecorder({ questionId, onUploadComplete, onCancel, className = '' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      let time = 0;
      timerRef.current = setInterval(() => {
        time += 100;
        setRecordingTime(time);
        if (time >= MAX_DURATION_MS) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      let time = recordingTime;
      timerRef.current = setInterval(() => {
        time += 100;
        setRecordingTime(time);
        if (time >= MAX_DURATION_MS) {
          stopRecording();
        }
      }, 100);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob || !questionId) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('questionId', questionId);
      formData.append('audio', audioBlob, 'voice-reply.webm');

      const response = await fetch('/api/answers/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload voice reply');
      }

      onUploadComplete?.(data.reflection?.audioUrl || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload voice reply');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
    onCancel?.();
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>
      )}

      {!audioBlob && !isRecording && (
        <Button
          onClick={startRecording}
          className="flex items-center gap-2 bg-accent text-white"
        >
          <Mic className="h-4 w-4" />
          Record Voice Reply
        </Button>
      )}

      {isRecording && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-red-100 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
                <span className="text-sm text-subtle">{formatTime(recordingTime)}</span>
              </div>
              <div className="flex gap-2">
                {isPaused ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resumeRecording}
                    className="h-8"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={pauseRecording}
                    className="h-8"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopRecording}
                  className="h-8"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {audioBlob && audioUrl && !isRecording && (
        <div className="space-y-3">
          <div className="bg-card border border-border p-3 rounded-lg">
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-accent text-white"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Voice Reply
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

