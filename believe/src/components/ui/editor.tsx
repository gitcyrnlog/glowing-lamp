import React from 'react';

// This is a placeholder component for a rich text editor
// In a real implementation, you would use a proper rich text editor like TipTap, Quill, or Draft.js
export function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="border border-gray-700 rounded-md p-2 bg-gray-800">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[200px] bg-transparent outline-none resize-y"
        placeholder="Write your content here..."
      />
      <div className="text-xs text-gray-400 mt-2">
        Rich text editor placeholder. In production, implement with TipTap, Quill, or similar.
      </div>
    </div>
  );
}
