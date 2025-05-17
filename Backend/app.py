from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import onnxruntime as ort
import librosa

def map_result_to_chord_shape(result):
    string_map = ['x'] * 6  # initialize all strings as muted
    for fret, string in enumerate(result):
        if string != "null":
            # Only update if not already set to a lower fret
            current = string_map[string]
            if current == 'x' or (current.isdigit() and fret < int(current)):
                string_map[string] = str(fret)
    
    # Convert to 'string_number-fret' format
    return [f"{i+1}-{fret}" for i, fret in enumerate(string_map)]


app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga el modelo ONNX una sola vez
ort.preload_dlls(cuda=True, cudnn=True, msvc=True, directory=None)
providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
session = ort.InferenceSession("tabcnn_model.onnx", providers=providers)

class InputData(BaseModel):
    data: list

@app.post("/predict")
def predict(input_data: InputData):
    audio = np.array(input_data.data, dtype=np.float32)

    sr = 22050
    hop_length = 512  
    n_bins = 192
    bins_per_octave = 24 
    
    cqt = librosa.cqt(audio, sr=sr, hop_length=hop_length, n_bins=n_bins, bins_per_octave=bins_per_octave)
    cqt_mag = np.abs(cqt)

    frame_width = 9
    min_length = frame_width

    if cqt_mag.shape[1] < min_length:
        pad_width = min_length - cqt_mag.shape[1]
        cqt_mag = np.pad(cqt_mag, ((0, 0), (0, pad_width)), mode='constant')

    window = cqt_mag[:, 0:frame_width] 
    
    input_array = window[np.newaxis, :, :]  # shape: (1, 192, 9)

    input_array = input_array.astype(np.float32)

    input_name = session.get_inputs()[0].name
    ort_inputs = {input_name: input_array}

    ort_outs = session.run(None, ort_inputs)

    # Retorna la salida como lista JSON serializable
    reshaped_out = ort_outs[0][0][0].reshape(6, 21)
    max_indices = np.argmax(reshaped_out, axis=1)
    max_values = np.max(reshaped_out, axis=1)
    result = [int(idx) if val > 0.5 else "null" for idx, val in zip(max_indices, max_values)]
    result = map_result_to_chord_shape(result)
    return {"output": result}
