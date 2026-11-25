import { Check, Copy, Download, Printer, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { UiLocaleStrings } from '../data/locales';
import type { SavedReplyItem } from '../types/replycue';

interface SavedLibrarySectionProps {
  locale: UiLocaleStrings;
  savedReplies: SavedReplyItem[];
  onTogglePrintSelection: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onExportJson: () => void;
  onImportJsonFile: (file: File) => Promise<boolean>;
  onPrintSelected: () => void;
}

export function SavedLibrarySection({
  locale,
  savedReplies,
  onTogglePrintSelection,
  onUpdateNote,
  onDeleteItem,
  onClearAll,
  onExportJson,
  onImportJsonFile,
  onPrintSelected,
}: SavedLibrarySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await onImportJsonFile(file);
    setImportStatus(ok ? 'success' : 'error');
    e.target.value = '';
    window.setTimeout(() => setImportStatus('idle'), 4000);
  };

  const selectedCount = savedReplies.filter((r) => r.selectedForPrint).length;

  return (
    <section
      id="saved"
      aria-labelledby="saved-library-heading"
      className="no-print rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2
              id="saved-library-heading"
              className="font-display text-xl font-semibold text-slate-900"
            >
              {locale.savedSection.title}
            </h2>
            <span className="font-mono-num text-xs font-medium text-slate-500">
              ({savedReplies.length})
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{locale.savedSection.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{locale.savedSection.exportJson}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{locale.savedSection.importJson}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-label={locale.savedSection.importJson}
          />

          <button
            type="button"
            onClick={onPrintSelected}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {locale.savedSection.printSelected}
              {selectedCount > 0 ? ` (${selectedCount})` : ''}
            </span>
          </button>

          {savedReplies.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.savedSection.clearAll}</span>
            </button>
          )}
        </div>
      </div>

      {importStatus !== 'idle' && (
        <div
          role="status"
          className={`mt-4 rounded-lg border px-4 py-2.5 text-xs font-medium ${
            importStatus === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {importStatus === 'success'
            ? locale.savedSection.importSuccess
            : locale.savedSection.importError}
        </div>
      )}

      {savedReplies.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-[#F8FAFC] px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-800">{locale.savedSection.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
            {locale.savedSection.emptyBody}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {savedReplies.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-slate-700">
                        {locale.categories[item.category]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{locale.variants[item.variantKind]?.label ?? item.tone}</span>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.selectedForPrint}
                        onChange={() => onTogglePrintSelection(item.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span>{locale.savedSection.selectForPrint}</span>
                    </label>
                  </div>

                  <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                    {item.scenarioTitle}
                  </h3>

                  <p className="mt-2.5 whitespace-pre-line rounded-md border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800">
                    {item.text}
                  </p>
                </div>

                <div className="mt-3 flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => onUpdateNote(item.id, e.target.value)}
                    placeholder={locale.savedSection.notePlaceholder}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.text)}
                      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        isCopied
                          ? 'bg-[#059669] text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {isCopied ? locale.composer.copiedBtn : locale.composer.copyBtn}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{locale.savedSection.deleteBtn}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
