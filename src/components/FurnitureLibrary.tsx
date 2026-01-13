import React, { useState } from 'react';
import { FurnitureCategory, FurnitureTemplate } from '../types';
import { furnitureTemplates, categoryNames, categoryIcons } from '../data/furniture';
import './FurnitureLibrary.css';

interface FurnitureLibraryProps {
  onDragStart?: (templateId: string) => void;
}

export const FurnitureLibrary: React.FC<FurnitureLibraryProps> = ({ onDragStart }) => {
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (FurnitureCategory | 'all')[] = [
    'all',
    'seating',
    'tables',
    'storage',
    'beds',
    'kitchen',
    'bathroom',
    'appliances',
    'decor',
  ];

  const filteredFurniture = furnitureTemplates.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, template: FurnitureTemplate) => {
    e.dataTransfer.setData('furnitureTemplateId', template.id);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(template.id);
  };

  return (
    <div className="furniture-library">
      <div className="library-header">
        <h3>Библиотека мебели</h3>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="library-search"
        />
      </div>

      <div className="library-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? '📋' : categoryIcons[cat]} {cat === 'all' ? 'Все' : categoryNames[cat]}
          </button>
        ))}
      </div>

      <div className="library-items">
        {filteredFurniture.map((template) => (
          <div
            key={template.id}
            className="furniture-item"
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            style={{ borderColor: template.color }}
          >
            <div
              className="furniture-preview"
              style={{ backgroundColor: template.color }}
            >
              <span className="furniture-icon">{template.icon}</span>
            </div>
            <div className="furniture-info">
              <div className="furniture-name">{template.name}</div>
              <div className="furniture-size">
                {template.defaultSize.width} × {template.defaultSize.height} см
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="library-hint">
        Перетащите элемент на план комнаты
      </div>
    </div>
  );
};
