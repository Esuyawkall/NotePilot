type UploadProps = {
  fileType: "text" | "audio";
  onClose: () => void;
  onFileRead?: (content: string | File) => void;
};

export default function Upload({ fileType, onClose, onFileRead }: UploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileType === "text") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onFileRead?.(text);
      };
      reader.readAsText(file);
    }

    if (fileType === "audio") {
      onFileRead?.(file);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          aria-label="Close upload dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          onClick={onClose}
        >
          ×
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-emerald-400">
              Import data
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-zinc-50">
              {fileType === "text" ? "Upload Text File" : "Upload Audio File"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              {fileType === "text"
                ? "Add your notes or transcript to generate a summary instantly."
                : "Upload a recording to transcribe and summarize it automatically."}
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/80">
            <input
              className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-700 file:mr-4 file:rounded-l-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-300"
              onChange={handleFileChange}
              type="file"
              accept={fileType === "text" ? ".txt,.md" : "audio/*"}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-500 dark:to-cyan-500 dark:text-zinc-950 dark:shadow-emerald-500/20 dark:hover:from-emerald-400 dark:hover:to-cyan-400"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
