import { useState } from 'react';
import { useInterview } from './hooks/useProject';
import { RoleSelection } from './components/RoleSelection';
import { DeveloperWorkspace } from './components/DeveloperWorkspace';
import { TesterWorkspace } from './components/TesterWorkspace';
import { AnalystWorkspace } from './components/AnalystWorkspace';
import { InterviewHeader } from './components/InterviewHeader';
import './App.css';

function App() {
  const interview = useInterview();
  const [showStartModal, setShowStartModal] = useState(false);

  const handleStartInterview = (timeLimit: number) => {
    interview.startInterview(timeLimit);
    setShowStartModal(false);
  };

  // Если роль не выбрана, показываем экран выбора роли
  if (!interview.state.currentRole) {
    return (
      <div className="app">
        <RoleSelection
          onSelectRole={interview.selectRole}
          candidateName={interview.state.candidateName}
          onCandidateNameChange={interview.setCandidateName}
        />
      </div>
    );
  }

  // Если интервью не начато, показываем модальное окно начала
  if (!interview.state.isInterviewStarted) {
    return (
      <div className="app">
        <div className="start-screen">
          <div className="start-card">
            <h1>Техническое интервью</h1>
            <div className="candidate-info">
              <p>Кандидат: <strong>{interview.state.candidateName || 'Не указано'}</strong></p>
              <p>Роль: <strong>
                {interview.state.currentRole === 'developer' && 'Разработчик'}
                {interview.state.currentRole === 'tester' && 'Тестировщик'}
                {interview.state.currentRole === 'analyst' && 'Аналитик'}
              </strong></p>
            </div>
            <div className="time-options">
              <h3>Выберите продолжительность:</h3>
              <div className="time-buttons">
                <button onClick={() => handleStartInterview(30)}>30 минут</button>
                <button onClick={() => handleStartInterview(45)}>45 минут</button>
                <button onClick={() => handleStartInterview(60)}>60 минут</button>
                <button onClick={() => handleStartInterview(90)}>90 минут</button>
              </div>
            </div>
            <button className="back-btn" onClick={interview.resetInterview}>
              Назад к выбору роли
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отрисовка рабочего пространства в зависимости от роли
  const renderWorkspace = () => {
    switch (interview.state.currentRole) {
      case 'developer':
        return (
          <DeveloperWorkspace
            code={interview.code}
            onCodeChange={interview.setCode}
            currentTaskIndex={interview.state.currentTaskIndex}
            onNextTask={interview.nextTask}
            onPrevTask={interview.prevTask}
            completedTasks={interview.state.completedTasks}
            onCompleteTask={interview.completeTask}
          />
        );
      case 'tester':
        return (
          <TesterWorkspace
            currentTaskIndex={interview.state.currentTaskIndex}
            onNextTask={interview.nextTask}
            onPrevTask={interview.prevTask}
            bugReports={interview.bugReports}
            testCases={interview.testCases}
            onAddBugReport={interview.addBugReport}
            onRemoveBugReport={interview.removeBugReport}
            onAddTestCase={interview.addTestCase}
            onRemoveTestCase={interview.removeTestCase}
          />
        );
      case 'analyst':
        return (
          <AnalystWorkspace
            currentTaskIndex={interview.state.currentTaskIndex}
            onNextTask={interview.nextTask}
            onPrevTask={interview.prevTask}
            notes={interview.analysisNotes}
            onNotesChange={interview.setAnalysisNotes}
            requirements={interview.requirements}
            onRequirementsChange={interview.setRequirements}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <InterviewHeader
        candidateName={interview.state.candidateName}
        role={interview.state.currentRole}
        timeRemaining={interview.state.timeRemaining}
        formatTime={interview.formatTime}
        onEndInterview={interview.resetInterview}
      />
      <main className="app-main">
        {renderWorkspace()}
      </main>
    </div>
  );
}

export default App;
