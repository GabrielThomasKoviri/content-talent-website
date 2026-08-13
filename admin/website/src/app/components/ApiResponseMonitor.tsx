import { useState, useEffect } from "react";
import { apiMonitorStore, ApiLogEntry } from "../services/apiMonitorService";
import { Terminal, ChevronDown, ChevronUp, Trash2, Copy, Check, ExternalLink, Code } from "lucide-react";

export default function ApiResponseMonitor() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = apiMonitorStore.subscribe((newLogs) => {
      setLogs(newLogs);
      if (!selectedLogId && newLogs.length > 0) {
        setSelectedLogId(newLogs[0].id);
      }
    });
    return unsubscribe;
  }, [selectedLogId]);

  const selectedLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans antialiased">
      {!isOpen ? (
        /* Collapsed Sticky Pill Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-slate-800 shadow-[0_4px_25px_rgba(124,58,237,0.3)] backdrop-blur-md transition-all duration-200 cursor-pointer group"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
          </span>
          <Terminal className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-wide">API Responses</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-[10px] font-mono text-purple-300 font-bold">
            {logs.length}
          </span>
          <ChevronUp className="h-4 w-4 text-slate-400" />
        </button>
      ) : (
        /* Expanded Sticky Monitor Drawer */
        <div className="w-[520px] max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col h-[420px] transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-purple-950 border border-purple-800 flex items-center justify-center">
                <Terminal className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Live Backend API Monitor</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">
                {logs.length} logged
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => apiMonitorStore.clear()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimize Monitor"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Body Split View */}
          <div className="grid grid-cols-5 flex-1 min-h-0 bg-slate-950">
            {/* Left sidebar: Endpoint List */}
            <div className="col-span-2 border-r border-slate-800/80 overflow-y-auto divide-y divide-slate-900/60 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const path = log.url.replace(/^https?:\/\/[^\/]+/, "").split("?")[0];
                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLogId(log.id)}
                    className={`w-full text-left p-2.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-purple-950/40 text-white border-l-2 border-purple-500"
                        : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-purple-400">
                        {log.method}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          log.ok ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono truncate w-full" title={log.url}>
                      {path || "/"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </button>
                );
              })}
            </div>

            {/* Right sidebar: JSON Viewer */}
            <div className="col-span-3 flex flex-col min-h-0 bg-slate-900/50">
              {selectedLog ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <Code className="h-3 w-3 text-purple-400 flex-shrink-0" />
                      <span className="text-[10px] font-mono text-slate-300 truncate" title={selectedLog.url}>
                        {selectedLog.url.replace(/^https?:\/\/[^\/]+/, "")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-purple-300 transition-colors flex-shrink-0"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
                    <pre className="whitespace-pre-wrap break-all">
                      {JSON.stringify(selectedLog.data, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
                  Select a request to view response
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
