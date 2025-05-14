import { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const handleSubmit = () => {
    if (!image) return;
    // Simula classificação automática
    setTimeout(() => {
      setAnalysis({
        cor: "Azul",
        tipo: "Calça",
        estampa: "Sólida",
      });
    }, 500);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Classificador de Roupas</h1>
        <p className="description">
          Envie a foto de uma peça de roupa para obter uma classificação automática com cor, tipo e estampa.
        </p>

        <div className="actions">
          <label className="file-button">
            Escolher imagem
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="visually-hidden"
            />
          </label>
          <button onClick={handleSubmit} className="send-button">
            Enviar
          </button>
        </div>

        {preview && (
          <>
            <img src={preview} alt="Preview" className="preview-image" />
            {analysis && (
              <p className="simple-result">
                Tipo: {analysis.tipo} | Cor: {analysis.cor} | Estampa: {analysis.estampa}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;