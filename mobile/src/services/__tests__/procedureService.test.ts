import {procedureService} from '../procedureService';
import api from '../api';

jest.mock('../api');

describe('ProcedureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProcedures', () => {
    it('should fetch all procedures', async () => {
      const mockProcedures = [
        {
          id: 'proc-1',
          patientId: 'patient-1',
          type: 'RCT' as const,
          status: 'IN_PROGRESS' as const,
          assignedBy: 'doctor-1',
          assignedDate: '2025-01-01',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({data: mockProcedures});

      const result = await procedureService.getProcedures();

      expect(api.get).toHaveBeenCalledWith('/procedures', {params: {}});
      expect(result).toEqual(mockProcedures);
    });

    it('should fetch procedures for a specific patient', async () => {
      const mockProcedures = [
        {
          id: 'proc-1',
          patientId: 'patient-1',
          type: 'RCT' as const,
          status: 'IN_PROGRESS' as const,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({data: mockProcedures});

      const result = await procedureService.getProcedures('patient-1');

      expect(api.get).toHaveBeenCalledWith('/procedures', {
        params: {patientId: 'patient-1'},
      });
      expect(result).toEqual(mockProcedures);
    });
  });

  describe('getProcedureById', () => {
    it('should fetch procedure by ID', async () => {
      const mockProcedure = {
        id: 'proc-1',
        patientId: 'patient-1',
        type: 'RCT' as const,
        status: 'IN_PROGRESS' as const,
      };

      (api.get as jest.Mock).mockResolvedValue({data: mockProcedure});

      const result = await procedureService.getProcedureById('proc-1');

      expect(api.get).toHaveBeenCalledWith('/procedures/proc-1');
      expect(result).toEqual(mockProcedure);
    });
  });

  describe('createProcedure', () => {
    it('should create a new procedure', async () => {
      const newProcedure = {
        patientId: 'patient-1',
        type: 'RCT' as const,
        toothNumber: '11',
      };

      const mockResponse = {
        id: 'proc-2',
        ...newProcedure,
        status: 'DRAFT' as const,
        assignedBy: 'doctor-1',
        assignedDate: '2025-01-01',
        isBackfilled: false,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      };

      (api.post as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await procedureService.createProcedure(newProcedure);

      expect(api.post).toHaveBeenCalledWith('/procedures', newProcedure);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProcedure', () => {
    it('should update an existing procedure', async () => {
      const updates = {status: 'CLOSED' as const};
      const mockResponse = {
        id: 'proc-1',
        patientId: 'patient-1',
        type: 'RCT' as const,
        status: 'CLOSED' as const,
      };

      (api.put as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await procedureService.updateProcedure('proc-1', updates);

      expect(api.put).toHaveBeenCalledWith('/procedures/proc-1', updates);
      expect(result).toEqual(mockResponse);
    });
  });
});

