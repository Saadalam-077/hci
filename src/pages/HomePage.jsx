import React from 'react';

const HomePage = ({ user, onNavigate, onLogout }) => {
  const weeks = [
    { week: 1, titleEn: "Introduction to HCI", titleAr: "مقدمة في تفاعل الإنسان والحاسب", icon: "🖥️" },
    { week: 2, titleEn: "Human Factors & Cognition", titleAr: "العوامل البشرية والإدراك المعرفي", icon: "🧠" },
    { week: 3, titleEn: "Interaction Styles & Direct Manipulation", titleAr: "أساليب التفاعل والمعالجة المباشرة", icon: "🖱️" },
    { week: 4, titleEn: "Usability & Nielsen Heuristics", titleAr: "قابلية الاستخدام وقواعد نيلسن", icon: "📐" },
    { week: 5, titleEn: "User-Centered Design & Personas", titleAr: "التصميم المتمحور حول المستخدم وبناء الشخصيات", icon: "👥" },
    { week: 6, titleEn: "Prototyping & Wireframing", titleAr: "النماذج الأولية والتخطيط الهيكلي", icon: "📱" },
    { week: 7, titleEn: "Visual Design & UI Layouts", titleAr: "التصميم المرئي وتخطيط الواجهات", icon: "🎨" },
    { week: 8, titleEn: "Usability Testing & Evaluation", titleAr: "اختبار قابلية الاستخدام وطرق التقييم", icon: "🧪" },
    { week: 9, titleEn: "Accessibility (a11y) & Inclusivity", titleAr: "إمكانية الوصول والتصميم الشامل", icon: "♿" },
    { week: 10, titleEn: "Emerging HCI & AI Interfaces", titleAr: "واجهات التفاعل الذكية ومستقبل HCI", icon: "🤖" },
  ];

  const completedWeeks = Object.entries(user.progress).filter(([key, val]) => val.completed && parseInt(key.replace('week', '')) <= 10).length;
  const progressPercent = Math.round((completedWeeks / 10) * 100);

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-cyan-400';
    if (grade === 'B+' || grade === 'B') return 'text-blue-400';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-400';
    if (grade === 'D+' || grade === 'D') return 'text-orange-400';
    if (grade === 'F') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30">
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-600/30">
                <span className="text-white font-black text-xs">HCI</span>
              </div>
              <div>
                <h1 className="text-white font-bold">Human-Computer Interaction</h1>
                <p className="text-cyan-300/70 text-xs font-arabic">تفاعل الإنسان والحاسب</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{user.studentName.charAt(0)}</div>
                <div className="text-left hidden sm:block">
                  <p className="text-white text-sm font-semibold">{user.studentName}</p>
                  <p className="text-slate-400 text-xs">{user.studentNumber}</p>
                </div>
              </button>
              <button onClick={onLogout} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="https://t.me/+B2zs30x2p9dhNzRk" target="_blank" rel="noopener noreferrer" className="block mb-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 hover:from-blue-500 hover:to-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Join Our Telegram Channel!</h3>
                <p className="text-white/80 text-sm">انضم لقناة التليجرام للدعم والتحديثات</p>
              </div>
            </div>
            <div className="text-white text-2xl">→</div>
          </div>
        </a>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Overall Progress | التقدم العام</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-white">{progressPercent}%</span>
              <span className="text-slate-400 text-sm mb-1">{completedWeeks}/10 weeks</span>
            </div>
            <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Current Grade | الدرجة الحالية</h3>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${getGradeColor(user.overallGrade)}`}>{user.overallGrade}</span>
              <span className="text-slate-400 text-sm mb-1">{user.totalScore}% avg</span>
            </div>
            <p className="text-slate-500 text-xs mt-3">Based on completed exercises</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Student Info | معلومات الطالب</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Name:</span><span className="text-white text-sm">{user.studentName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">ID:</span><span className="text-white text-sm font-mono">{user.studentNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 text-sm">Section:</span><span className="text-cyan-400 text-sm">{user.sectionNumber}</span></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Course Weeks</h2>
          <p className="text-cyan-300/70 font-arabic">أسابيع الدورة</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {weeks.map((week) => {
            const weekProgress = user.progress[`week${week.week}`];
            const isCompleted = weekProgress?.completed;
            const score = weekProgress?.score || 0;
            return (
              <div key={week.week} onClick={() => onNavigate(`week${week.week}`)} className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${isCompleted ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-700/30 border-slate-600 hover:border-cyan-500/50'}`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2 ${isCompleted ? 'bg-cyan-600' : 'bg-cyan-700'}`}>{isCompleted ? '✓' : week.icon}</div>
                  <span className="text-xs text-cyan-400 font-semibold">Week {week.week}</span>
                  <h4 className="text-white font-semibold text-sm">{week.titleEn}</h4>
                  <p className="text-cyan-300/60 text-xs font-arabic">{week.titleAr}</p>
                </div>
                {isCompleted ? (
                  <div className="mt-3 flex items-center justify-center bg-slate-800/50 rounded-lg p-2">
                    <span className={`font-bold text-sm ${score >= 90 ? 'text-cyan-400' : score >= 75 ? 'text-blue-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}%</span>
                  </div>
                ) : (
                  <div className="mt-3 text-center"><span className="text-slate-400 text-xs">Click →</span></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Contact & Support</h2>
            <p className="text-cyan-300/70 font-arabic">التواصل والدعم</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="https://t.me/+B2zs30x2p9dhNzRk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
              <div className="text-left"><p className="text-white font-bold">Telegram Channel</p><p className="text-white/70 text-sm">قناة التليجرام</p></div>
            </a>
            <div className="text-center md:text-left">
              <p className="text-slate-400">Prepared by | إعداد</p>
              <p className="text-white font-semibold text-lg">Saad Alamri</p>
              <p className="text-cyan-300/70 font-arabic">سعد العمري</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center border-t border-slate-800 mt-8">
        <p className="text-slate-500 text-sm">Human-Computer Interaction (HCI) | تفاعل الإنسان والحاسب | Taif University</p>
        <p className="text-slate-600 text-xs mt-2">College of Computers & Information Technology | كلية الحاسبات وتقنية المعلومات</p>
      </footer>
    </div>
  );
};

export default HomePage;
