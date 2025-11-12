import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { RapportFinancierAPI } from "../rfdm";
import axiosInstance from "../axios";

vi.mock("../axios", () => {
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
};

describe("RapportFinancierAPI", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.put.mockReset();
  });

  it("envoie les bonnes données lors de la création d'un rapport", async () => {
    const payload = {
      objet: "Mission terrain",
      dateDebut: "2024-06-01",
      dateFin: "2024-06-05",
      hotelDejeuner: 10000,
      telephone: 2000,
      transport: 5000,
      indemnites: 3000,
      laisserPasser: 500,
      coutDivers: 800,
      montantRecu: 12000,
      montantDepense: 11000,
      commentaire: "RAS",
    };
    mockedAxios.post.mockResolvedValue({
      data: { object: { reference: "RFDM-1" } },
    });

    const result = await RapportFinancierAPI.create(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith("/rfdms/add-rfdm", payload);
    expect(result.reference).toBe("RFDM-1");
  });

  it("récupère les validations en attente", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { object: { content: [{ reference: "RFDM-42" }] } },
    });

    const data = await RapportFinancierAPI.getPendingValidations(0, 20);

    expect(mockedAxios.get).toHaveBeenCalledWith("/rfdms/pending-validations?page=0&size=20");
    expect(data[0].reference).toBe("RFDM-42");
  });
});
