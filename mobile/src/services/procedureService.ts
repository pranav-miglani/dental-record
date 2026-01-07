import api from './api';

export interface Procedure {
  id: string;
  patientId: string;
  type: 'RCT' | 'SCALING' | 'EXTRACTION';
  status: 'DRAFT' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  toothNumber?: string;
  diagnosis?: string;
  notes?: string;
  assignedBy: string;
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  isBackfilled: boolean;
  createdAt: string;
  updatedAt: string;
}

class ProcedureService {
  async getProcedures(patientId?: string): Promise<Procedure[]> {
    const params = patientId ? {patientId} : {};
    const response = await api.get<Procedure[]>('/procedures', {params});
    return response.data;
  }

  async getProcedureById(procedureId: string): Promise<Procedure> {
    const response = await api.get<Procedure>(`/procedures/${procedureId}`);
    return response.data;
  }

  async createProcedure(procedureData: Partial<Procedure>): Promise<Procedure> {
    const response = await api.post<Procedure>('/procedures', procedureData);
    return response.data;
  }

  async updateProcedure(
    procedureId: string,
    procedureData: Partial<Procedure>,
  ): Promise<Procedure> {
    const response = await api.put<Procedure>(
      `/procedures/${procedureId}`,
      procedureData,
    );
    return response.data;
  }
}

export const procedureService = new ProcedureService();

