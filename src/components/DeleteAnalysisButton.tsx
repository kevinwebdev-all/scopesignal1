"use client";

interface DeleteAnalysisButtonProps {
  onDelete: () => void;
}

export function DeleteAnalysisButton({ onDelete }: DeleteAnalysisButtonProps) {
  function handleClick() {
    const confirmed = window.confirm(
      "Delete this analysis from this browser? This cannot be undone.",
    );

    if (confirmed) {
      onDelete();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
    >
      Delete
    </button>
  );
}
