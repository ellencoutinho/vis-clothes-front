import { useState, useRef } from "react";
import "./App.css";
import JSZip from "jszip";
import axios from "axios";


const COLOR_MAP = {
  // Cores de fundo e do texto das tags
  Beige: { bg: "#F5F5DC", text: "#8D8D8D" },
  Black: { bg: "#000000", text: "#FFFFFF" },
  Blue: { bg: "#0000FF", text: "#FFFFFF" },
  Brown: { bg: "#A52A2A", text: "#FFFFFF" },
  Green: { bg: "#008000", text: "#FFFFFF" },
  Grey: { bg: "#808080", text: "#FFFFFF" },
  Multicolor: { bg: "#FF69B4", text: "#FFFFFF" }, // Exemplo de cor multicolorida
  Orange: { bg: "#FFA500", text: "#FFFFFF" },
  Pink: { bg: "#FFC0CB", text: "#8D8D8D" },
  Purple: { bg: "#800080", text: "#FFFFFF" },
  Red: { bg: "#FF0000", text: "#FFFFFF" },
  White: { bg: "#FFFFFF", text: "#8D8D8D" },
  Yellow: { bg: "#FFFF00", text: "#8D8D8D" },
}

function App() {
  const [imagesWithInfo, setImagesWithInfo] = useState([]);
  const [shownFilters, setShownFilters] = useState({ category: false, color: false, detail: false });
  const [selected, setSelected] = useState({ category: [], color: [], detail: [] });
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleZipChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/x-zip-compressed") {
      alert("Por favor, selecione um arquivo .zip.");
      return;
    }
    setImagesWithInfo([]);
    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const promises = [];
      zip.forEach((path, entry) => {
        if (!entry.dir && /\.(jpe?g|png|gif)$/i.test(path)) {
          promises.push(
            entry.async("blob").then((blob) => ({
              name: path,
              url: URL.createObjectURL(blob),
              info: null,
            }))
          );
        }
      });
      const loaded = await Promise.all(promises);
      
      const formData = new FormData();
      formData.append("zipFile", file);
      axios.post("http://localhost:8000/zip", formData, {headers: {"Content-Type": "multipart/form-data"}})
        .then((response) => {
          const infos = response.data.results
          const analyzed = loaded.map((img) => ({ ...img, info: infos[img.name] }))
          setImagesWithInfo(analyzed);
          setIsLoading(false);
        }).catch((err) => {
          if (err.response?.data?.message) 
            alert(err.response.data.message)
          else {
            console.error(err);
            alert("Erro ao enviar o arquivo ZIP.");
          }
        });
    } catch (err) {
      console.error(err);
      alert("Erro ao processar o arquivo zip.");
    }
  };

  const toggleFilterList = (key) => {
    setShownFilters((prev) => {
      const newState = { category: false, color: false, detail: false };
      newState[key] = !prev[key];
      return newState;
    });
  };

  const handleSelect = (key, value) => {
    setSelected((prev) => {
      const exists = prev[key].includes(value);
      const updated = exists ? prev[key].filter((v) => v !== value) : [...prev[key], value];
      return { ...prev, [key]: updated };
    });
  };

  const tipos = [...new Set(imagesWithInfo.map((i) => i.info?.category).filter(Boolean))];
  const cores = [...new Set(imagesWithInfo.map((i) => i.info?.color).filter(Boolean))];
  const estampas = [...new Set(imagesWithInfo.map((i) => i.info?.detail).filter(Boolean))];

  const filteredImages = imagesWithInfo.filter((img) => {
    if (!img.info) return false;
    const { category, color, detail } = img.info;
    const matchTipo = selected.category.length ? selected.category.includes(category) : true;
    const matchCor = selected.color.length ? selected.color.includes(color) : true;
    const matchEstampa = selected.detail.length ? selected.detail.includes(detail) : true;
    return matchTipo && matchCor && matchEstampa;
  });

  return (
    <div className={`app-container-new ${imagesWithInfo.length === 0 ? "initial-view" : ""}`}>
      <h1 className="page-title">Classificador de Roupas</h1>
      <p className="page-subtitle">
        Envie um arquivo .zip contendo fotos de peças de roupa para obter a classificação automática de cor, tipo e estampa de cada imagem.
      </p>

      <div className="upload-button-container">
        <button onClick={() => fileInputRef.current.click()} className="file-button" disabled={isLoading}>
          {(isLoading) ? <div class="loading-circle"></div> : "Selecionar arquivo .zip"}
        </button>
        <input type="file" accept=".zip" onChange={handleZipChange} className="visually-hidden" ref={fileInputRef} />
      </div>

      {imagesWithInfo.length > 0 && (
        <>
          <div className="filters-container">
            <span className="filters-label">Filtros:</span>
            {["category", "color", "detail"].map((key) => (
              <div key={key} className="filter-group">
                <button onClick={() => toggleFilterList(key)} className="filter-button">
                  {key.charAt(0).toUpperCase() + key.slice(1)} <span className="arrow">▼</span>
                </button>
                {shownFilters[key] && (
                  <ul className="filter-list">
                    {(key === "category" ? tipos : key === "color" ? cores : estampas).map((val) => (
                      <li key={val}>
                        <label>
                          <input type="checkbox" checked={selected[key].includes(val)} onChange={() => handleSelect(key, val)} />
                          {val}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {filteredImages.length === 0 ? (
            <p className="no-results-message">Não há fotos para a combinação de filtros utilizada.</p>
          ) : (
            <div className="image-grid-new">
              {filteredImages.map((imageInfo, idx) => (
                <div key={idx} className="image-item-new">
                  <div className="image-container-new">
                    <img src={imageInfo.url} alt={imageInfo.name} className="preview-image-new" />
                    <p className="image-name-new">{imageInfo.name}</p>
                  </div>
                  {imageInfo.info && (
                    <div className="tags-container">
                      <span className="tag tag-neutral">{imageInfo.info.category}</span>
                      <span className="tag tag-neutral">{imageInfo.info.detail}</span>
                      <span
                        className="tag tag-color"
                        style={{
                          backgroundColor: COLOR_MAP[imageInfo.info.color]?.bg || "#ccc",
                          color: COLOR_MAP[imageInfo.info.color]?.text || "#333",
                        }}
                      >
                        {imageInfo.info.color}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
