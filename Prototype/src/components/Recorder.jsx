import { useRef, useState, useEffect } from 'react';

export default function AudioStreamerWithCanvas() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelOutput, setModelOutput] = useState(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const toggleStreaming = () => {
    isStreaming ? stopStreaming() : startStreaming();
  };

  const startStreaming = async () => {
    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 22050,
    });

    sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);

    processorRef.current = audioContextRef.current.createScriptProcessor(512, 1, 1);
    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);

    processorRef.current.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0); // mono
      const frame = Float32Array.from(input);
      sendAudioFrame(frame);
    };

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 512;
    sourceRef.current.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    setIsStreaming(true);
    drawWaveform();
  };

  const stopStreaming = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current?.state === 'running') {
      audioContextRef.current.close();
    }

    cancelAnimationFrame(animationFrameRef.current);
    setIsStreaming(false);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArrayRef.current.length;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const sendAudioFrame = async (frame) => {
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: Array.from(frame) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setModelOutput(result.output);  
    } catch (err) {
      console.error('Error sending audio frame:', err);
    }
  };

  useEffect(() => {
    return () => stopStreaming(); 
  }, []);

  return (
    <div className="recorder-container">
      <button
        onClick={toggleStreaming}
        className={`record-button ${isStreaming ? 'stop' : 'start'}`}
      >
        {isStreaming ? 'Stop Stream' : 'Start Stream'}
      </button>
      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="waveform-canvas"
      />
      <div style={{ marginTop: '1rem', color: '#333', fontFamily:'monospace', fontSize: '20px', textAlign:'center' }}>
        <strong>Model Output:</strong>
        <pre style={{ maxHeight: 200, overflowY: 'auto', fontSize: '12px' }}>
          {modelOutput ? JSON.stringify(modelOutput, null, 2) : 'Waiting Output...'}
        </pre>
      </div>
    </div>
  );
}
