import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { DemandeAchatAPI } from "../dda";
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
};

describe("DemandeAchatAPI", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  it("crée une demande d'achat avec les lignes attendues", async () => {
    const payload = {
      destination: "Service IT",
      fournisseur: "TechSupplier",
      service: "Informatique",
      client: "Direction",
      montantProjet: 15000,
      commentaire: "Renouvellement matériel",
      lignes: [
        { designation: "PC Portable", ligneReference: "PC-01", prixUnitaire: 1200, quantite: 5 },
      ],
    };

    mockedAxios.post.mockResolvedValue({
      data: { object: { reference: "DDA-1" } },
    });

    const result = await DemandeAchatAPI.create(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith("/ddas/add-dda", payload);
    expect(result.reference).toBe("DDA-1");
  });

  it("charge les demandes d'achat à valider", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { object: { content: [{ reference: "DDA-99" }] } },
    });

    const data = await DemandeAchatAPI.getPendingValidations();
    expect(mockedAxios.get).toHaveBeenCalledWith("/ddas/pending-validations?page=0&size=30");
    expect(data[0].reference).toBe("DDA-99");
  });
});
