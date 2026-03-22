"use client";

import { useState } from "react";

export default function ResumeButton({ regNo }) {
  const [open, setOpen]       = useState(false);
  const [format, setFormat]   = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null);

  async function handleGenerate() {
    if (!regNo) {
      setStatus({ type: "error", msg: "Registration number not found." });
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo, format }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Generation failed");
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `resume_${regNo}.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus({ type: "success", msg: "Resume downloaded!" });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setStatus(null);
    setLoading(false);
  }

  const formatOptions = [
    { id: "pdf",  icon: "📕", label: "PDF",         hint: "Best for sharing" },
    { id: "docx", icon: "📘", label: "Word (.docx)", hint: "Best for editing" },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} style={styles.triggerBtn}>
        <span style={{ fontSize: 16 }}>📄</span> Generate Resume
      </button>

      {open && (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div style={styles.modal}>

            <div style={styles.header}>
              <h2 style={styles.title}>Generate Resume</h2>
              <button style={styles.closeBtn} onClick={handleClose}>✕</button>
            </div>

            <p style={styles.subtitle}>
              Your profile data will be used to build a professional resume.
            </p>

            <div style={styles.formatRow}>
              {formatOptions.map((f) => {
                const cardStyle = format === f.id
                  ? { ...styles.formatCard, ...styles.formatCardActive }
                  : styles.formatCard;
                return (
                  <div key={f.id} onClick={() => setFormat(f.id)} style={cardStyle}>
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <span style={styles.formatLabel}>{f.label}</span>
                    <span style={styles.formatHint}>{f.hint}</span>
                  </div>
                );
              })}
            </div>

            {status && (
              <div style={{ ...styles.status, ...(status.type === "success" ? styles.statusSuccess : styles.statusError) }}>
                {status.type === "success" ? "✅ " : "❌ "}{status.msg}
              </div>
            )}

            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={handleClose}>Cancel</button>
              <button
                style={{ ...styles.generateBtn, ...(loading ? styles.generateBtnDisabled : {}) }}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "⏳ Generating..." : "Generate & Download"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  triggerBtn:          { display: "inline-flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  overlay:             { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal:               { background: "#fff", borderRadius: 14, padding: 32, width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" },
  header:              { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title:               { margin: 0, fontSize: 20, fontWeight: 700, color: "#111" },
  closeBtn:            { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888", padding: "4px 8px", borderRadius: 6 },
  subtitle:            { color: "#6b7280", fontSize: 14, margin: "0 0 20px" },
  formatRow:           { display: "flex", gap: 12, marginBottom: 20 },
    formatCard:          { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", borderWidth: 2, borderStyle: "solid", borderColor: "#e5e7eb", borderRadius: 10, padding: "14px 8px", cursor: "pointer", textAlign: "center", userSelect: "none" },
    formatCardActive:    { borderColor: "#2563eb", background: "#eff6ff" },
  formatLabel:         { fontWeight: 700, fontSize: 14, color: "#111", marginTop: 6 },
  formatHint:          { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  status:              { padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 },
  statusSuccess:       { background: "#dcfce7", color: "#166534" },
  statusError:         { background: "#fee2e2", color: "#991b1b" },
  actions:             { display: "flex", gap: 10, justifyContent: "flex-end" },
  cancelBtn:           { padding: "9px 18px", borderRadius: 7, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 14, cursor: "pointer" },
  generateBtn:         { padding: "9px 20px", borderRadius: 7, background: "#2563eb", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  generateBtnDisabled: { background: "#93c5fd", cursor: "not-allowed" },
};
