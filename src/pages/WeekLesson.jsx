import React, { useState } from 'react';
import { hciCourseWeeks as weekData } from '../hciCourseData';

const WeekLesson = ({ weekNum, user, onNavigate, onExerciseComplete, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExercise, setShowExercise] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const week = weekData[weekNum];
  if (!week) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Week {weekNum} not found</h1>
          <button onClick={() => onNavigate('home')} className="px-6 py-3 bg-cyan-600 text-white rounded-lg">Back to Home</button>
        </div>
      </div>
    );
  }

  const totalSteps = week.content.length + 1;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleAnswer = (qIndex, optIndex) => { 
    if (!submitted) setAnswers({ ...answers, [qIndex]: optIndex }); 
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = week.exercises.filter((ex, i) => answers[i] === ex.correct).length;
    const score = Math.round((correct / week.exercises.length) * 100);
    onExerciseComplete(weekNum, score);
  };

  const renderContent = (item, index) => {
    if (item.type === 'intro') {
      return (
        <div key={index} className="bg-gradient-to-r from-cyan-900/50 to-slate-800/50 rounded-2xl p-8 border border-cyan-500/30">
          <h2 className="text-2xl font-bold text-white mb-2">{item.titleEn}</h2>
          <p className="text-cyan-300/70 font-arabic mb-4">{item.titleAr}</p>
          <p className="text-slate-300 mb-2 leading-relaxed">{item.contentEn}</p>
          <p className="text-cyan-300/70 font-arabic leading-relaxed">{item.contentAr}</p>
        </div>
      );
    }
    if (item.type === 'concept') {
      return (
        <div key={index} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-2">{item.titleEn}</h3>
          <p className="text-cyan-300/70 font-arabic mb-4">{item.titleAr}</p>
          <p className="text-slate-300 mb-2 leading-relaxed">{item.contentEn}</p>
          <p className="text-cyan-300/70 font-arabic mb-4 leading-relaxed">{item.contentAr}</p>
          {item.keyPoints && (
            <ul className="space-y-3 mt-4">
              {item.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                  <span className="text-cyan-400 mt-0.5 text-lg">•</span>
                  <div>
                    <span className="text-white font-medium block">{point.en}</span>
                    <span className="text-cyan-300/70 font-arabic text-sm block mt-1">{point.ar}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (item.type === 'code') {
      return (
        <div key={index} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-2">{item.titleEn}</h3>
          <p className="text-cyan-300/70 font-arabic mb-4">{item.titleAr}</p>
          <pre className="bg-slate-900 rounded-xl p-4 overflow-x-auto mb-4">
            <code className="text-cyan-400 text-sm font-mono">{item.code}</code>
          </pre>
          <p className="text-slate-300 text-sm">{item.explanation}</p>
          <p className="text-cyan-300/70 font-arabic text-sm mt-1">{item.explanationAr}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30">
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <span>←</span> Back to Course
            </button>
            <div className="text-center">
              <h1 className="text-white font-bold text-sm">Week {weekNum}: {week.titleEn}</h1>
              <p className="text-cyan-300/70 text-xs font-arabic">{week.titleAr}</p>
            </div>
            <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {currentStep === 0 && week.video && (
          <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 mb-8">
            <div className="aspect-video">
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${week.video.youtubeId}`} 
                title={week.video.title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1">{week.video.title}</h2>
              <p className="text-cyan-300/70 font-arabic mb-2">{week.video.titleAr}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{week.video.description}</p>
            </div>
          </div>
        )}

        {currentStep > 0 && currentStep <= week.content.length && (
          <div className="mb-8">{renderContent(week.content[currentStep - 1], currentStep - 1)}</div>
        )}

        {showExercise && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Exercise | تمرين الأسبوع</h2>
                <p className="text-cyan-300/70 font-arabic text-sm">أجب عن الأسئلة التالية لاجتياز الأسبوع واحتساب الدرجة</p>
              </div>
              <span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm font-semibold">
                {week.exercises.length} Questions
              </span>
            </div>

            <div className="space-y-6">
              {week.exercises.map((ex, qIndex) => (
                <div key={qIndex} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/40">
                  <p className="text-white font-medium mb-1 text-base">{qIndex + 1}. {ex.q}</p>
                  <p className="text-cyan-300/70 font-arabic text-sm mb-4">{ex.qAr}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ex.options.map((opt, optIndex) => {
                      const isSelected = answers[qIndex] === optIndex;
                      const isCorrect = ex.correct === optIndex;
                      let btnClass = 'p-3 rounded-lg border text-left transition-all text-sm leading-snug ';
                      if (submitted) {
                        if (isCorrect) btnClass += 'bg-cyan-600/30 border-cyan-500 text-cyan-300 font-semibold';
                        else if (isSelected && !isCorrect) btnClass += 'bg-red-600/30 border-red-500 text-red-300';
                        else btnClass += 'bg-slate-700/50 border-slate-600 text-slate-400';
                      } else {
                        btnClass += isSelected 
                          ? 'bg-cyan-600/30 border-cyan-500 text-white font-medium ring-2 ring-cyan-500/50' 
                          : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700';
                      }
                      return (
                        <button key={optIndex} onClick={() => handleAnswer(qIndex, optIndex)} className={btnClass} disabled={submitted}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!submitted ? (
              <button 
                onClick={handleSubmit} 
                disabled={Object.keys(answers).length < week.exercises.length} 
                className="mt-6 w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-600/30"
              >
                Submit Answers | إرسال الإجابات
              </button>
            ) : (
              <div className="mt-6 text-center bg-slate-900/60 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {Math.round((week.exercises.filter((ex, i) => answers[i] === ex.correct).length / week.exercises.length) * 100)}%
                </div>
                <p className="text-slate-300 font-medium">
                  {week.exercises.filter((ex, i) => answers[i] === ex.correct).length} / {week.exercises.length} correct | إجابات صحيحة
                </p>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="mt-5 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-600/30"
                >
                  Back to Course | العودة للدورة
                </button>
              </div>
            )}
          </div>
        )}

        {!showExercise && (
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
              disabled={currentStep === 0} 
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              ← Previous
            </button>
            {currentStep < week.content.length ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)} 
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
              >
                Next →
              </button>
            ) : (
              <button 
                onClick={() => setShowExercise(true)} 
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-cyan-600/30"
              >
                Start Exercise | بدء التمرين
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekLesson;
