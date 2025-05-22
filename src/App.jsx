import { useState, useRef, useEffect } from "react";
import "./App.css";
import JSZip from "jszip";


const COLOR_MAP = {
  // Cores de fundo e do texto das tags
  "Vermelho": { bg: "#FF0000", text: "#FFFFFF" },
  "Azul": { bg: "#0000FF", text: "#FFFFFF" },
  "Verde": { bg: "#008000", text: "#FFFFFF" },
  "Amarelo": { bg: "#FFFF00", text: "#8B4513" },
  "Preto": { bg: "#000000", text: "#FFFFFF" },
  "Branco": { bg: "#FFFFFF", text: "#000000" },
  "Laranja": { bg: "#FFA500", text: "#FFFFFF" },
  "Roxo": { bg: "#800080", text: "#FFFFFF" },
  "Rosa": { bg: "#FFC0CB", text: "#8B0000" },
  "Marrom": { bg: "#A52A2A", text: "#FFFFFF" },
  "Cinza": { bg: "#808080", text: "#FFFFFF" },
};

function App() {
  const [imagesWithInfo, setImagesWithInfo] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imagesWithInfo.length > 0 && !imagesWithInfo[0].info) {
      const analyzedImages = imagesWithInfo.map((imgInfo) => ({
        ...imgInfo,
        info: {
          cor: getRandomColor(),
          tipo: getRandomType(),
          estampa: getRandomPattern(),
        },
      }));
      setImagesWithInfo(analyzedImages);
    }
  }, [imagesWithInfo]);

  const handleZipChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/x-zip-compressed") {
      alert("Por favor, selecione um arquivo .zip.");
      return;
    }

    setImagesWithInfo([]);

    try {
      const zip = await JSZip.loadAsync(file);
      const imagePromises = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && /\.(jpe?g|png|gif)$/i.test(relativePath)) {
          imagePromises.push(
            zipEntry.async("blob").then((blob) => ({
              name: relativePath,
              url: URL.createObjectURL(blob),
              info: null,
            }))
          );
        }
      });

      const loadedImages = await Promise.all(imagePromises);
      setImagesWithInfo(loadedImages);
    } catch (error) {
      console.error("Erro ao ler o arquivo zip:", error);
      alert("Erro ao processar o arquivo zip.");
    }
  };

  const getRandomColor = () => {
    const colors = Object.keys(COLOR_MAP);
    return colors?.[Math.floor(Math.random() * colors.length)];
  };

  const getRandomType = () => {
    const types = ["Camiseta", "Calça", "Vestido", "Saia", "Casaco"];
    return types?.[Math.floor(Math.random() * types.length)];
  };

  const getRandomPattern = () => {
    const patterns = ["Lisa", "Listrada", "Xadrez", "Floral", "Poá"];
    return patterns?.[Math.floor(Math.random() * patterns.length)];
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="app-container-new">
      <h1 className="page-title">Classificador de Roupas</h1>
      <p className="page-subtitle">
        Envie um arquivo .zip contendo fotos de peças de roupa para obter a
        classificação automática de cor, tipo e estampa de cada imagem.
      </p>
      <div className="upload-button-container">
        <button onClick={handleOpenFileDialog} className="file-button">
          Selecionar arquivo .zip
        </button>
        <input
          type="file"
          accept=".zip"
          onChange={handleZipChange}
          className="visually-hidden"
          ref={fileInputRef}
        />
      </div>

      <div className="image-grid-new">
        {imagesWithInfo.map((imageInfo, index) => (
          <div key={index} className="image-item-new">
            <div className="image-container-new">
              <img
                src={imageInfo.url}
                alt={imageInfo.name}
                className="preview-image-new"
              />
              <p className="image-name-new">{imageInfo.name}</p>
            </div>
            {imageInfo.info && (
              <div className="tags-container">
                {/* Tag de Tipo */}
                <span className="tag tag-neutral">
                  {imageInfo.info.tipo}
                </span>

                {/* Tag de Estampa */}
                <span className="tag tag-neutral">
                  {imageInfo.info.estampa}
                </span>

                {/* Tag de Cor */}
                <span
                  className="tag tag-color"
                  style={{
                    backgroundColor: COLOR_MAP[imageInfo.info.cor]?.bg || "#ccc", // Fundo da cor mapeada ou padrão
                    color: COLOR_MAP[imageInfo.info.cor]?.text || "#333" // Cor do texto mapeada ou padrão
                  }}
                >
                  {imageInfo.info.cor}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;