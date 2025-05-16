from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import onnxruntime as ort
import librosa

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
session = ort.InferenceSession("tabcnn_model.onnx")

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
    num_windows = 30
    min_length = frame_width + (num_windows - 1)  # 9 + 29 = 38 frames mínimo

    # Padding si el audio es muy corto
    if cqt_mag.shape[1] < min_length:
        pad_width = min_length - cqt_mag.shape[1]
        cqt_mag = np.pad(cqt_mag, ((0, 0), (0, pad_width)), mode='constant')

    # Crear 30 ventanas deslizantes de ancho 9
    windows = []
    for i in range(num_windows):
        window = cqt_mag[:, i:i+frame_width]  # shape: (192, 9)
        windows.append(window)

    # Stack para formar un batch: (30, 192, 9)
    input_array = np.stack(windows, axis=0)

    # Añadir dimensión de canal: (batch=30, channel=1, freq=192, frames=9)
    input_array = input_array[:, np.newaxis, :, :].astype(np.float32)

    input_name = session.get_inputs()[0].name
    ort_inputs = {input_name: input_array}

    ort_outs = session.run(None, ort_inputs)

    # print("Model output shape:", ort_outs[0].shape)  # para verificar

    # Retorna la salida como lista JSON serializable
    return {"output": ort_outs[0].tolist()}
