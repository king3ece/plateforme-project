package tg.idstechnologie.plateforme.services.statistics;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tg.idstechnologie.plateforme.dao.idsdemande.bonpour.BonPourRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.dda.DemandeAchatRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.FicheDescriptiveMissionRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.RapportFinancierDeMissionRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.utils.Choix_decisions;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.secu.user.User;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserStatisticsService {

    private final FicheDescriptiveMissionRepository fdmRepository;
    private final BonPourRepository bonPourRepository;
    private final RapportFinancierDeMissionRepository rfdmRepository;
    private final DemandeAchatRepository demandeAchatRepository;
    private final UserRepository userRepository;

    public ResponseModel getUserDashboardStatistics(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        UserDashboardStats stats = new UserDashboardStats();

        // FDM Statistics
        stats.fdmTotal = fdmRepository.countByEmetteurAndDeleteFalse(user);
        stats.fdmEnAttente = fdmRepository.countByEmetteurAndTraitementPrecedentIsNullAndDeleteFalse(user);
        stats.fdmValidees = fdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.VALIDER);
        stats.fdmRejetees = fdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.REJETER);
        stats.fdmACorreiger = fdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.A_CORRIGER);

        // BonPour Statistics
        stats.bonPourTotal = bonPourRepository.countByEmetteurAndDeleteFalse(user);
        stats.bonPourEnAttente = bonPourRepository.countByEmetteurAndTraitementPrecedentIsNullAndDeleteFalse(user);
        stats.bonPourValidees = bonPourRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.VALIDER);
        stats.bonPourRejetees = bonPourRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.REJETER);
        stats.bonPourACorreiger = bonPourRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.A_CORRIGER);

        // RFDM Statistics
        stats.rfdmTotal = rfdmRepository.countByEmetteurAndDeleteFalse(user);
        stats.rfdmEnAttente = rfdmRepository.countByEmetteurAndTraitementPrecedentIsNullAndDeleteFalse(user);
        stats.rfdmValidees = rfdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.VALIDER);
        stats.rfdmRejetees = rfdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.REJETER);
        stats.rfdmACorreiger = rfdmRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.A_CORRIGER);

        // DDA Statistics
        stats.ddaTotal = demandeAchatRepository.countByEmetteurAndDeleteFalse(user);
        stats.ddaEnAttente = demandeAchatRepository.countByEmetteurAndTraitementPrecedentIsNullAndDeleteFalse(user);
        stats.ddaValidees = demandeAchatRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.VALIDER);
        stats.ddaRejetees = demandeAchatRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.REJETER);
        stats.ddaACorreiger = demandeAchatRepository.countByEmetteurAndTraitementPrecedentDecisionAndDeleteFalse(user, Choix_decisions.A_CORRIGER);

        // Global Statistics
        stats.totalDemandes = stats.fdmTotal + stats.bonPourTotal + stats.rfdmTotal + stats.ddaTotal;
        stats.totalEnAttente = stats.fdmEnAttente + stats.bonPourEnAttente + stats.rfdmEnAttente + stats.ddaEnAttente;
        stats.totalValidees = stats.fdmValidees + stats.bonPourValidees + stats.rfdmValidees + stats.ddaValidees;
        stats.totalRejetees = stats.fdmRejetees + stats.bonPourRejetees + stats.rfdmRejetees + stats.ddaRejetees;
        stats.totalACorreiger = stats.fdmACorreiger + stats.bonPourACorreiger + stats.rfdmACorreiger + stats.ddaACorreiger;

        return new ResponseModel(200, "Statistiques récupérées avec succès", stats);
    }

    @Data
    public static class UserDashboardStats {
        // FDM
        private long fdmTotal;
        private long fdmEnAttente;
        private long fdmValidees;
        private long fdmRejetees;
        private long fdmACorreiger;

        // BonPour
        private long bonPourTotal;
        private long bonPourEnAttente;
        private long bonPourValidees;
        private long bonPourRejetees;
        private long bonPourACorreiger;

        // RFDM
        private long rfdmTotal;
        private long rfdmEnAttente;
        private long rfdmValidees;
        private long rfdmRejetees;
        private long rfdmACorreiger;

        // DDA
        private long ddaTotal;
        private long ddaEnAttente;
        private long ddaValidees;
        private long ddaRejetees;
        private long ddaACorreiger;

        // Global
        private long totalDemandes;
        private long totalEnAttente;
        private long totalValidees;
        private long totalRejetees;
        private long totalACorreiger;
    }
}
