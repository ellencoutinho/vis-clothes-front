import { useState, useRef, useEffect } from "react";
import "./App.css";
import JSZip from "jszip";

const COLOR_MAP = {
  // Cores de fundo e do texto das tags
  Vermelho: { bg: "#FF0000", text: "#FFFFFF" },
  Azul: { bg: "#0000FF", text: "#FFFFFF" },
  Verde: { bg: "#008000", text: "#FFFFFF" },
  Amarelo: { bg: "#FFFF00", text: "#8B4513" },
  Preto: { bg: "#000000", text: "#FFFFFF" },
  Branco: { bg: "#FFFFFF", text: "#000000" },
  Laranja: { bg: "#FFA500", text: "#FFFFFF" },
  Roxo: { bg: "#800080", text: "#FFFFFF" },
  Rosa: { bg: "#FFC0CB", text: "#8B0000" },
  Marrom: { bg: "#A52A2A", text: "#FFFFFF" },
  Cinza: { bg: "#808080", text: "#FFFFFF" },
};

function App() {
  const [imagesWithInfo, setImagesWithInfo] = useState([]);
  const [shownFilters, setShownFilters] = useState({ tipo: false, cor: false, estampa: false });
  const [selected, setSelected] = useState({ tipo: [], cor: [], estampa: [] });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imagesWithInfo.length > 0 && !imagesWithInfo[0].info) {
      const analyzed = imagesWithInfo.map((img) => ({
        ...img,
        info: {
          cor: getRandomColor(),
          tipo: getRandomType(),
          estampa: getRandomPattern(),
        },
      }));
      setImagesWithInfo(analyzed);
    }
  }, [imagesWithInfo]);

  const handleZipChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/x-zip-compressed") {
      alert("Por favor, selecione um arquivo .zip.");
      return;
    }
    setImagesWithInfo([]);
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
      setImagesWithInfo(loaded);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar o arquivo zip.");
    }
  };

  const toggleFilterList = (key) => {
    setShownFilters((prev) => {
      const newState = { tipo: false, cor: false, estampa: false };
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

  const tipos = [...new Set(imagesWithInfo.map((i) => i.info?.tipo).filter(Boolean))];
  const cores = [...new Set(imagesWithInfo.map((i) => i.info?.cor).filter(Boolean))];
  const estampas = [...new Set(imagesWithInfo.map((i) => i.info?.estampa).filter(Boolean))];

  const filteredImages = imagesWithInfo.filter((img) => {
    if (!img.info) return false;
    const { tipo, cor, estampa } = img.info;
    const matchTipo = selected.tipo.length ? selected.tipo.includes(tipo) : true;
    const matchCor = selected.cor.length ? selected.cor.includes(cor) : true;
    const matchEstampa = selected.estampa.length ? selected.estampa.includes(estampa) : true;
    return matchTipo && matchCor && matchEstampa;
  });

  return (
    <div className={`app-container-new ${imagesWithInfo.length === 0 ? "initial-view" : ""}`}>
      <h1 className="page-title">Classificador de Roupas</h1>
      <p className="page-subtitle">
        Envie um arquivo .zip contendo fotos de peças de roupa para obter a classificação automática de cor, tipo e estampa de cada imagem.
      </p>

      <div className="upload-button-container">
        <button onClick={() => fileInputRef.current.click()} className="file-button">
          Selecionar arquivo .zip
        </button>
        <input type="file" accept=".zip" onChange={handleZipChange} className="visually-hidden" ref={fileInputRef} />
      </div>

      {imagesWithInfo.length > 0 && (
        <>
          <div className="filters-container">
            <span className="filters-label">Filtros:</span>
            {["tipo", "cor", "estampa"].map((key) => (
              <div key={key} className="filter-group">
                <button onClick={() => toggleFilterList(key)} className="filter-button">
                  {key.charAt(0).toUpperCase() + key.slice(1)} <span className="arrow">▼</span>
                </button>
                {shownFilters[key] && (
                  <ul className="filter-list">
                    {(key === "tipo" ? tipos : key === "cor" ? cores : estampas).map((val) => (
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
                      <span className="tag tag-neutral">{imageInfo.info.tipo}</span>
                      <span className="tag tag-neutral">{imageInfo.info.estampa}</span>
                      <span
                        className="tag tag-color"
                        style={{
                          backgroundColor: COLOR_MAP[imageInfo.info.cor]?.bg || "#ccc",
                          color: COLOR_MAP[imageInfo.info.cor]?.text || "#333",
                        }}
                      >
                        {imageInfo.info.cor}
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

const getRandomColor = () => Object.keys(COLOR_MAP)[Math.floor(Math.random() * Object.keys(COLOR_MAP).length)];
const getRandomType = () => ["Camiseta", "Calça", "Vestido", "Saia", "Casaco"][Math.floor(Math.random() * 5)];
const getRandomPattern = () => ["Lisa", "Listrada", "Xadrez", "Floral", "Poá"][Math.floor(Math.random() * 5)];

export default App;
