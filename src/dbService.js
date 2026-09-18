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
  // 1. Try preferred table 'hci_students'
  try {
    const { data, error } = await supabase
      .from('hci_students')
      .select('*')
      .eq('student_number', studentNumber)
      .eq('password', password)
      .single();

    if (!error && data) {
      activeTable = 'hci_students';
      return { success: true, student: data };
    }
  } catch (e) {
    console.warn('hci_students query failed, attempting cp2_students fallback', e);
  }

  // 2. Try fallback table 'cp2_students'
  try {
    const { data, error } = await supabase
      .from('cp2_students')
      .select('*')
      .eq('student_number', studentNumber)
      .eq('password', password)
      .single();

    if (!error && data) {
      activeTable = 'cp2_students';
      return { success: true, student: data };
    }
  } catch (e) {
    console.warn('cp2_students query failed, attempting local fallback', e);
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

  // 1. Try inserting to 'hci_students'
  try {
    const { data: existing } = await supabase
      .from('hci_students')
      .select('id')
      .eq('student_number', formData.studentNumber)
      .single();

    if (existing) {
      return { success: false, message: 'Student number already registered in Supabase' };
    }

    const { data, error } = await supabase
      .from('hci_students')
      .insert([newStudent])
      .select()
      .single();

    if (!error && data) {
      activeTable = 'hci_students';
      return { success: true, student: data };
    }
  } catch (e) {
    console.warn('Supabase hci_students insert failed, attempting cp2_students or local fallback', e);
  }

  // 2. Try inserting to 'cp2_students'
  try {
    const { data: existing } = await supabase
      .from('cp2_students')
      .select('id')
      .eq('student_number', formData.studentNumber)
      .single();

    if (existing) {
      return { success: false, message: 'Student number already registered in Supabase' };
    }

    const { data, error } = await supabase
      .from('cp2_students')
      .insert([newStudent])
      .select()
      .single();

    if (!error && data) {
      activeTable = 'cp2_students';
      return { success: true, student: data };
    }
  } catch (e) {
    console.warn('Supabase cp2_students insert failed, falling back to local storage', e);
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
      .select('*')
      .order('student_name');

    if (!error && data && data.length > 0) {
      activeTable = 'hci_students';
      dbStudents = data;
    } else {
      // Try cp2_students
      const { data: cp2Data, error: cp2Error } = await supabase
        .from('cp2_students')
        .select('*')
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
