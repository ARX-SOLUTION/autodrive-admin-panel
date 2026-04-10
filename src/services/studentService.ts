import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Student, CourseType } from '@/types/student';

// Demo data
const demoStudentsTezkor: Student[] = [
  { id: '1', familya: 'Karimov', ismi: 'Jasur', telefon: '+998901112233', kurs_narxi: 2500000, course_type: 'tezkor', branch_id: 'minor', branch_name: 'Minor', tulov_turi: 'naqd', tolov: 2500000, qarzdorlik: 0, dakument: '+', operator: 'Nilufar', natijasi: '✓', izoh: '', created_at: '2024-03-01' },
  { id: '2', familya: 'Aliyeva', ismi: 'Madina', telefon: '+998937778899', kurs_narxi: 2500000, course_type: 'tezkor', branch_id: 'minor', branch_name: 'Minor', tulov_turi: 'karta', tolov: 1500000, qarzdorlik: 1000000, dakument: '-', operator: 'Aziz', natijasi: '✗', izoh: 'Imtihonga kelmadi', created_at: '2024-03-05' },
  { id: '3', familya: 'Raximov', ismi: 'Bobur', telefon: '+998944445566', kurs_narxi: 2500000, course_type: 'tezkor', branch_id: 'chorsu', branch_name: 'Chorsu', tulov_turi: 'naqd', tolov: 2000000, qarzdorlik: 500000, dakument: '+', operator: 'Nilufar', natijasi: '✓', izoh: '', created_at: '2024-03-08' },
  { id: '4', familya: 'Toshmatov', ismi: 'Doniyor', telefon: '+998955556677', kurs_narxi: 2500000, course_type: 'tezkor', branch_id: 'novza', branch_name: 'Novza', tulov_turi: 'karta', tolov: 2500000, qarzdorlik: 0, dakument: '+', operator: 'Sherzod', natijasi: '✓', izoh: 'A\'lo natija', created_at: '2024-03-10' },
  { id: '5', familya: 'Ergasheva', ismi: 'Zulfia', telefon: '+998916667788', kurs_narxi: 2500000, course_type: 'tezkor', branch_id: 'samarqand', branch_name: 'Samarqand', tulov_turi: 'naqd', tolov: 500000, qarzdorlik: 2000000, dakument: '-', operator: 'Aziz', natijasi: '✗', izoh: 'Hujjat topshirmagan', created_at: '2024-03-12' },
];

const demoStudentsAvto: Student[] = [
  { id: '6', familya: 'Yusupov', ismi: 'Akmal', telefon: '+998901234567', kurs_narxi: 6000000, course_type: 'avto_maktab', branch_id: 'minor', branch_name: 'Minor', tulov_turi: 'naqd', boshlangich_tulov: 2000000, tulov_2: 2000000, tulov_3: 1500000, qarzdorlik: 500000, guruh: 'B-1', tugatish_sanasi: '2024-05-15', shartnoma_raqami: 'C-201', dakument: '+', operator: 'Nilufar', natijasi: '✓', izoh: '', created_at: '2024-03-01' },
  { id: '7', familya: 'Mirzo', ismi: 'Shahlo', telefon: '+998937654321', kurs_narxi: 6000000, course_type: 'avto_maktab', branch_id: 'chorsu', branch_name: 'Chorsu', tulov_turi: 'karta', boshlangich_tulov: 1000000, tulov_2: 200000, tulov_3: 400000, qarzdorlik: 4400000, guruh: 'B-2', tugatish_sanasi: '2024-06-01', shartnoma_raqami: 'C-202', dakument: '-', operator: 'Aziz', natijasi: '✗', izoh: 'To\'lov muddati o\'tgan', created_at: '2024-03-03' },
  { id: '8', familya: 'Qodirov', ismi: 'Firdavs', telefon: '+998945551122', kurs_narxi: 6000000, course_type: 'avto_maktab', branch_id: 'minor', branch_name: 'Minor', tulov_turi: 'naqd', boshlangich_tulov: 3000000, tulov_2: 2000000, tulov_3: 1000000, qarzdorlik: 0, guruh: 'B-1', tugatish_sanasi: '2024-05-15', shartnoma_raqami: 'C-203', dakument: '+', operator: 'Sherzod', natijasi: '✓', izoh: '', created_at: '2024-03-05' },
];

const allDemoStudents = [...demoStudentsTezkor, ...demoStudentsAvto];

export const useStudents = (courseType?: CourseType, branchId?: string) => {
  return useQuery<Student[]>({
    queryKey: ['students', courseType, branchId],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/students', { params: { course_type: courseType, branch_id: branchId } });
        return data;
      } catch {
        let filtered = allDemoStudents;
        if (courseType) filtered = filtered.filter((s) => s.course_type === courseType);
        if (branchId) filtered = filtered.filter((s) => s.branch_id === branchId);
        return filtered;
      }
    },
  });
};

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (student: Partial<Student>) => {
      const { data } = await axiosInstance.post('/students', student);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...student }: Partial<Student> & { id: string }) => {
      const { data } = await axiosInstance.put(`/students/${id}`, student);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/students/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};
