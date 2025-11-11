package tg.idstechnologie.plateforme.services.idsdemande.bonpour;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.idsdemande.TypeProcessusRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.bonpour.BonPourRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.bonpour.LigneBonPourRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.bonpour.TraitementBonPourRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.bonpour.BonPourInterface;
import tg.idstechnologie.plateforme.mail.EmailService;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.BonPour;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.LigneBonPour;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.TraitementBonPour;
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
public class BonPourService implements BonPourInterface {

    private final BonPourRepository bonPourDao;
    private final LigneBonPourRepository ligneBonPourDao;
    private final TraitementBonPourRepository traitementBonPourDao;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ValidateurRepository validateurRepository;
    private final EmailService emailService;
    private final TypeProcessusRepository typeProcessusRepository;

    @Override
    public ResponseModel createEntity(BonPour bonPour) {

        if (bonPour.getBeneficiaire() == null || bonPour.getBeneficiaire().isEmpty() || bonPour.getBeneficiaire().isBlank()) {
            throw new ObjectNotValidException("Bénéficiaire obligatoire");
        }

        if (bonPour.getMotif() == null || bonPour.getMotif().isEmpty() || bonPour.getMotif().isBlank()) {
            throw new ObjectNotValidException("Motif obligatoire");
        }

        if (bonPour.getLignes() == null || bonPour.getLignes().isEmpty()) {
            throw new ObjectNotValidException("Au moins une ligne est obligatoire");
        }

        // Validate each line
        for (LigneBonPour ligne : bonPour.getLignes()) {
            if (ligne.getLibelle() == null || ligne.getLibelle().isEmpty() || ligne.getLibelle().isBlank()) {
                throw new ObjectNotValidException("Libellé de ligne obligatoire");
            }
            if (ligne.getMontant() == null || ligne.getMontant() < 0) {
                throw new ObjectNotValidException("Montant de ligne obligatoire et doit être positif");
            }
        }

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode("BONPOUR");
        if (typeProcessus.isEmpty()) {
            throw new ObjectNotValidException("Type de processus BONPOUR introuvable");
        }

        bonPour.setEmetteur(emetteur.get());
        bonPour.setTypeProcessus(typeProcessus.get());

        // Calculate total from lines
        double montantTotal = bonPour.getLignes().stream()
                .mapToDouble(LigneBonPour::getMontant)
                .sum();
        bonPour.setMontantTotal(montantTotal);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode("BONPOUR");
        if (!validateurList.isEmpty()) {
            Validateur validateur = validateurList.getFirst();
            bonPour.setValidateurSuivant(validateur);
            bonPour.setDateEmission(LocalDateTime.now());

            // Save BonPour first
            BonPour savedBonPour = bonPourDao.save(bonPour);

            // Associate and save each ligne with the BonPour
            for (LigneBonPour ligne : bonPour.getLignes()) {
                ligne.setBonPour(savedBonPour);
                ligneBonPourDao.save(ligne);
            }

            emailService.sendMailNewFdm(validateur.getUser().getEmail(), savedBonPour.getId().toString(), emetteur.get().getEmail());

            return new ResponseConstant().ok(savedBonPour);
        } else {
            throw new ObjectNotValidException("Aucun validateur configuré pour BONPOUR");
        }
    }

