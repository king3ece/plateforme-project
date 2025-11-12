package tg.idstechnologie.plateforme.services.idsdemande.dda;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.idsdemande.TypeProcessusRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.dda.DemandeAchatRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.dda.LigneDemandeAchatRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.dda.TraitementDemandeAchatRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.dda.DemandeAchatInterface;
import tg.idstechnologie.plateforme.mail.EmailService;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.models.idsdemande.dda.DemandeDachat;
import tg.idstechnologie.plateforme.models.idsdemande.dda.LigneDemandeAchat;
import tg.idstechnologie.plateforme.models.idsdemande.dda.TraitementDemandeDachat;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.utils.Choix_decisions;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class DemandeAchatService implements DemandeAchatInterface {

    private static final String PROCESS_CODE = "DDA";

    private final DemandeAchatRepository demandeRepo;
    private final LigneDemandeAchatRepository ligneRepo;
    private final TraitementDemandeAchatRepository traitementRepo;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final TypeProcessusRepository typeProcessusRepository;
    private final ValidateurRepository validateurRepository;
    private final EmailService emailService;

    @Override
    public ResponseModel createEntity(DemandeDachat demandeDachat) {
        validateDemande(demandeDachat);

        if (demandeDachat.getLignes() == null || demandeDachat.getLignes().isEmpty()) {
            throw new ObjectNotValidException("Au moins une ligne d'achat est obligatoire");
        }

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode(PROCESS_CODE);
        if (typeProcessus.isEmpty()) {
            throw new ObjectNotValidException("Type de processus DDA introuvable");
        }

        demandeDachat.setEmetteur(emetteur.get());
        demandeDachat.setTypeProcessus(typeProcessus.get());
        demandeDachat.setPrixTotal(calculerTotal(demandeDachat.getLignes()));

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        if (validateurList.isEmpty()) {
            throw new ObjectNotValidException("Aucun validateur configuré pour DDA");
        }

        demandeDachat.setValidateurSuivant(validateurList.getFirst());
        demandeDachat.setDateEmission(LocalDateTime.now());

        DemandeDachat saved = demandeRepo.save(demandeDachat);
        for (LigneDemandeAchat ligne : demandeDachat.getLignes()) {
            ligne.setDemandeDachat(saved);
            ligneRepo.save(ligne);
        }

        emailService.sendMailNewFdm(saved.getValidateurSuivant().getUser().getEmail(), saved.getId().toString(), emetteur.get().getEmail());
        return new ResponseConstant().ok(saved);
    }

    @Override
    public ResponseModel updateEntity(DemandeDachat demande) {
        if (demande.getReference() == null || demande.getReference().isBlank()) {
            throw new ObjectNotValidException("Référence obligatoire");
        }
        validateDemande(demande);

        Optional<DemandeDachat> result = demandeRepo.findByReference(demande.getReference());
        if (result.isEmpty()) {
            return new ResponseConstant().noContent("Demande introuvable");
        }

        DemandeDachat entity = result.get();
        entity.setDestination(demande.getDestination());
        entity.setFournisseur(demande.getFournisseur());
        entity.setService(demande.getService());
        entity.setClient(demande.getClient());
        entity.setMontantProjet(normalize(demande.getMontantProjet()));
        entity.setCommentaire(demande.getCommentaire());

        if (demande.getLignes() != null && !demande.getLignes().isEmpty()) {
            List<LigneDemandeAchat> oldLines = ligneRepo.findByDemandeDachatId(entity.getId());
            for (LigneDemandeAchat ligne : oldLines) {
                ligne.setDelete(true);
                ligneRepo.save(ligne);
            }

            for (LigneDemandeAchat ligne : demande.getLignes()) {
                ligne.setDemandeDachat(entity);
                ligneRepo.save(ligne);
            }

            entity.setPrixTotal(calculerTotal(demande.getLignes()));
        }

        demandeRepo.save(entity);
        return new ResponseConstant().ok("Demande d'achat mise à jour");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(demandeRepo.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<DemandeDachat> demande = demandeRepo.findByReference(ref);
        if (demande.isPresent()) {
            return new ResponseConstant().ok(demande.get());
        }
        return new ResponseConstant().noContent("Aucune demande trouvée");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<DemandeDachat> demande = demandeRepo.findByReference(ref);
        if (demande.isPresent()) {
            DemandeDachat entity = demande.get();
            entity.setDelete(true);
            demandeRepo.save(entity);
            return new ResponseConstant().ok("Demande supprimée");
        }
        return new ResponseConstant().noContent("Aucune demande trouvée");
    }

    @Override
    public ResponseModel getMyRequests(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(demandeRepo.findByEmetteurId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel getPendingValidations(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(demandeRepo.findPendingValidationsByUserId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel traiter(Long id, Choix_decisions decision, String commentaire) {
        User currentUser = currentUserService.getCurrentUser();

        DemandeDachat demande = demandeRepo.findById(id)
                .orElseThrow(() -> new ObjectNotValidException("Demande introuvable"));

        if (Boolean.TRUE.equals(demande.getDelete())) {
            throw new ObjectNotValidException("Demande supprimée");
        }

        if (demande.isTraite()) {
            throw new ObjectNotValidException("Demande déjà traitée");
        }

        Validateur validateurSuivant = demande.getValidateurSuivant();
        if (validateurSuivant == null || !validateurSuivant.getUser().getId().equals(currentUser.getId())) {
            throw new ObjectNotValidException("Vous n'êtes pas autorisé à traiter cette demande");
        }

        TraitementDemandeDachat traitement = new TraitementDemandeDachat();
        traitement.setDemandeDachat(demande);
        traitement.setTraiteur(currentUser);
        traitement.setDecision(decision);
        traitement.setCommentaire(commentaire);
        traitement.setDateTraitement(LocalDateTime.now());
        traitementRepo.save(traitement);

        demande.setTraitementPrecedent(traitement);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        if (decision == Choix_decisions.VALIDER) {
            Optional<Validateur> next = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurSuivant.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (next.isPresent()) {
                demande.setValidateurSuivant(next.get());
                emailService.sendMailNewFdm(next.get().getUser().getEmail(), demande.getId().toString(), demande.getEmetteur().getEmail());
            } else {
                demande.setTraite(true);
                demande.setFavorable(true);
                demande.setValidateurSuivant(null);
                emailService.sendMailNewFdm(
                        demande.getEmetteur().getEmail(),
                        demande.getId().toString(),
                        "Votre demande d'achat a été approuvée"
                );
            }
        } else if (decision == Choix_decisions.REJETER) {
            demande.setTraite(true);
            demande.setFavorable(false);
            demande.setValidateurSuivant(null);
            emailService.sendMailNewFdm(
                    demande.getEmetteur().getEmail(),
                    demande.getId().toString(),
                    "Votre demande d'achat a été rejetée: " + commentaire
            );
        } else if (decision == Choix_decisions.A_CORRIGER) {
            demande.setTraite(false);
            Optional<Validateur> previous = validateurRepository.findPreviousValidator(
                    demande.getTypeProcessus().getId(),
                    validateurSuivant.getOrdre()
            );

            previous.ifPresentOrElse(
                    demande::setValidateurSuivant,
                    () -> {
                        if (!validateurList.isEmpty()) {
                            demande.setValidateurSuivant(validateurList.getFirst());
                        }
                    }
            );

            emailService.sendMailNewFdm(
                    demande.getEmetteur().getEmail(),
                    demande.getId().toString(),
                    "Votre demande d'achat nécessite des corrections: " + commentaire
            );
        }

        demandeRepo.save(demande);
        return new ResponseConstant().ok("Traitement effectué avec succès");
    }

    private void validateDemande(DemandeDachat demande) {
        if (demande.getDestination() == null || demande.getDestination().isBlank()) {
            throw new ObjectNotValidException("Destination obligatoire");
        }
        if (demande.getFournisseur() == null || demande.getFournisseur().isBlank()) {
            throw new ObjectNotValidException("Fournisseur obligatoire");
        }
        if (demande.getService() == null || demande.getService().isBlank()) {
            throw new ObjectNotValidException("Service obligatoire");
        }
        if (demande.getClient() == null || demande.getClient().isBlank()) {
            throw new ObjectNotValidException("Client obligatoire");
        }
        demande.setMontantProjet(normalize(demande.getMontantProjet()));
    }

    private double calculerTotal(List<LigneDemandeAchat> lignes) {
        return lignes.stream()
                .mapToDouble(ligne -> {
                    if (ligne.getPrixUnitaire() == null || ligne.getPrixUnitaire() < 0) {
                        throw new ObjectNotValidException("Prix unitaire invalide");
                    }
                    if (ligne.getQuantite() == null || ligne.getQuantite() <= 0) {
                        throw new ObjectNotValidException("Quantité invalide");
                    }
                    return ligne.getPrixUnitaire() * ligne.getQuantite();
                })
                .sum();
    }

    private double normalize(Double value) {
        return value == null || value < 0 ? 0d : value;
    }
}
