import DraftsClient from "./DraftsClient";

export default async function DraftsPage() {
  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold mb-1">Drafts & Scene Editor</h2>
        <p className="text-sm text-[var(--text-secondary)]">Kelola hasil prompt AI Anda. Paste JSON dari AI untuk memecah scene secara otomatis.</p>
      </div>

      <DraftsClient />
    </div>
  );
}
