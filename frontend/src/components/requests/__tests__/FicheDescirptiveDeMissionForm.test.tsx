import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterAll } from 'vitest';
import { MissionForm } from '../FicheDescirptiveDeMissionForm';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('MissionForm', () => {
  it('submits mission data with computed duration and numbers', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<MissionForm onSave={handleSave} isLoading={false} />);

    await user.type(screen.getByLabelText(/Nom du projet/i), 'Audit interne');
    await user.type(screen.getByLabelText(/Lieu de la mission/i), 'Kara');
    await user.type(screen.getByLabelText(/Objectif de la mission/i), 'Verifier les ateliers');
    await user.type(screen.getByLabelText(/Date de départ/i), '2024-08-10');
    await user.type(screen.getByLabelText(/Date probable de retour/i), '2024-08-12');

    await user.clear(screen.getByLabelText(/Per diem/i));
    await user.type(screen.getByLabelText(/Per diem/i), '1000');
    await user.clear(screen.getByLabelText(/Transport/i));
    await user.type(screen.getByLabelText(/Transport/i), '500');
    await user.clear(screen.getByLabelText(/Bon essence/i));
    await user.type(screen.getByLabelText(/Bon essence/i), '300');
    await user.clear(screen.getByLabelText(/Péage/i));
    await user.type(screen.getByLabelText(/Péage/i), '200');
    await user.clear(screen.getByLabelText(/Laisser-passer/i));
    await user.type(screen.getByLabelText(/Laisser-passer/i), '100');
    await user.clear(screen.getByLabelText(/Hôtel/i));
    await user.type(screen.getByLabelText(/Hôtel/i), '250');
    await user.clear(screen.getByLabelText(/Divers/i));
    await user.type(screen.getByLabelText(/Divers/i), '150');

    await user.click(screen.getByRole('button', { name: /Soumettre/i }));

    await waitFor(() => expect(handleSave).toHaveBeenCalled());

    const payload = handleSave.mock.calls[0][0];
    expect(payload.nomProjet).toBe('Audit interne');
    expect(payload.dureeMission).toBe(2);
    expect(payload.perdieme).toBe(1000);
    expect(payload.transport).toBe(500);
    expect(payload.bonEssence).toBe(300);
    expect(payload.divers).toBe(150);
  });
});
