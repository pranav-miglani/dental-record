import {patientService} from '../patientService';
import api from '../api';

jest.mock('../api');

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatients', () => {
    it('should fetch all patients', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          name: 'John Doe',
          mobileNumber: '9999999999',
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({data: mockPatients});

      const result = await patientService.getPatients();

      expect(api.get).toHaveBeenCalledWith('/patients', {params: {}});
      expect(result).toEqual(mockPatients);
    });

    it('should fetch patients with search query', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          name: 'John Doe',
          mobileNumber: '9999999999',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({data: mockPatients});

      const result = await patientService.getPatients('John');

      expect(api.get).toHaveBeenCalledWith('/patients', {
        params: {search: 'John'},
      });
      expect(result).toEqual(mockPatients);
    });
  });

  describe('getPatientById', () => {
    it('should fetch patient by ID', async () => {
      const mockPatient = {
        id: 'patient-1',
        name: 'John Doe',
        mobileNumber: '9999999999',
      };

      (api.get as jest.Mock).mockResolvedValue({data: mockPatient});

      const result = await patientService.getPatientById('patient-1');

      expect(api.get).toHaveBeenCalledWith('/patients/patient-1');
      expect(result).toEqual(mockPatient);
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      const newPatient = {
        name: 'Jane Doe',
        mobileNumber: '8888888888',
        dateOfBirth: '1995-05-15',
        gender: 'FEMALE' as const,
      };

      const mockResponse = {
        id: 'patient-2',
        ...newPatient,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      };

      (api.post as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await patientService.createPatient(newPatient);

      expect(api.post).toHaveBeenCalledWith('/patients', newPatient);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePatient', () => {
    it('should update an existing patient', async () => {
      const updates = {name: 'Jane Smith'};
      const mockResponse = {
        id: 'patient-1',
        name: 'Jane Smith',
        mobileNumber: '9999999999',
      };

      (api.put as jest.Mock).mockResolvedValue({data: mockResponse});

      const result = await patientService.updatePatient('patient-1', updates);

      expect(api.put).toHaveBeenCalledWith('/patients/patient-1', updates);
      expect(result).toEqual(mockResponse);
    });
  });
});

