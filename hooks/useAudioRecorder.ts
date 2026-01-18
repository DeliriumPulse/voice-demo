'use client';

import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const getSupportedMimeType = () => {
        const types = [
            'audio/webm',
            'audio/ogg',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav',
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return '';
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedMimeType();

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current = recorder;
            chunks.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
            setAudioUrl(null);
            setAudioBlob(null);
        } catch (err) {
            console.error('Error starting recording:', err);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    return {
        isRecording,
        audioUrl,
        audioBlob,
        startRecording,
        stopRecording,
    };
};
