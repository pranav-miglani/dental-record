import api from './api';

export interface Patient {
  id: string;
  name: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  aadhaarLast4?: string;
  createdAt: string;
  updatedAt: string;
}

class PatientService {
  async getPatients(searchQuery?: string): Promise<Patient[]> {
    const params = searchQuery ? {search: searchQuery} : {};
    const response = await api.get<Patient[]>('/patients', {params});
    return response.data;
  }

  async getPatientById(patientId: string): Promise<Patient> {
    const response = await api.get<Patient>(`/patients/${patientId}`);
    return response.data;
  }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    const response = await api.post<Patient>('/patients', patientData);
    return response.data;
  }

  async updatePatient(
    patientId: string,
    patientData: Partial<Patient>,
  ): Promise<Patient> {
    const response = await api.put<Patient>(
      `/patients/${patientId}`,
      patientData,
    );
    return response.data;
  }
}

export const patientService = new PatientService();

