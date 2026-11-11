import { supabase } from './supabaseClient';

const LOCAL_STUDENTS_KEY = 'hci_local_students';

// Local storage helpers
export function getLocalStudents() {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalStudents(students) {
  try {
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

// Check which table is available: 'hci_students' preferred, fallback to 'cp2_students'
let activeTable = 'hci_students';

export async function loginStudent(studentNumber, password) {
  // Password is checked inside the database (hci_students first, then cp2_students).
  try {
    const { data, error } = await supabase.rpc('hci_student_login', {
      p_student_number: studentNumber.trim(),
      p_password: password
    });
    if (!error && data?.success) {
      activeTable = data.source || 'hci_students';
      return { success: true, student: data };
    }
    if (error) console.warn('Supabase login failed, attempting local fallback', error);
  } catch (e) {
    console.warn('Supabase login failed, attempting local fallback', e);
  }

  // 3. Try local mock storage fallback
  const locals = getLocalStudents();
  const localMatch = locals.find(s => s.student_number === studentNumber && s.password === password);
  if (localMatch) {
    return { success: true, student: localMatch };
  }

  return { success: false };
}

export async function registerStudent(formData) {
  const newStudent = {
    student_name: formData.studentName,
    student_number: formData.studentNumber,
    section_number: formData.sectionNumber,
    password: formData.password,
    progress: {}
  };

  // Check if exists in local
  const locals = getLocalStudents();
  if (locals.some(s => s.student_number === formData.studentNumber)) {
    return { success: false, message: 'Student number already registered' };
  }

  try {
    const { data, error } = await supabase.rpc('hci_register_student', {
      p_student_name: formData.studentName.trim(),
      p_student_number: formData.studentNumber.trim(),
      p_section_number: formData.sectionNumber,
      p_password: formData.password
    });
    if (!error) {
      if (!data?.success) {
        return { success: false, message: 'Student number already registered in Supabase' };
      }
      activeTable = 'hci_students';
      return { success: true, student: data.student };
    }
    console.warn('Supabase registration failed, falling back to local storage', error);
  } catch (e) {
    console.warn('Supabase registration failed, falling back to local storage', e);
  }

  // 3. Fallback to local storage
  const mockStudent = {
    ...newStudent,
    id: 'local_' + Date.now()
  };
  locals.push(mockStudent);
  saveLocalStudents(locals);
  return { success: true, student: mockStudent };
}

export async function updateStudentProgress(studentId, newProgress) {
  // Update Supabase
  try {
    await supabase
      .from(activeTable)
      .update({ progress: newProgress })
      .eq('id', studentId);
  } catch (e) {
    console.warn('Supabase progress update failed:', e);
  }

  // Also update local storage if present
  const locals = getLocalStudents();
  const index = locals.findIndex(s => s.id === studentId);
  if (index !== -1) {
    locals[index].progress = newProgress;
    saveLocalStudents(locals);
  }
}

export async function fetchAllStudents() {
  let dbStudents = [];

  // Try active table
  try {
    const { data, error } = await supabase
      .from('hci_students')
      .select('id, student_name, student_number, section_number, progress')
      .order('student_name');

    if (!error && data && data.length > 0) {
      activeTable = 'hci_students';
      dbStudents = data;
    } else {
      // Try cp2_students
      const { data: cp2Data, error: cp2Error } = await supabase
        .from('cp2_students')
        .select('id, student_name, student_number, section_number, progress')
        .order('student_name');
      if (!cp2Error && cp2Data) {
        dbStudents = cp2Data;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch from Supabase:', e);
  }

  // Merge with local storage students (avoid duplicate IDs or student numbers)
  const locals = getLocalStudents();
  const merged = [...dbStudents];

  for (const local of locals) {
    if (!merged.some(m => m.student_number === local.student_number || m.id === local.id)) {
      merged.push(local);
    }
  }

  return merged;
}

export async function deleteStudentRecord(id) {
  try {
    await supabase.from(activeTable).delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete error:', e);
  }

  const locals = getLocalStudents().filter(s => s.id !== id);
  saveLocalStudents(locals);
}

export async function resetStudentRecordProgress(id) {
  try {
    await supabase.from(activeTable).update({ progress: {} }).eq('id', id);
  } catch (e) {
    console.warn('Supabase reset error:', e);
  }

  const locals = getLocalStudents();
  const idx = locals.findIndex(s => s.id === id);
  if (idx !== -1) {
    locals[idx].progress = {};
    saveLocalStudents(locals);
  }
}

export async function resetStudentPassword(studentNumber, recoveryCode, newPassword) {
  const { data, error } = await supabase.rpc('hci_reset_student_password', {
    p_student_number: studentNumber.trim(),
    p_recovery_code: recoveryCode.trim(),
    p_new_password: newPassword
  });
  if (error) {
    console.error('Password recovery error:', error);
    return false;
  }
  return data === true;
}
