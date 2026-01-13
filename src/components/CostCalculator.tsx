import React, { useState, useMemo } from 'react';
import { Room, ProjectEstimate, RoomEstimate } from '../types';
import { calculateProjectEstimate, formatCurrency, formatArea } from '../utils/calculations';
import { complexityMultipliers } from '../data/prices';
import './CostCalculator.css';

interface CostCalculatorProps {
  rooms: Room[];
  onClose: () => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ rooms, onClose }) => {
  const [complexity, setComplexity] = useState<keyof typeof complexityMultipliers>('standard');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const baseEstimate = useMemo(() => calculateProjectEstimate(rooms), [rooms]);

  const multiplier = complexityMultipliers[complexity].multiplier;

  const adjustedEstimate: ProjectEstimate = useMemo(
    () => ({
      ...baseEstimate,
      rooms: baseEstimate.rooms.map((room) => ({
        ...room,
        materials: room.materials.map((m) => ({
          ...m,
          total: m.total * multiplier,
        })),
        labor: room.labor.map((l) => ({
          ...l,
          total: l.total * multiplier,
          daysEstimate: l.daysEstimate * multiplier,
        })),
        totalMaterials: room.totalMaterials * multiplier,
        totalLabor: room.totalLabor * multiplier,
        totalDays: room.totalDays * multiplier,
      })),
      totalMaterials: baseEstimate.totalMaterials * multiplier,
      totalLabor: baseEstimate.totalLabor * multiplier,
      grandTotal: baseEstimate.grandTotal * multiplier,
      totalDaysEstimate: Math.ceil(baseEstimate.totalDaysEstimate * multiplier),
    }),
    [baseEstimate, multiplier]
  );

  const handleExportPDF = () => {
    // Создаём печатную версию
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Смета ремонта</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          h2 { color: #555; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .summary { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 1.5em; color: #2196F3; }
        </style>
      </head>
      <body>
        <h1>Смета ремонта квартиры</h1>
        <p>Тип ремонта: ${complexityMultipliers[complexity].name}</p>
        <p>Общая площадь: ${formatArea(adjustedEstimate.totalArea)}</p>

        ${adjustedEstimate.rooms
          .map(
            (room) => `
          <h2>${room.roomName} (${formatArea(room.area)})</h2>

          <h3>Материалы</h3>
          <table>
            <tr><th>Наименование</th><th>Кол-во</th><th>Цена за ед.</th><th>Сумма</th></tr>
            ${room.materials
              .map(
                (m) => `
              <tr>
                <td>${m.name}</td>
                <td>${m.quantity.toFixed(2)} ${m.unit}</td>
                <td>${formatCurrency(m.pricePerUnit)}</td>
                <td>${formatCurrency(m.total)}</td>
              </tr>
            `
              )
              .join('')}
            <tr class="total-row">
              <td colspan="3">Итого материалы:</td>
              <td>${formatCurrency(room.totalMaterials)}</td>
            </tr>
          </table>

          <h3>Работы</h3>
          <table>
            <tr><th>Наименование</th><th>Объём</th><th>Цена за ед.</th><th>Сумма</th><th>Дней</th></tr>
            ${room.labor
              .map(
                (l) => `
              <tr>
                <td>${l.name}</td>
                <td>${l.quantity.toFixed(2)} ${l.unit}</td>
                <td>${formatCurrency(l.pricePerUnit)}</td>
                <td>${formatCurrency(l.total)}</td>
                <td>${l.daysEstimate.toFixed(1)}</td>
              </tr>
            `
              )
              .join('')}
            <tr class="total-row">
              <td colspan="3">Итого работы:</td>
              <td>${formatCurrency(room.totalLabor)}</td>
              <td>${room.totalDays.toFixed(1)}</td>
            </tr>
          </table>
        `
          )
          .join('')}

        <div class="summary">
          <h2>Итоговая смета</h2>
          <div class="summary-row">
            <span>Материалы:</span>
            <strong>${formatCurrency(adjustedEstimate.totalMaterials)}</strong>
          </div>
          <div class="summary-row">
            <span>Работы:</span>
            <strong>${formatCurrency(adjustedEstimate.totalLabor)}</strong>
          </div>
          <div class="summary-row">
            <span>Ориентировочный срок:</span>
            <strong>${adjustedEstimate.totalDaysEstimate} дней</strong>
          </div>
          <div class="summary-row grand-total">
            <span>ИТОГО:</span>
            <strong>${formatCurrency(adjustedEstimate.grandTotal)}</strong>
          </div>
        </div>

        <p style="margin-top: 40px; color: #888; font-size: 12px;">
          * Смета составлена автоматически. Фактические цены могут отличаться в зависимости от региона и выбранных материалов.
        </p>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  if (rooms.length === 0) {
    return (
      <div className="cost-calculator-overlay">
        <div className="cost-calculator">
          <div className="calculator-header">
            <h2>Калькулятор стоимости ремонта</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="calculator-empty">
            <p>Добавьте комнаты на план для расчёта стоимости ремонта</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cost-calculator-overlay">
      <div className="cost-calculator">
        <div className="calculator-header">
          <h2>Калькулятор стоимости ремонта</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="calculator-content">
          <div className="complexity-selector">
            <label>Тип ремонта:</label>
            <div className="complexity-buttons">
              {(Object.keys(complexityMultipliers) as (keyof typeof complexityMultipliers)[]).map(
                (key) => (
                  <button
                    key={key}
                    className={`complexity-btn ${complexity === key ? 'active' : ''}`}
                    onClick={() => setComplexity(key)}
                  >
                    {complexityMultipliers[key].name}
                    <span className="multiplier">×{complexityMultipliers[key].multiplier}</span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="calculator-summary">
            <div className="summary-card">
              <div className="summary-value">{formatArea(adjustedEstimate.totalArea)}</div>
              <div className="summary-label">Общая площадь</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(adjustedEstimate.totalMaterials)}</div>
              <div className="summary-label">Материалы</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatCurrency(adjustedEstimate.totalLabor)}</div>
              <div className="summary-label">Работы</div>
            </div>
            <div className="summary-card highlight">
              <div className="summary-value">{formatCurrency(adjustedEstimate.grandTotal)}</div>
              <div className="summary-label">Итого</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{adjustedEstimate.totalDaysEstimate} дней</div>
              <div className="summary-label">Срок работ</div>
            </div>
          </div>

          <div className="rooms-breakdown">
            <h3>Детализация по комнатам</h3>
            {adjustedEstimate.rooms.map((room) => (
              <div key={room.roomId} className="room-estimate">
                <div
                  className="room-estimate-header"
                  onClick={() =>
                    setExpandedRoom(expandedRoom === room.roomId ? null : room.roomId)
                  }
                >
                  <div className="room-estimate-title">
                    <span className="expand-icon">{expandedRoom === room.roomId ? '▼' : '▶'}</span>
                    {room.roomName}
                    <span className="room-area">({formatArea(room.area)})</span>
                  </div>
                  <div className="room-estimate-total">
                    {formatCurrency(room.totalMaterials + room.totalLabor)}
                  </div>
                </div>

                {expandedRoom === room.roomId && (
                  <div className="room-estimate-details">
                    <div className="estimate-section">
                      <h4>Материалы</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Наименование</th>
                            <th>Кол-во</th>
                            <th>Цена</th>
                            <th>Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {room.materials.map((m, idx) => (
                            <tr key={idx}>
                              <td>{m.name}</td>
                              <td>
                                {m.quantity.toFixed(2)} {m.unit}
                              </td>
                              <td>{formatCurrency(m.pricePerUnit)}</td>
                              <td>{formatCurrency(m.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3}>
                              <strong>Итого материалы:</strong>
                            </td>
                            <td>
                              <strong>{formatCurrency(room.totalMaterials)}</strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="estimate-section">
                      <h4>Работы</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Наименование</th>
                            <th>Объём</th>
                            <th>Цена</th>
                            <th>Сумма</th>
                            <th>Дней</th>
                          </tr>
                        </thead>
                        <tbody>
                          {room.labor.map((l, idx) => (
                            <tr key={idx}>
                              <td>{l.name}</td>
                              <td>
                                {l.quantity.toFixed(2)} {l.unit}
                              </td>
                              <td>{formatCurrency(l.pricePerUnit)}</td>
                              <td>{formatCurrency(l.total)}</td>
                              <td>{l.daysEstimate.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3}>
                              <strong>Итого работы:</strong>
                            </td>
                            <td>
                              <strong>{formatCurrency(room.totalLabor)}</strong>
                            </td>
                            <td>
                              <strong>{room.totalDays.toFixed(1)}</strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="calculator-footer">
          <button className="export-btn" onClick={handleExportPDF}>
            📄 Экспорт сметы
          </button>
        </div>
      </div>
    </div>
  );
};
