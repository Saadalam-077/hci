import React, { useState, useEffect } from 'react';
import { fetchAllStudents, deleteStudentRecord, resetStudentRecordProgress } from '../dbService';

const AdminDashboard = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const list = await fetchAllStudents();
    setStudents(list);
    setLoading(false);
  };

  const calculateGrade = (progress) => {
    const scores = Object.values(progress || {}).filter(p => p.completed).map(p => p.score);
    if (scores.length === 0) return { grade: 'N/A', avg: 0 };
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    let grade = 'F';
    if (avg >= 95) grade = 'A+'; else if (avg >= 90) grade = 'A'; else if (avg >= 85) grade = 'B+';
    else if (avg >= 80) grade = 'B'; else if (avg >= 75) grade = 'C+'; else if (avg >= 70) grade = 'C';
    else if (avg >= 65) grade = 'D+'; else if (avg >= 60) grade = 'D';
    return { grade, avg };
  };

  const filteredStudents = students.filter(s => {
    const matchSection = filter === 'all' || s.section_number === filter;
    const matchSearch = !searchTerm || 
      (s.student_name && s.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.student_number && s.student_number.includes(searchTerm));
    return matchSection && matchSearch;
  });

  const sections = [...new Set(students.map(s => s.section_number).filter(Boolean))].sort();

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-cyan-400';
    if (grade === 'B+' || grade === 'B') return 'text-blue-400';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-400';
    if (grade === 'D+' || grade === 'D') return 'text-orange-400';
    if (grade === 'F') return 'text-red-400';
    return 'text-slate-400';
  };

  const safeConfirm = (msg) => {
    try {
      return typeof window !== 'undefined' && window.confirm ? window.confirm(msg) : true;
    } catch {
      return true;
    }
  };

  const deleteStudent = async (id, name) => {
    if (!safeConfirm(`Are you sure you want to delete ${name}?`)) return;
    await deleteStudentRecord(id);
    setStudents(students.filter(s => s.id !== id));
  };

  const resetProgress = async (id, name) => {
    if (!safeConfirm(`Reset all progress for ${name}?`)) return;
    await resetStudentRecordProgress(id);
    setStudents(students.map(s => s.id === id ? { ...s, progress: {} } : s));
  };

  const exportCSV = () => {
    const rows = [
      ['Student Name', 'Student ID', 'Section', 'Completed Weeks', 'Average %', 'Grade']
    ];
    filteredStudents.forEach(s => {
      const { grade, avg } = calculateGrade(s.progress);
      const completed = Object.values(s.progress || {}).filter(p => p.completed).length;
      rows.push([s.student_name, s.student_number, s.section_number, `${completed}/10`, `${avg}%`, grade]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hci_students_grades_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30">
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-600/30">
                <span className="text-white font-black">👑</span>
              </div>
              <div>
                <h1 className="text-white font-bold">Admin Dashboard | لوحة التحكم</h1>
                <p className="text-cyan-300/70 text-xs">Human-Computer Interaction | تفاعل الإنسان والحاسب</p>
              </div>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Total Students</h3>
            <p className="text-4xl font-bold text-white">{students.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Sections</h3>
            <p className="text-4xl font-bold text-cyan-400">{sections.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Completed Course</h3>
            <p className="text-4xl font-bold text-blue-400">{students.filter(s => Object.values(s.progress || {}).filter(p => p.completed).length >= 10).length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-slate-400 text-sm mb-2">Average Score</h3>
            <p className="text-4xl font-bold text-yellow-400">{students.length > 0 ? Math.round(students.reduce((sum, s) => sum + calculateGrade(s.progress).avg, 0) / students.length) : 0}%</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Students List | قائمة الطلاب</h2>
              <p className="text-slate-400 text-xs mt-1">Synced with Supabase & local records</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or ID..."
                className="px-3 py-2 bg-slate-700/70 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                <option value="all">All Sections</option>
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
              <button onClick={exportCSV} className="px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm transition-colors">
                Export CSV
              </button>
              <button onClick={fetchStudents} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm">
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-slate-400 mt-4">Loading students...</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredStudents.map((student) => {
                    const { grade, avg } = calculateGrade(student.progress);
                    const completedWeeks = Object.values(student.progress || {}).filter(p => p.completed).length;
                    return (
                      <tr key={student.id} className="hover:bg-slate-700/30">
                        <td className="px-6 py-4"><div><p className="text-white font-medium">{student.student_name}</p><p className="text-slate-400 text-sm font-mono">{student.student_number}</p></div></td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm font-medium">{student.section_number}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${(completedWeeks / 10) * 100}%` }} /></div>
                            <span className="text-slate-400 text-sm">{completedWeeks}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className={`font-bold ${getGradeColor(grade)}`}>{grade}</span><span className="text-slate-500 text-sm ml-2">({avg}%)</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => resetProgress(student.id, student.student_name)} className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-sm">Reset</button>
                            <button onClick={() => deleteStudent(student.id, student.student_name)} className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredStudents.length === 0 && <div className="p-12 text-center text-slate-400">No students found</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
