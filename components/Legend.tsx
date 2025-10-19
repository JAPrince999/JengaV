
import React from 'react';

const LegendItem: React.FC<{ colorClass: string; label: string }> = ({ colorClass, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
    <span className="text-sm text-purple-200">{label}</span>
  </div>
);

const Legend: React.FC = () => {
  return (
    <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      <h4 className="font-semibold text-md mb-3 text-white">Legend</h4>
      <div className="flex items-center space-x-4">
        <LegendItem colorClass="bg-yellow-400" label="Filler Words" />
        <LegendItem colorClass="bg-red-500" label="Weak Language" />
        <LegendItem colorClass="bg-green-500" label="Strong Language" />
      </div>
    </div>
  );
};

export default Legend;