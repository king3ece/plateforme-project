import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { FicheDescriptiveMissionAPI } from '../fdm';
import axiosInstance from '../axios';
import type { CreateFDMRequest } from '../../types/Fdm';

vi.mock('../axios', () => {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mock };
});

const mockedAxios = axiosInstance as unknown as {
  get: Mock;
  post: Mock;
  put: Mock;
  delete: Mock;
};

describe('FicheDescriptiveMissionAPI', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.put.mockReset();
    mockedAxios.delete.mockReset();
  });

  it('creates a mission with the expected payload and endpoint', async () => {
    const payload: CreateFDMRequest = {
      nomProjet: 'Audit pilote',
      lieuMission: 'Kara',
      dateDepart: '2024-06-01',
      dateProbableRetour: '2024-06-04',
      dureeMission: 3,
      objectifMission: 'Verifier les equipements',
      perdieme: 10000,
      transport: 8000,
      bonEssence: 5000,
      peage: 2000,
      laisserPasser: 1000,
      hotel: 12000,
      divers: 1500,
    };

    mockedAxios.post.mockResolvedValue({
      data: { object: { reference: 'FDM-123' } },
    });

    const response = await FicheDescriptiveMissionAPI.create(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith('/fdms/add-fdm', payload);
    expect(response.reference).toBe('FDM-123');
  });

  it('returns the user specific list when requesting my FDMs', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { object: { content: [{ reference: 'FDM-42' }] } },
    });

    const data = await FicheDescriptiveMissionAPI.getMyRequests(0, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith('/fdms/my-requests?page=0&size=10');
    expect(data).toHaveLength(1);
    expect(data[0].reference).toBe('FDM-42');
  });

  it('sends validator decisions to the traiter endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { object: 'ok' } });

    await FicheDescriptiveMissionAPI.traiter(7, {
      decision: 'VALIDER',
      commentaire: 'RAS',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/fdms/7/traiter', {
      decision: 'VALIDER',
      commentaire: 'RAS',
    });
  });
});