    @Override
    public ResponseModel updateEntity(BonPour bonPour) {
        if (bonPour.getReference() == null || bonPour.getReference().isEmpty()) {
            throw new ObjectNotValidException("Référence obligatoire pour la modification");
        }

        if (bonPour.getBeneficiaire() == null || bonPour.getBeneficiaire().isEmpty() || bonPour.getBeneficiaire().isBlank()) {
            throw new ObjectNotValidException("Bénéficiaire obligatoire");
        }

        if (bonPour.getMotif() == null || bonPour.getMotif().isEmpty() || bonPour.getMotif().isBlank()) {
            throw new ObjectNotValidException("Motif obligatoire");
        }

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<BonPour> result = bonPourDao.findByReference(bonPour.getReference());
        if (result.isPresent()) {
            BonPour item = result.get();

            // Check if user is the emetteur
            if (!item.getEmetteur().getId().equals(emetteur.get().getId())) {
                throw new ObjectNotValidException("Seul l'émetteur peut modifier le bon pour");
            }

            // Check if BonPour is already in validation process
            if (item.getValidateurSuivant() != null || item.isTraite()) {
                throw new ObjectNotValidException("Impossible de modifier un bon pour en cours de validation");
            }

            item.setBeneficiaire(bonPour.getBeneficiaire());
            item.setMotif(bonPour.getMotif());

            // Update lines if provided
            if (bonPour.getLignes() != null && !bonPour.getLignes().isEmpty()) {
                // Delete old lines
                List<LigneBonPour> oldLignes = ligneBonPourDao.findByBonPourId(item.getId());
                for (LigneBonPour oldLigne : oldLignes) {
                    oldLigne.setDelete(true);
                    ligneBonPourDao.save(oldLigne);
                }

                // Add new lines
                for (LigneBonPour ligne : bonPour.getLignes()) {
                    if (ligne.getLibelle() == null || ligne.getLibelle().isEmpty() || ligne.getLibelle().isBlank()) {
                        throw new ObjectNotValidException("Libellé de ligne obligatoire");
                    }
                    if (ligne.getMontant() == null || ligne.getMontant() < 0) {
                        throw new ObjectNotValidException("Montant de ligne obligatoire et doit être positif");
                    }
                    ligne.setBonPour(item);
                    ligneBonPourDao.save(ligne);
                }

                // Recalculate total
                double montantTotal = bonPour.getLignes().stream()
                        .mapToDouble(LigneBonPour::getMontant)
                        .sum();
                item.setMontantTotal(montantTotal);
            }

            bonPourDao.save(item);
            return new ResponseConstant().ok("Bon pour modifié avec succès");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(bonPourDao.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<BonPour> result = bonPourDao.findByReference(ref);
        if (result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<BonPour> result = bonPourDao.findByReference(ref);
        if (result.isPresent()) {
            BonPour bonPour = result.get();
            bonPour.setDelete(true);
            bonPourDao.save(bonPour);
            return new ResponseConstant().ok("Bon pour supprimé avec succès");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
    }

    @Override
    public ResponseModel getMyRequests(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(bonPourDao.findByEmetteurId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel getPendingValidations(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(bonPourDao.findPendingValidationsByUserId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel traiterBonPour(Long bonPourId, Choix_decisions decision, String commentaire) {
        User currentUser = currentUserService.getCurrentUser();

        Optional<BonPour> bonPourOpt = bonPourDao.findById(bonPourId);
        if (bonPourOpt.isEmpty()) {
            throw new ObjectNotValidException("Bon pour introuvable");
        }

        BonPour bonPour = bonPourOpt.get();

        if (Boolean.TRUE.equals(bonPour.getDelete())) {
            throw new ObjectNotValidException("Bon pour supprimé");
        }

        if (bonPour.isTraite()) {
            throw new ObjectNotValidException("Bon pour déjà traité");
        }

        Validateur validateurSuivant = bonPour.getValidateurSuivant();
        if (validateurSuivant == null || !validateurSuivant.getUser().getId().equals(currentUser.getId())) {
            throw new ObjectNotValidException("Vous n'êtes pas autorisé à traiter cette demande");
        }

        // Create treatment record
        TraitementBonPour traitement = new TraitementBonPour();
        traitement.setBonPour(bonPour);
        traitement.setTraiteur(currentUser);
        traitement.setDecision(decision);
        traitement.setCommentaire(commentaire);
        traitement.setDateTraitement(LocalDateTime.now());

        traitementBonPourDao.save(traitement);

        bonPour.setTraitementPrecedent(traitement);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(bonPour.getTypeProcessus().getCode());

        if (decision == Choix_decisions.VALIDER) {
            Validateur validateurActuel = bonPour.getValidateurSuivant();

            // Find next validator
            Optional<Validateur> nextValidateur = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurActuel.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (nextValidateur.isPresent()) {
                bonPour.setValidateurSuivant(nextValidateur.get());
                emailService.sendMailNewFdm(
                        nextValidateur.get().getUser().getEmail(),
                        bonPour.getId().toString(),
                        bonPour.getEmetteur().getEmail()
                );
            } else {
                // Last validator - approve request
                bonPour.setTraite(true);
                bonPour.setFavorable(true);
                bonPour.setValidateurSuivant(null);
                emailService.sendMailNewFdm(
                        bonPour.getEmetteur().getEmail(),
                        bonPour.getId().toString(),
                        "Votre bon pour a été approuvé par tous les validateurs"
                );
            }
        } else if (decision == Choix_decisions.REJETER) {
            bonPour.setTraite(true);
            bonPour.setFavorable(false);
            bonPour.setValidateurSuivant(null);
            emailService.sendMailNewFdm(
                    bonPour.getEmetteur().getEmail(),
                    bonPour.getId().toString(),
                    "Votre bon pour a été rejeté: " + commentaire
            );
        } else if (decision == Choix_decisions.A_CORRIGER) {
            bonPour.setTraite(false);
            Validateur validateurActuel = bonPour.getValidateurSuivant();

            // Find previous validator to return the request
            Optional<Validateur> previousValidateur = validateurRepository.findPreviousValidator(
                    bonPour.getTypeProcessus().getId(),
                    validateurActuel.getOrdre()
            );

            if (previousValidateur.isPresent()) {
                // Return to previous validator
                bonPour.setValidateurSuivant(previousValidateur.get());
                emailService.sendMailNewFdm(
                        previousValidateur.get().getUser().getEmail(),
                        bonPour.getId().toString(),
                        "Bon pour retourné pour correction par " + currentUser.getLastName() + " " + currentUser.getName()
                );
            } else {
                // No previous validator, return to first validator
                if (!validateurList.isEmpty()) {
                    bonPour.setValidateurSuivant(validateurList.getFirst());
                }
            }

            // Notify emetteur
            emailService.sendMailNewFdm(
                    bonPour.getEmetteur().getEmail(),
                    bonPour.getId().toString(),
                    "Votre bon pour nécessite des corrections: " + commentaire
            );
        }

        bonPourDao.save(bonPour);

        return new ResponseConstant().ok("Traitement effectué avec succès");
    }
}
