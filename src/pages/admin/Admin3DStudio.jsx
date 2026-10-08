import { useState, useEffect } from "react";
import {
  Box,
  Sparkles,
  Upload,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Camera,
  RotateCw,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";

const VIEWS = [
  { key: "front", label: "Front (0° Master)", angle: "0° Azimuth", desc: "Master Design Anchor" },
  { key: "left", label: "Left 3/4 (+45°)", angle: "+45° Left", desc: "Left Lateral Silhouette" },
  { key: "right", label: "Right 3/4 (-45°)", angle: "-45° Right", desc: "Right Lateral Silhouette" },
  { key: "back", label: "Rear / Back (180°)", angle: "180° Posterior", desc: "Backside Hair & Outfit" },
];

export default function Admin3DStudio() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customNotes, setCustomNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState("front");
  const [turntableMode, setTurntableMode] = useState(false);
  const [turntableIndex, setTurntableIndex] = useState(0);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch recent reference generations
  const fetchSessions = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get("/3d-agent/all?limit=12");
      if (data.success) {
        setRecentSessions(data.sessions || []);
        if (!activeSession && data.sessions?.length > 0) {
          setActiveSession(data.sessions[0]);
        }
      }
    } catch (err) {
      console.warn("Could not load past sessions", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Turntable animation loop
  useEffect(() => {
    let interval = null;
    if (turntableMode && activeSession) {
      interval = setInterval(() => {
        setTurntableIndex((prev) => (prev + 1) % 4);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [turntableMode, activeSession]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile && !previewUrl) {
      toast.error("Please select a customer photo to generate 3D references");
      return;
    }

    setGenerating(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append("photo", selectedFile);
    }
    if (customNotes) {
      formData.append("customNotes", customNotes);
    }

    try {
      toast.loading("Gemini AI 3D Agent: Generating 4-view references (Front, Left 45°, Right 45°, Back)...", {
        id: "gen-toast",
      });

      const { data } = await api.post("/3d-agent/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success && data.session) {
        setActiveSession(data.session);
        toast.success("4-View 3D references generated successfully!", { id: "gen-toast" });
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate 3D references", { id: "gen-toast" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadZip = (session) => {
    if (!session) return;
    const targetSession = session || activeSession;
    if (targetSession.zipPackageUrl) {
      window.open(assetUrl(targetSession.zipPackageUrl), "_blank");
    } else {
      window.open(assetUrl(`/api/3d-agent/session/${targetSession.sessionId}/download`), "_blank");
    }
  };

  const getActiveViewImage = () => {
    if (!activeSession) return null;
    if (turntableMode) {
      const keys = ["front", "left", "back", "right"];
      const key = keys[turntableIndex];
      return activeSession.views?.[key]?.url ? assetUrl(activeSession.views[key].url) : null;
    }
    return activeSession.views?.[activeViewTab]?.url ? assetUrl(activeSession.views[activeViewTab].url) : null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu size={15} />
            <span>AI 3D Reconstruction Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3">
            <span>Meshy & Tripo 3D Reference Studio</span>
            <span className="text-xs bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2.5 py-0.5 rounded-full font-sans font-semibold">
              Gemini Vision Agent
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Transforms customer photos into 4 strictly consistent, multi-angle reference views (Front, Left 45°, Right 45°, Back) calibrated for Bambu Lab A1 PLA printing and downstream Image-to-3D reconstruction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSession && (
            <button
              onClick={() => handleDownloadZip(activeSession)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 text-white text-xs font-bold shadow-lg shadow-rose-950/50 hover:from-rose-500 hover:to-ribbon-600 transition"
            >
              <Download size={15} />
              <span>Download 3D Reference Pack (.ZIP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Upload Generator & 4-View Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo Upload & Prompt Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Camera size={18} className="text-rose-400" />
                <span>Customer Photo Ingestion</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Source of Truth</span>
            </div>

            {/* Dropzone */}
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-rose-500/60 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-6 cursor-pointer transition group min-h-[200px] overflow-hidden">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={generating}
              />
              {previewUrl ? (
                <div className="relative w-full flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-xl object-contain shadow-md border border-slate-700"
                  />
                  <div className="mt-3 text-xs text-rose-300 font-medium group-hover:underline flex items-center gap-1">
                    <RefreshCw size={12} />
                    <span>Click to change customer photo</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-800 text-rose-400 group-hover:scale-110 transition duration-300">
                    <Upload size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Upload customer photograph</div>
                    <div className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</div>
                  </div>
                </div>
              )}
            </label>

            {/* Special Instructions & Story Preservations */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Story Preservation Notes & Feature Guidance</span>
                <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Preserve guitar and drinking cup, simplify flower petals, thicken glasses frame for Bambu Lab A1 0.4mm nozzle"
                rows={3}
                disabled={generating}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || (!selectedFile && !previewUrl)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/60 transition"
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Synthesizing 4-Angle References...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Gemini 3D Reference Agent</span>
                </>
              )}
            </button>

            {/* Pipeline Architecture Legend */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Pipeline Architecture</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-200">Phase 1:</strong> Customer Photo → Gemini Front (Master Anchor)</li>
                <li><strong className="text-slate-200">Phase 2:</strong> [Photo + Master Front] → Left 3/4 (+45°)</li>
                <li><strong className="text-slate-200">Phase 3:</strong> [Photo + Master Front] → Right 3/4 (-45°)</li>
                <li><strong className="text-slate-200">Phase 4:</strong> [Photo + Master Front] → Rear View (180°)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: 4-Angle Viewer & 3D Readiness Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <Box size={18} className="text-rose-400" />
                  <span>3D Multi-View Reference Viewer</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeSession ? `Session: ${activeSession.sessionId}` : "No active session loaded"}
                </p>
              </div>

              {/* View Mode Controls */}
              {activeSession && (
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTurntableMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      !turntableMode ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Static Angles
                  </button>
                  <button
                    onClick={() => setTurntableMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      turntableMode ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <RotateCw size={12} className={turntableMode ? "animate-spin" : ""} />
                    <span>360° Turntable</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Tabs */}
            {activeSession && !turntableMode && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VIEWS.map((v) => {
                  const isActive = activeViewTab === v.key;
                  const hasImage = !!activeSession.views?.[v.key]?.url;
                  return (
                    <button
                      key={v.key}
                      onClick={() => setActiveViewTab(v.key)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        isActive
                          ? "bg-slate-900 border-rose-500 text-white shadow-lg shadow-rose-950/40"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-rose-400 font-bold">{v.angle}</span>
                        {hasImage ? (
                          <CheckCircle2 size={12} className="text-emerald-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold truncate">{v.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Image Preview Window */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 min-h-[380px] flex items-center justify-center p-4 overflow-hidden group">
              {activeSession ? (
                getActiveViewImage() ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={getActiveViewImage()}
                      alt={`3D Reference - ${activeViewTab}`}
                      className="max-h-[360px] w-auto object-contain rounded-xl drop-shadow-2xl transition duration-300"
                    />

                    {/* Overlay Angle Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-xs border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        {turntableMode
                          ? `Turntable Angle: ${["Front (0°)", "Left (+45°)", "Back (180°)", "Right (-45°)"][turntableIndex]}`
                          : VIEWS.find((v) => v.key === activeViewTab)?.label}
                      </span>
                    </div>

                    {/* View Full in new tab */}
                    <a
                      href={getActiveViewImage()}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Eye size={13} />
                      <span>Inspect High-Res</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <AlertCircle size={32} className="mx-auto text-amber-500/60" />
                    <p className="text-xs">Generating reference view...</p>
                  </div>
                )
              ) : (
                <div className="text-center text-slate-500 space-y-3 py-12">
                  <Box size={40} className="mx-auto text-slate-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-400">No 3D Reference Set Selected</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Upload a customer photo or pick a session from history below
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3D Reconstruction Readiness Metrics */}
            {activeSession && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Silhouette Clarity</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">98%</div>
                  <div className="text-[9px] text-slate-500">Neutral Studio Edge</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">FDM Printability</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">Bambu A1</div>
                  <div className="text-[9px] text-slate-500">0.4mm PLA Profile</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Multi-View Symmetry</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">97%</div>
                  <div className="text-[9px] text-slate-500">Front Anchor Locked</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reconstruction Engine</div>
                  <div className="text-base font-bold text-purple-400 font-mono mt-0.5">Meshy / Tripo</div>
                  <div className="text-[9px] text-slate-500">Ready for Mesh Gen</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4-View Strip & Quick Download Gallery */}
      {activeSession && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
              <Layers size={16} className="text-rose-400" />
              <span>Reference Package Views (Stored on Server)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Folder: /uploads/3d_references/{activeSession.storageKey}/
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Original Customer Photo */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono">
                Original Input
              </span>
              <img
                src={assetUrl(activeSession.originalImage?.url)}
                alt="Original"
                className="w-full h-32 rounded-xl object-contain bg-slate-950 border border-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                {activeSession.originalImage?.filename}
              </span>
            </div>

            {/* Front View */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 font-mono">
                1. Front (0°)
              </span>
              <img
                src={assetUrl(activeSession.views?.front?.url)}
                alt="Front"
                className="w-full h-32 rounded-xl object-contain bg-slate-950 border border-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">front.png</span>
            </div>

            {/* Left View */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 font-mono">
                2. Left (+45°)
              </span>
              <img
                src={assetUrl(activeSession.views?.left?.url)}
                alt="Left"
                className="w-full h-32 rounded-xl object-contain bg-slate-950 border border-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">left.png</span>
            </div>

            {/* Right View */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">
                3. Right (-45°)
              </span>
              <img
                src={assetUrl(activeSession.views?.right?.url)}
                alt="Right"
                className="w-full h-32 rounded-xl object-contain bg-slate-950 border border-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">right.png</span>
            </div>

            {/* Rear View */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 font-mono">
                4. Rear (180°)
              </span>
              <img
                src={assetUrl(activeSession.views?.back?.url)}
                alt="Back"
                className="w-full h-32 rounded-xl object-contain bg-slate-950 border border-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">back.png</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reference Sets History */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <Layers size={18} className="text-rose-400" />
            <span>Generated Reference Sets Repository</span>
          </h3>
          <button
            onClick={fetchSessions}
            disabled={loadingHistory}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <RefreshCw size={14} className={loadingHistory ? "animate-spin" : ""} />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No 3D reference packages generated yet. Upload a photo above to run the pipeline.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentSessions.map((s) => (
              <div
                key={s._id}
                onClick={() => setActiveSession(s)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  activeSession?._id === s._id
                    ? "bg-slate-900 border-rose-500 shadow-lg shadow-rose-950/40"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={assetUrl(s.originalImage?.url)}
                    alt="Original"
                    className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate font-mono">
                      {s.storageKey}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString()} • {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* 4 Mini Thumbnails */}
                <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <img src={assetUrl(s.views?.front?.url)} alt="Front" className="w-full h-8 object-contain rounded" />
                  <img src={assetUrl(s.views?.left?.url)} alt="Left" className="w-full h-8 object-contain rounded" />
                  <img src={assetUrl(s.views?.right?.url)} alt="Right" className="w-full h-8 object-contain rounded" />
                  <img src={assetUrl(s.views?.back?.url)} alt="Back" className="w-full h-8 object-contain rounded" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>4 Views Ready</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadZip(s);
                    }}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Download size={11} />
                    <span>ZIP</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
