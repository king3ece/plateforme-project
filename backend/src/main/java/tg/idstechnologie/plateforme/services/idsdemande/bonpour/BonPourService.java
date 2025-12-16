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

    private static final String PROCESS_CODE = "BONPOUR";

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
        validateBonPour(bonPour);

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode(PROCESS_CODE);
        if (typeProcessus.isEmpty()) {
            throw new ObjectNotValidException("Type de processus BONPOUR introuvable");
        }

        bonPour.setEmetteur(emetteur.get());
        bonPour.setTypeProcessus(typeProcessus.get());

        double montantTotal = bonPour.getLignes().stream()
                .mapToDouble(LigneBonPour::getMontant)
                .sum();
        bonPour.setMontantTotal(montantTotal);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        String emetteurNom = emetteur.get().getLastName() + " " + emetteur.get().getName();

        if (!validateurList.isEmpty()) {
            Validateur premierValidateur = validateurList.getFirst();
            bonPour.setDateEmission(LocalDateTime.now());

            if (premierValidateur.getUser().getId().equals(emetteur.get().getId())) {
                bonPour.setTraite(true);
                bonPour.setFavorable(true);
                bonPour.setValidateurSuivant(null);

                BonPour savedBonPour = bonPourDao.save(bonPour);

                for (LigneBonPour ligne : bonPour.getLignes()) {
                    ligne.setBonPour(savedBonPour);
                    ligneBonPourDao.save(ligne);
                }

                TraitementBonPour autoTraitement = new TraitementBonPour();
                autoTraitement.setBonPour(savedBonPour);
                autoTraitement.setTraiteur(emetteur.get());
                autoTraitement.setDecision(Choix_decisions.VALIDER);
                autoTraitement.setCommentaire("Auto-validation : émetteur est le premier validateur");
                autoTraitement.setDateTraitement(LocalDateTime.now());
                traitementBonPourDao.save(autoTraitement);

                savedBonPour.setTraitementPrecedent(autoTraitement);
                bonPourDao.save(savedBonPour);

                emailService.sendMailApprobation(emetteur.get().getEmail(), PROCESS_CODE, savedBonPour.getReference());
                notifyComptables(savedBonPour.getReference(), emetteurNom);

                return new ResponseConstant().ok(savedBonPour);
            } else {
                bonPour.setValidateurSuivant(premierValidateur);

                BonPour savedBonPour = bonPourDao.save(bonPour);

                for (LigneBonPour ligne : bonPour.getLignes()) {
                    ligne.setBonPour(savedBonPour);
                    ligneBonPourDao.save(ligne);
                }

                emailService.sendMailNewDemande(
                        premierValidateur.getUser().getEmail(),
                        PROCESS_CODE,
                        savedBonPour.getReference(),
                        emetteurNom
                );

                return new ResponseConstant().ok(savedBonPour);
            }
        } else {
            throw new ObjectNotValidException("Aucun validateur configuré pour BONPOUR");
        }
    }

    @Override
    public ResponseModel updateEntity(BonPour bonPour) {
        if (bonPour.getReference() == null || bonPour.getReference().isEmpty()) {
            throw new ObjectNotValidException("Référence obligatoire pour la modification");
        }

        validateBonPour(bonPour);

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("Utilisateur obligatoire");
        }

        Optional<BonPour> result = bonPourDao.findByReference(bonPour.getReference());
        if (result.isPresent()) {
            BonPour item = result.get();

            if (!item.getEmetteur().getId().equals(emetteur.get().getId())) {
                throw new ObjectNotValidException("Seul l'émetteur peut modifier le bon pour");
            }

            if (item.getValidateurSuivant() != null || item.isTraite()) {
                throw new ObjectNotValidException("Impossible de modifier un bon pour en cours de validation");
            }

            item.setBeneficiaire(bonPour.getBeneficiaire());
            item.setMotif(bonPour.getMotif());

            if (bonPour.getLignes() != null && !bonPour.getLignes().isEmpty()) {
                List<LigneBonPour> oldLignes = ligneBonPourDao.findByBonPourId(item.getId());
                for (LigneBonPour oldLigne : oldLignes) {
                    oldLigne.setDelete(true);
                    ligneBonPourDao.save(oldLigne);
                }

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

                double montantTotal = bonPour.getLignes().stream()
                        .mapToDouble(LigneBonPour::getMontant)
                        .sum();
                item.setMontantTotal(montantTotal);
            }

            List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
            String emetteurNom = emetteur.get().getLastName() + " " + emetteur.get().getName();

            if (!validateurList.isEmpty()) {
                Validateur premierValidateur = validateurList.getFirst();

                if (premierValidateur.getUser().getId().equals(emetteur.get().getId())) {
                    item.setTraite(true);
                    item.setFavorable(true);
                    item.setValidateurSuivant(null);

                    TraitementBonPour autoTraitement = new TraitementBonPour();
                    autoTraitement.setBonPour(item);
                    autoTraitement.setTraiteur(emetteur.get());
                    autoTraitement.setDecision(Choix_decisions.VALIDER);
                    autoTraitement.setCommentaire("Auto-validation après modification : émetteur est le premier validateur");
                    autoTraitement.setDateTraitement(LocalDateTime.now());
                    traitementBonPourDao.save(autoTraitement);

                    item.setTraitementPrecedent(autoTraitement);

                    emailService.sendMailApprobation(emetteur.get().getEmail(), PROCESS_CODE, item.getReference());
                    notifyComptables(item.getReference(), emetteurNom);
                } else {
                    item.setValidateurSuivant(premierValidateur);
                    emailService.sendMailNewDemande(
                            premierValidateur.getUser().getEmail(),
                            PROCESS_CODE,
                            item.getReference(),
                            emetteurNom + " (corrigé)"
                    );
                }
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

        TraitementBonPour traitement = new TraitementBonPour();
        traitement.setBonPour(bonPour);
        traitement.setTraiteur(currentUser);
        traitement.setDecision(decision);
        traitement.setCommentaire(commentaire);
        traitement.setDateTraitement(LocalDateTime.now());

        traitementBonPourDao.save(traitement);

        bonPour.setTraitementPrecedent(traitement);

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(bonPour.getTypeProcessus().getCode());
        String currentUserNom = currentUser.getLastName() + " " + currentUser.getName();
        String emetteurNom = bonPour.getEmetteur().getLastName() + " " + bonPour.getEmetteur().getName();

        if (decision == Choix_decisions.VALIDER) {
            Validateur validateurActuel = bonPour.getValidateurSuivant();

            Optional<Validateur> nextValidateur = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurActuel.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (nextValidateur.isPresent()) {
                bonPour.setValidateurSuivant(nextValidateur.get());
                emailService.sendMailNewDemande(
                        nextValidateur.get().getUser().getEmail(),
                        PROCESS_CODE,
                        bonPour.getReference(),
                        emetteurNom
                );
            } else {
                bonPour.setTraite(true);
                bonPour.setFavorable(true);
                bonPour.setValidateurSuivant(null);
                emailService.sendMailApprobation(bonPour.getEmetteur().getEmail(), PROCESS_CODE, bonPour.getReference());
                notifyComptables(bonPour.getReference(), emetteurNom);
            }
        } else if (decision == Choix_decisions.REJETER) {
            bonPour.setTraite(true);
            bonPour.setFavorable(false);
            bonPour.setValidateurSuivant(null);

            emailService.sendMailRejet(
                    bonPour.getEmetteur().getEmail(),
                    PROCESS_CODE,
                    bonPour.getReference(),
                    currentUserNom,
                    commentaire
            );

            notifyPreviousValidatorsOnRejection(bonPour, currentUser, commentaire);
        } else if (decision == Choix_decisions.A_CORRIGER) {
            bonPour.setTraite(false);
            Validateur validateurActuel = bonPour.getValidateurSuivant();

            Validateur premierValidateur = validateurList.isEmpty() ? null : validateurList.getFirst();

            if (premierValidateur != null && validateurActuel.getId().equals(premierValidateur.getId())) {
                bonPour.setValidateurSuivant(null);
                emailService.sendMailCorrection(
                        bonPour.getEmetteur().getEmail(),
                        PROCESS_CODE,
                        bonPour.getReference(),
                        commentaire
                );
            } else {
                Optional<Validateur> previousValidateur = validateurRepository.findPreviousValidator(
                        bonPour.getTypeProcessus().getId(),
                        validateurActuel.getOrdre()
                );

                if (previousValidateur.isPresent()) {
                    if (previousValidateur.get().getUser().getId().equals(bonPour.getEmetteur().getId())) {
                        bonPour.setValidateurSuivant(null);
                        emailService.sendMailCorrection(
                                bonPour.getEmetteur().getEmail(),
                                PROCESS_CODE,
                                bonPour.getReference(),
                                commentaire
                        );
                    } else {
                        bonPour.setValidateurSuivant(previousValidateur.get());
                        emailService.sendMailCorrection(
                                previousValidateur.get().getUser().getEmail(),
                                PROCESS_CODE,
                                bonPour.getReference(),
                                commentaire
                        );
                        emailService.sendMailCorrection(
                                bonPour.getEmetteur().getEmail(),
                                PROCESS_CODE,
                                bonPour.getReference(),
                                commentaire
                        );
                    }
                } else {
                    bonPour.setValidateurSuivant(null);
                    emailService.sendMailCorrection(
                            bonPour.getEmetteur().getEmail(),
                            PROCESS_CODE,
                            bonPour.getReference(),
                            commentaire
                    );
                }
            }
        }

        bonPourDao.save(bonPour);

        return new ResponseConstant().ok("Traitement effectué avec succès");
    }

    /**
     * Notifier tous les comptables d'une demande approuvée
     */
    private void notifyComptables(String reference, String emetteurNom) {
        List<User> comptables = userRepository.findAllComptables();
        for (User comptable : comptables) {
            emailService.sendMailComptable(
                    comptable.getEmail(),
                    PROCESS_CODE,
                    reference,
                    emetteurNom
            );
        }
    }

    /**
     * Notifier tous les validateurs précédents lors d'un rejet
     */
    private void notifyPreviousValidatorsOnRejection(BonPour bonPour, User rejeteur, String raison) {
        List<TraitementBonPour> traitements = traitementBonPourDao.findByBonPourId(bonPour.getId());
        String rejeteurNom = rejeteur.getLastName() + " " + rejeteur.getName();

        for (TraitementBonPour t : traitements) {
            if (t.getTraiteur() != null && !t.getTraiteur().getId().equals(rejeteur.getId())) {
                emailService.sendMailRejet(
                        t.getTraiteur().getEmail(),
                        PROCESS_CODE,
                        bonPour.getReference(),
                        rejeteurNom,
                        raison
                );
            }
        }
    }

    /**
     * Valider les champs obligatoires d'un BonPour
     */
    private void validateBonPour(BonPour bonPour) {
        if (bonPour.getBeneficiaire() == null || bonPour.getBeneficiaire().isEmpty() || bonPour.getBeneficiaire().isBlank()) {
            throw new ObjectNotValidException("Bénéficiaire obligatoire");
        }

        if (bonPour.getMotif() == null || bonPour.getMotif().isEmpty() || bonPour.getMotif().isBlank()) {
            throw new ObjectNotValidException("Motif obligatoire");
        }

        if (bonPour.getLignes() == null || bonPour.getLignes().isEmpty()) {
            throw new ObjectNotValidException("Au moins une ligne est obligatoire");
        }

        for (LigneBonPour ligne : bonPour.getLignes()) {
            if (ligne.getLibelle() == null || ligne.getLibelle().isEmpty() || ligne.getLibelle().isBlank()) {
                throw new ObjectNotValidException("Libellé de ligne obligatoire");
            }
            if (ligne.getMontant() == null || ligne.getMontant() < 0) {
                throw new ObjectNotValidException("Montant de ligne obligatoire et doit être positif");
            }
        }
    }
}
