import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  getConfiguredApiBaseUrl,
  getSavedApiBaseUrl,
  isNativePlatform,
  normalizeApiBaseUrl,
  saveApiBaseUrl,
} from "../utils/apiBaseUrl";

export default function ApiEndpointConfig() {
  const native = isNativePlatform();
  const initialUrl = useMemo(
    () => getSavedApiBaseUrl() || axios.defaults.baseURL || getConfiguredApiBaseUrl(),
    [],
  );
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState("");

  if (!native) return null;

  const handleSave = () => {
    const normalized = saveApiBaseUrl(url);
    if (!normalized) {
      setStatus("Introduce una URL válida.");
      return;
    }
    axios.defaults.baseURL = normalized;
    setStatus(`Servidor guardado: ${normalized}`);
  };

  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        className="btn btn-outline btn-full"
        style={{ fontSize: 12, padding: "9px 10px" }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Ocultar servidor" : "Configurar servidor"}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            border: "1px solid #e3e6ea",
            borderRadius: 10,
            padding: 10,
            background: "#fafbfc",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#5a6470" }}>
            Emulador Android: <b>http://10.0.2.2:8080</b>. Móvil real: <b>http://IP-DE-TU-PC:8080</b>.
          </p>
          <input
            className="form-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setStatus("");
            }}
            placeholder="http://192.168.X.X:8080"
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: 12, padding: "8px 12px" }}
              onClick={handleSave}
            >
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: 12, padding: "8px 12px" }}
              onClick={() => setUrl(normalizeApiBaseUrl("http://10.0.2.2:8080"))}
            >
              Usar 10.0.2.2
            </button>
          </div>
          {status && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#374151" }}>{status}</p>}
        </div>
      )}
    </div>
  );
}
