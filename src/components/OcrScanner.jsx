import React, { useState } from 'react';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';

export default function OcrScanner({ onTextExtracted }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const base64Image = await convertToBase64(file);

      const myHeaders = new Headers();
      myHeaders.append("apikey", "helloworld"); // Clave pública de prueba o tu key propia

      const formdata = new FormData();
      formdata.append("base64Image", base64Image);
      formdata.append("language", "spa");
      formdata.append("isOverlayRequired", "false");
      formdata.append("scale", "true");
      formdata.append("OCREngine", "2");

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
      };

      const response = await fetch("https://api.ocr.space/parse/image", requestOptions);
      const result = await response.json();

      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        if (onTextExtracted) {
          onTextExtracted(extractedText);
        }
      } else {
        alert("No se pudo reconocer texto en la imagen.");
      }
    } catch (error) {
      console.error("Error al conectar con la API de OCR:", error);
      alert("Ocurrió un error al procesar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <Camera size={20} className="text-primary" />
        Escanear Tarea con Cámara o Imagen
      </h5>
      <p className="text-muted small mb-3">
        Toma una foto de tu tarea o apuntes para extraer el texto automáticamente.
      </p>

      <div className="d-flex flex-column gap-3">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageChange}
          className="form-control"
          disabled={loading}
        />

        {loading && (
          <div className="d-flex align-items-center gap-2 text-primary fw-semibold small">
            <Loader2 className="spinner-border spinner-border-sm" size={16} />
            <span>Leyendo texto de la imagen (OCR en proceso)...</span>
          </div>
        )}

        {preview && !loading && (
          <div className="d-flex align-items-center gap-2 text-success small fw-semibold">
            <CheckCircle2 size={16} />
            <span>¡Texto extraído con éxito!</span>
          </div>
        )}
      </div>
    </div>
  );
}