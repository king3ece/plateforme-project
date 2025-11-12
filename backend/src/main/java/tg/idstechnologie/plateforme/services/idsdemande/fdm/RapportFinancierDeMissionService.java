package tg.idstechnologie.plateforme.services.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.idsdemande.TypeProcessusRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.RapportFinancierDeMissionRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.TraitementRapportFinancierDeMissionRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.fdm.RapportFinancierDeMissionInterface;
import tg.idstechnologie.plateforme.mail.EmailService;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.RapportFinancierDeMission;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementRapportFinancierDeMission;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class RapportFinancierDeMissionService implements RapportFinancierDeMissionInterface {

    private static final String PROCESS_CODE = "RFDM";

    private final RapportFinancierDeMissionRepository rapportRepo;
    private final TraitementRapportFinancierDeMissionRepository traitementRepo;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final TypeProcessusRepository typeProcessusRepository;
    private final ValidateurRepository validateurRepository;
    private final EmailService emailService;

    @Override
    public ResponseModel createEntity(RapportFinancierDeMission rapport) {
        validateRapport(rapport);

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode(PROCESS_CODE);
        if (typeProcessus.isEmpty()) {
            throw new ObjectNotValidException("Type de processus RFDM introuvable");
        }

        rapport.setEmetteur(emetteur.get());
        rapport.setTypeProcessus(typeProcessus.get());
        rapport.setTotalDepenses(calculerTotalDepenses(rapport));

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        if (validateurList.isEmpty()) {
            throw new ObjectNotValidException("Aucun validateur configuré pour RFDM");
        }

        rapport.setValidateurSuivant(validateurList.getFirst());
        rapport.setDateEmission(LocalDateTime.now());

        RapportFinancierDeMission saved = rapportRepo.save(rapport);
        emailService.sendMailNewFdm(saved.getValidateurSuivant().getUser().getEmail(), saved.getId().toString(), emetteur.get().getEmail());

        return new ResponseConstant().ok(saved);
    }

    @Override
    public ResponseModel updateEntity(RapportFinancierDeMission rapport) {
        if (rapport.getReference() == null || rapport.getReference().isBlank()) {
            throw new ObjectNotValidException("Référence obligatoire");
        }
        validateRapport(rapport);

        Optional<RapportFinancierDeMission> result = rapportRepo.findByReference(rapport.getReference());
        if (result.isEmpty()) {
            return new ResponseConstant().noContent("Rapport introuvable");
        }

        RapportFinancierDeMission entity = result.get();
        entity.setObjet(rapport.getObjet());
        entity.setDateDebut(rapport.getDateDebut());
        entity.setDateFin(rapport.getDateFin());
        entity.setHotelDejeuner(rapport.getHotelDejeuner());
        entity.setTelephone(rapport.getTelephone());
        entity.setTransport(rapport.getTransport());
        entity.setIndemnites(rapport.getIndemnites());
        entity.setLaisserPasser(rapport.getLaisserPasser());
        entity.setCoutDivers(rapport.getCoutDivers());
        entity.setMontantDepense(rapport.getMontantDepense());
        entity.setMontantRecu(rapport.getMontantRecu());
        entity.setCommentaire(rapport.getCommentaire());
        entity.setTotalDepenses(calculerTotalDepenses(rapport));

        rapportRepo.save(entity);
        return new ResponseConstant().ok("Rapport mis à jour avec succès");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(rapportRepo.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<RapportFinancierDeMission> rapport = rapportRepo.findByReference(ref);
        if (rapport.isPresent()) {
            return new ResponseConstant().ok(rapport.get());
        }
        return new ResponseConstant().noContent("Aucun rapport trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<RapportFinancierDeMission> rapport = rapportRepo.findByReference(ref);
        if (rapport.isPresent()) {
            RapportFinancierDeMission entity = rapport.get();
            entity.setDelete(true);
            rapportRepo.save(entity);
            return new ResponseConstant().ok("Rapport supprimé avec succès");
        }
        return new ResponseConstant().noContent("Aucun rapport trouvé");
    }

    @Override
    public ResponseModel getMyRequests(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(rapportRepo.findByEmetteurId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel getPendingValidations(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(rapportRepo.findPendingValidationsByUserId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel traiter(Long id, Choix_decisions decision, String commentaire) {
        User currentUser = currentUserService.getCurrentUser();

        RapportFinancierDeMission rapport = rapportRepo.findById(id)
                .orElseThrow(() -> new ObjectNotValidException("Rapport introuvable"));

        if (Boolean.TRUE.equals(rapport.getDelete())) {
            throw new ObjectNotValidException("Rapport supprimé");
        }

        if (rapport.isTraite()) {
            throw new ObjectNotValidException("Rapport déjà traité");
        }

        Validateur validateurSuivant = rapport.getValidateurSuivant();
        if (validateurSuivant == null || !validateurSuivant.getUser().getId().equals(currentUser.getId())) {
            throw new ObjectNotValidException("Vous n'êtes pas autorisé à traiter ce rapport");
        }

        TraitementRapportFinancierDeMission traitement = new TraitementRapportFinancierDeMission();
        traitement.setRapportFinancierDeMission(rapport);
        traitement.setTraiteur(currentUser);
        traitement.setDecision(decision);
        traitement.setCommentaire(commentaire);
        traitement.setDateTraitement(LocalDateTime.now());
        traitementRepo.save(traitement);

        rapport.setTraitementPrecedent(traitement);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        if (decision == Choix_decisions.VALIDER) {
            Optional<Validateur> next = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurSuivant.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (next.isPresent()) {
                rapport.setValidateurSuivant(next.get());
                emailService.sendMailNewFdm(next.get().getUser().getEmail(), rapport.getId().toString(), rapport.getEmetteur().getEmail());
            } else {
                rapport.setTraite(true);
                rapport.setFavorable(true);
                rapport.setValidateurSuivant(null);
                emailService.sendMailNewFdm(
                        rapport.getEmetteur().getEmail(),
                        rapport.getId().toString(),
                        "Votre rapport financier a été approuvé par tous les validateurs"
                );
            }
        } else if (decision == Choix_decisions.REJETER) {
            rapport.setTraite(true);
            rapport.setFavorable(false);
            rapport.setValidateurSuivant(null);
            emailService.sendMailNewFdm(
                    rapport.getEmetteur().getEmail(),
                    rapport.getId().toString(),
                    "Votre rapport financier a été rejeté: " + commentaire
            );
        } else if (decision == Choix_decisions.A_CORRIGER) {
            rapport.setTraite(false);
            Optional<Validateur> previous = validateurRepository.findPreviousValidator(
                    rapport.getTypeProcessus().getId(),
                    validateurSuivant.getOrdre()
            );

            previous.ifPresentOrElse(
                    rapport::setValidateurSuivant,
                    () -> {
                        if (!validateurList.isEmpty()) {
                            rapport.setValidateurSuivant(validateurList.getFirst());
                        }
                    }
            );

            emailService.sendMailNewFdm(
                    rapport.getEmetteur().getEmail(),
                    rapport.getId().toString(),
                    "Votre rapport financier nécessite des corrections: " + commentaire
            );
        }

        rapportRepo.save(rapport);
        return new ResponseConstant().ok("Traitement effectué avec succès");
    }

    private void validateRapport(RapportFinancierDeMission rapport) {
        if (rapport.getObjet() == null || rapport.getObjet().isBlank()) {
            throw new ObjectNotValidException("Objet obligatoire");
        }
        if (rapport.getDateDebut() == null || rapport.getDateDebut().isBefore(LocalDate.now().minusYears(1))) {
            throw new ObjectNotValidException("Date début invalide");
        }
        if (rapport.getDateFin() == null || rapport.getDateFin().isBefore(rapport.getDateDebut())) {
            throw new ObjectNotValidException("Date fin invalide");
        }

        rapport.setHotelDejeuner(normalize(rapport.getHotelDejeuner()));
        rapport.setTelephone(normalize(rapport.getTelephone()));
        rapport.setTransport(normalize(rapport.getTransport()));
        rapport.setIndemnites(normalize(rapport.getIndemnites()));
        rapport.setLaisserPasser(normalize(rapport.getLaisserPasser()));
        rapport.setCoutDivers(normalize(rapport.getCoutDivers()));
        rapport.setMontantDepense(normalize(rapport.getMontantDepense()));
        rapport.setMontantRecu(normalize(rapport.getMontantRecu()));
    }

    private double calculerTotalDepenses(RapportFinancierDeMission rapport) {
        return rapport.getHotelDejeuner()
                + rapport.getTelephone()
                + rapport.getTransport()
                + rapport.getIndemnites()
                + rapport.getLaisserPasser()
                + rapport.getCoutDivers();
    }

    private double normalize(Double value) {
        return value == null || value < 0 ? 0d : value;
    }
}
