import { useState } from 'react';
import { analysisTasks, taskTypeLabels, materialTypeLabels } from '../data/prices';

interface AnalystWorkspaceProps {
  currentTaskIndex: number;
  onNextTask: () => void;
  onPrevTask: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  requirements: string;
  onRequirementsChange: (requirements: string) => void;
}

export function AnalystWorkspace({
  currentTaskIndex,
  onNextTask,
  onPrevTask,
  notes,
  onNotesChange,
  requirements,
  onRequirementsChange,
}: AnalystWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'task' | 'materials' | 'workspace'>('task');
  const [workspaceTab, setWorkspaceTab] = useState<'notes' | 'requirements' | 'diagram'>('notes');
  const [diagramNodes, setDiagramNodes] = useState<Array<{ id: string; type: string; label: string; x: number; y: number }>>([]);

  const currentTask = analysisTasks[currentTaskIndex];

  const addDiagramNode = (type: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      label: type === 'start' ? 'Начало' : type === 'end' ? 'Конец' : 'Новый элемент',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };
    setDiagramNodes([...diagramNodes, newNode]);
  };

  const removeNode = (id: string) => {
    setDiagramNodes(diagramNodes.filter(n => n.id !== id));
  };

  const updateNodeLabel = (id: string, label: string) => {
    setDiagramNodes(diagramNodes.map(n => n.id === id ? { ...n, label } : n));
  };

  if (!currentTask) {
    return (
      <div className="workspace analyst-workspace">
        <div className="completion-screen">
          <h2>Все задачи рассмотрены!</h2>
          <p>Ваши заметки и требования сохранены.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace analyst-workspace">
      {/* Левая панель - задача и материалы */}
      <div className="task-panel">
        <div className="task-tabs">
          <button
            className={`tab ${activeTab === 'task' ? 'active' : ''}`}
            onClick={() => setActiveTab('task')}
          >
            Задача
          </button>
          <button
            className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Материалы ({currentTask.materials.length})
          </button>
          <button
            className={`tab ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            Рабочая область
          </button>
        </div>

        {activeTab === 'task' && (
          <div className="task-content">
            <div className="task-header">
              <h2>{currentTask.title}</h2>
              <div className="task-meta">
                <span className="type-badge">
                  {taskTypeLabels[currentTask.type]}
                </span>
                <span className="time-limit">⏱️ {currentTask.timeLimit} мин</span>
              </div>
            </div>
            <div className="task-description">
              <pre>{currentTask.description}</pre>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="materials-content">
            <h3>Исходные материалы</h3>
            {currentTask.materials.map((material) => (
              <div key={material.id} className="material-card">
                <div className="material-header">
                  <span className="material-type">
                    {materialTypeLabels[material.type]}
                  </span>
                  <h4>{material.title}</h4>
                </div>
                <div className="material-content">
                  <pre>{material.content}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="workspace-content">
            <div className="workspace-tabs">
              <button
                className={`tab ${workspaceTab === 'notes' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('notes')}
              >
                Заметки
              </button>
              <button
                className={`tab ${workspaceTab === 'requirements' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('requirements')}
              >
                Требования
              </button>
              <button
                className={`tab ${workspaceTab === 'diagram' ? 'active' : ''}`}
                onClick={() => setWorkspaceTab('diagram')}
              >
                Диаграмма
              </button>
            </div>

            {workspaceTab === 'notes' && (
              <div className="notes-editor">
                <h4>Заметки по анализу</h4>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Записывайте свои наблюдения, вопросы и выводы..."
                />
              </div>
            )}

            {workspaceTab === 'requirements' && (
              <div className="requirements-editor">
                <h4>Список требований</h4>
                <div className="requirements-template">
                  <p>Используйте шаблон:</p>
                  <ul>
                    <li><strong>FR-001:</strong> [Функциональное требование]</li>
                    <li><strong>NFR-001:</strong> [Нефункциональное требование]</li>
                    <li><strong>MUST/SHOULD/COULD/WON'T:</strong> [Приоритет]</li>
                  </ul>
                </div>
                <textarea
                  value={requirements}
                  onChange={(e) => onRequirementsChange(e.target.value)}
                  placeholder="FR-001: Система должна позволять пользователю...&#10;Приоритет: MUST&#10;&#10;FR-002: ..."
                />
              </div>
            )}

            {workspaceTab === 'diagram' && (
              <div className="diagram-editor">
                <h4>Редактор диаграмм</h4>
                <div className="diagram-toolbar">
                  <button onClick={() => addDiagramNode('start')}>Начало</button>
                  <button onClick={() => addDiagramNode('process')}>Процесс</button>
                  <button onClick={() => addDiagramNode('decision')}>Решение</button>
                  <button onClick={() => addDiagramNode('end')}>Конец</button>
                  <button onClick={() => addDiagramNode('actor')}>Актор</button>
                  <button onClick={() => addDiagramNode('usecase')}>Use Case</button>
                </div>
                <div className="diagram-canvas">
                  {diagramNodes.length === 0 ? (
                    <p className="empty-message">
                      Нажмите на кнопки выше, чтобы добавить элементы диаграммы
                    </p>
                  ) : (
                    <div className="nodes-list">
                      {diagramNodes.map((node) => (
                        <div
                          key={node.id}
                          className={`diagram-node node-${node.type}`}
                        >
                          <input
                            type="text"
                            value={node.label}
                            onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                          />
                          <button
                            className="remove-btn"
                            onClick={() => removeNode(node.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="task-navigation">
          <button onClick={onPrevTask} disabled={currentTaskIndex === 0}>
            ← Предыдущая
          </button>
          <span className="task-counter">
            {currentTaskIndex + 1} / {analysisTasks.length}
          </span>
          <button onClick={onNextTask} disabled={currentTaskIndex === analysisTasks.length - 1}>
            Следующая →
          </button>
        </div>
      </div>

      {/* Правая панель - справочник аналитика */}
      <div className="reference-panel">
        <h3>Справочник аналитика</h3>

        <div className="reference-section">
          <h4>MoSCoW приоритизация</h4>
          <ul>
            <li><strong>Must have</strong> - обязательно для MVP</li>
            <li><strong>Should have</strong> - важно, но не критично</li>
            <li><strong>Could have</strong> - желательно при наличии ресурсов</li>
            <li><strong>Won't have</strong> - не в этой версии</li>
          </ul>
        </div>

        <div className="reference-section">
          <h4>Типы требований</h4>
          <ul>
            <li><strong>Функциональные (FR)</strong> - что система делает</li>
            <li><strong>Нефункциональные (NFR)</strong> - как система работает</li>
            <li><strong>Ограничения</strong> - технические/бизнес ограничения</li>
          </ul>
        </div>

        <div className="reference-section">
          <h4>Use Case структура</h4>
          <ul>
            <li><strong>Актор</strong> - кто использует систему</li>
            <li><strong>Предусловия</strong> - что должно быть до начала</li>
            <li><strong>Основной поток</strong> - успешный сценарий</li>
            <li><strong>Альтернативные потоки</strong> - другие пути</li>
            <li><strong>Постусловия</strong> - результат выполнения</li>
          </ul>
        </div>

        <div className="reference-section">
          <h4>BPMN элементы</h4>
          <ul>
            <li><strong>События</strong> - начало, конец, промежуточные</li>
            <li><strong>Активности</strong> - задачи, подпроцессы</li>
            <li><strong>Шлюзы</strong> - решения, параллельность</li>
            <li><strong>Потоки</strong> - связи между элементами</li>
          </ul>
        </div>

        <div className="reference-section">
          <h4>Вопросы для уточнения</h4>
          <ul>
            <li>Кто будет пользователем системы?</li>
            <li>Какие данные нужно хранить?</li>
            <li>Какие интеграции требуются?</li>
            <li>Какие ограничения есть?</li>
            <li>Какие метрики успеха?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
