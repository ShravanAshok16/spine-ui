import { BookPlus } from 'lucide-react';

export function EmptyLibrary({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-surface/50">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <BookPlus className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-serif font-bold mb-2">Your library is empty</h3>
      <p className="text-text-muted mb-6 max-w-sm mx-auto">
        Start building your digital shelf by scanning an ISBN or adding a book manually.
      </p>
      <button
        onClick={onAddClick}
        className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
      >
        Add Your First Book
      </button>
    </div>
  );
}