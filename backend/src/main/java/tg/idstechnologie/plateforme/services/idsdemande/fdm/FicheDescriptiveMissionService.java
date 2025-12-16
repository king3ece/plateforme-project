package tg.idstechnologie.plateforme.services.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tg.idstechnologie.plateforme.dao.idsdemande.TypeProcessusRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.FicheDescriptiveMissionRepository;
import tg.idstechnologie.plateforme.dao.idsdemande.fdm.TraitementFicheDescriptiveMissionRepository;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.fdm.FicheDescriptiveMissionInterface;
import tg.idstechnologie.plateforme.mail.EmailService;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.FicheDescriptiveMission;
import tg.idstechnologie.plateforme.models.idsdemande.fdm.TraitementFicheDescriptiveMission;
import tg.idstechnologie.plateforme.utils.Choix_decisions;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
//import tg.idstechnologie.plateforme.secu.user.*;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.services.user.CurrentUserService;
import tg.idstechnologie.plateforme.file_upload.StorageService;
import tg.idstechnologie.plateforme.dao.idsdemande.PieceJointeDao;
import tg.idstechnologie.plateforme.dao.data_models.FileDataDao;
import tg.idstechnologie.plateforme.models.idsdemande.PieceJointe;
import tg.idstechnologie.plateforme.models.data_models.FileData;
import tg.idstechnologie.plateforme.models.idsdemande.FileDataPieceJointe;
import tg.idstechnologie.plateforme.dao.idsdemande.FileDataPieceJointeDao;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class FicheDescriptiveMissionService   implements FicheDescriptiveMissionInterface {

    private final FicheDescriptiveMissionRepository ficheDescriptiveMissionDao;
    private final TraitementFicheDescriptiveMissionRepository traitementFicheDescriptiveMissionDao;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ValidateurRepository validateurRepository;
    private final EmailService emailService;
    private final TypeProcessusRepository typeProcessusRepository;
    private final StorageService storageService;
    private final PieceJointeDao pieceJointeDao;
    private final FileDataDao fileDataDao;
    private final FileDataPieceJointeDao fileDataPieceJointeDao;
    @Value("${app.comptable.poste-code:COMPTABLE}")
    private String comptablePosteCode;

    @Override
    public ResponseModel createEntity(FicheDescriptiveMission ficheDescriptiveMission) {

        if(ficheDescriptiveMission.getNomProjet() == null || ficheDescriptiveMission.getNomProjet().isEmpty() ||ficheDescriptiveMission.getNomProjet().isBlank()) {
            throw new ObjectNotValidException("Nom Obligatoire");
        }

        if(ficheDescriptiveMission.getLieuMission() == null || ficheDescriptiveMission.getLieuMission().isEmpty() ||ficheDescriptiveMission.getLieuMission().isBlank()) {
            throw new ObjectNotValidException("Lieu Obligatoire");
        }

        if(ficheDescriptiveMission.getObjectifMission() == null || ficheDescriptiveMission.getObjectifMission().isEmpty() ||ficheDescriptiveMission.getObjectifMission().isBlank()) {
            throw new ObjectNotValidException("Objectif Obligatoire");
        }


        if(ficheDescriptiveMission.getPerdieme() == null || ficheDescriptiveMission.getPerdieme() < 0) {
            throw new ObjectNotValidException("Perdieme Obligatoire");
        }

        if(ficheDescriptiveMission.getTransport() == null || ficheDescriptiveMission.getTransport() < 0) {
            throw new ObjectNotValidException("Transport Obligatoire");
        }

        if(ficheDescriptiveMission.getPeage() == null || ficheDescriptiveMission.getPeage() < 0) {
            throw new ObjectNotValidException("Peage Obligatoire");
        }

        if(ficheDescriptiveMission.getLaisserPasser() == null || ficheDescriptiveMission.getLaisserPasser() < 0) {
            throw new ObjectNotValidException("Laisser passer Obligatoire");
        }

        if(ficheDescriptiveMission.getBonEssence() == null || ficheDescriptiveMission.getBonEssence() < 0) {
            throw new ObjectNotValidException("Bon essence Obligatoire");
        }

        if(ficheDescriptiveMission.getHotel() == null || ficheDescriptiveMission.getHotel() < 0) {
            throw new ObjectNotValidException("Hote Obligatoire");
        }

        if(ficheDescriptiveMission.getDivers() == null || ficheDescriptiveMission.getDivers() < 0) {
            throw new ObjectNotValidException("Divers Obligatoire");
        }

        if (ficheDescriptiveMission.getDateDepart() == null || ficheDescriptiveMission.getDateDepart().isBefore(LocalDate.now())) {
            throw new ObjectNotValidException("Date depart erreur");
        }

        if (ficheDescriptiveMission.getDateProbableRetour() == null) {
            throw new ObjectNotValidException("Date problable retour erreur");
        }

        if (ficheDescriptiveMission.getDateDepart().isAfter(ficheDescriptiveMission.getDateProbableRetour())) {
            throw new ObjectNotValidException("Date erreur");
        }
        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("User Obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode("FDM");
        if (typeProcessus.isEmpty()) {
            // Auto-create a default TypeProcessus for FDM to avoid validation failures in dev environments
            TypeProcessus tp = new TypeProcessus();
            tp.setCode("FDM");
            tp.setLibelle("Fiche descriptive de mission");
            tp = typeProcessusRepository.save(tp);
            typeProcessus = Optional.of(tp);
        }

        ficheDescriptiveMission.setEmetteur(emetteur.get());
        ficheDescriptiveMission.setTypeProcessus(typeProcessus.get());
        ficheDescriptiveMission.setDureeMission(calculerDuree(ficheDescriptiveMission.getDateDepart(),ficheDescriptiveMission.getDateProbableRetour()));
        // Le totalEstimatif est calculé automatiquement par @PrePersist
        List<Validateur> validateurList = filterValidateurs(emetteur.get(), typeProcessus.get());
        FicheDescriptiveMission newitem = routeFdmAfterSubmission(ficheDescriptiveMission, emetteur.get(), validateurList);
        return new ResponseConstant().ok(newitem);
    }

    @Override
    public ResponseModel updateEntity(FicheDescriptiveMission ficheDescriptiveMission) {

        if(ficheDescriptiveMission.getNomProjet() == null || ficheDescriptiveMission.getNomProjet().isEmpty() ||ficheDescriptiveMission.getNomProjet().isBlank()) {
            throw new ObjectNotValidException("Nom Obligatoire");
        }

        if(ficheDescriptiveMission.getLieuMission() == null || ficheDescriptiveMission.getLieuMission().isEmpty() ||ficheDescriptiveMission.getLieuMission().isBlank()) {
            throw new ObjectNotValidException("Lieu Obligatoire");
        }

        if(ficheDescriptiveMission.getObjectifMission() == null || ficheDescriptiveMission.getObjectifMission().isEmpty() ||ficheDescriptiveMission.getObjectifMission().isBlank()) {
            throw new ObjectNotValidException("Objectif Obligatoire");
        }


        if(ficheDescriptiveMission.getPerdieme() == null || ficheDescriptiveMission.getPerdieme() < 0) {
            throw new ObjectNotValidException("Perdieme Obligatoire");
        }

        if(ficheDescriptiveMission.getTransport() == null || ficheDescriptiveMission.getTransport() < 0) {
            throw new ObjectNotValidException("Transport Obligatoire");
        }

        if(ficheDescriptiveMission.getPeage() == null || ficheDescriptiveMission.getPeage() < 0) {
            throw new ObjectNotValidException("Peage Obligatoire");
        }

        if(ficheDescriptiveMission.getLaisserPasser() == null || ficheDescriptiveMission.getLaisserPasser() < 0) {
            throw new ObjectNotValidException("Laisser passer Obligatoire");
        }

        if(ficheDescriptiveMission.getBonEssence() == null || ficheDescriptiveMission.getBonEssence() < 0) {
            throw new ObjectNotValidException("Bon essence Obligatoire");
        }

        if(ficheDescriptiveMission.getHotel() == null || ficheDescriptiveMission.getHotel() < 0) {
            throw new ObjectNotValidException("Hote Obligatoire");
        }

        if(ficheDescriptiveMission.getDivers() == null || ficheDescriptiveMission.getDivers() < 0) {
            throw new ObjectNotValidException("Divers Obligatoire");
        }

        if (ficheDescriptiveMission.getDateDepart() == null || ficheDescriptiveMission.getDateDepart().isBefore(LocalDate.now())) {
            throw new ObjectNotValidException("Date depart erreur");
        }

        if(ficheDescriptiveMission.getTypeProcessus() == null) {
            throw new ObjectNotValidException("Type Obligatoire");
        }

        if (ficheDescriptiveMission.getDateProbableRetour() == null || !ficheDescriptiveMission.getDateProbableRetour().isAfter(ficheDescriptiveMission.getDateDepart())) {
            throw new ObjectNotValidException("Date problable retour erreur");
        }
        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("User Obligatoire");
        }


        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ficheDescriptiveMission.getReference());
        if(result.isEmpty()) {
            return new ResponseConstant().noContent("Aucune correspondance trouvé");
        }

        FicheDescriptiveMission item = result.get();

        if (Boolean.TRUE.equals(item.getDelete())) {
            throw new ObjectNotValidException("FDM supprimée");
        }

        if (item.isTraite()) {
            throw new ObjectNotValidException("FDM déjà traitée");
        }

        if (item.getValidateurSuivant() != null) {
            throw new ObjectNotValidException("FDM en cours de validation, modification impossible");
        }

        if (item.getEmetteur() == null || !item.getEmetteur().getId().equals(emetteur.get().getId())) {
            throw new ObjectNotValidException("Seul l'émetteur peut modifier cette FDM");
        }

        item.setNomProjet(ficheDescriptiveMission.getNomProjet() != null ? ficheDescriptiveMission.getNomProjet() : item.getNomProjet());
        item.setLieuMission(ficheDescriptiveMission.getLieuMission() != null ? ficheDescriptiveMission.getLieuMission() : item.getLieuMission());
        item.setObjectifMission(ficheDescriptiveMission.getObjectifMission() != null ? ficheDescriptiveMission.getObjectifMission() : item.getObjectifMission());
        item.setPerdieme(ficheDescriptiveMission.getPerdieme() != null ? ficheDescriptiveMission.getPerdieme() : item.getPerdieme());
        item.setTransport(ficheDescriptiveMission.getTransport() != null ? ficheDescriptiveMission.getTransport() : item.getTransport());
        item.setPeage(ficheDescriptiveMission.getPeage() != null ? ficheDescriptiveMission.getPeage() : item.getPeage());
        item.setLaisserPasser(ficheDescriptiveMission.getLaisserPasser() != null ? ficheDescriptiveMission.getLaisserPasser() : item.getLaisserPasser());
        item.setBonEssence(ficheDescriptiveMission.getBonEssence() != null ? ficheDescriptiveMission.getBonEssence() : item.getBonEssence());

        item.setHotel(ficheDescriptiveMission.getHotel() != null ? ficheDescriptiveMission.getHotel() : item.getHotel());
        item.setDivers(ficheDescriptiveMission.getDivers() != null ? ficheDescriptiveMission.getDivers() : item.getDivers());
        item.setDateDepart(ficheDescriptiveMission.getDateDepart() != null ? ficheDescriptiveMission.getDateDepart() : item.getDateDepart());
        item.setDateProbableRetour(ficheDescriptiveMission.getDateProbableRetour() != null ? ficheDescriptiveMission.getDateProbableRetour() : item.getDateProbableRetour());

        item.setDureeMission(calculerDuree(item.getDateDepart(), item.getDateProbableRetour()));
        // Repart à zéro le circuit de validation
        item.setTraitementPrecedent(null);
        item.setValidateurSuivant(null);
        item.setTraite(false);
        item.setFavorable(false);
        item.setDateEmission(LocalDateTime.now());

        List<Validateur> validateurList = filterValidateurs(emetteur.get(), item.getTypeProcessus());
        FicheDescriptiveMission updated = routeFdmAfterSubmission(item, emetteur.get(), validateurList);
        return new ResponseConstant().ok(updated);
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(ficheDescriptiveMissionDao.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ref);
        if(result.isEmpty()) {
            return new ResponseConstant().noContent("Aucune correspondance trouvé");
        }

        FicheDescriptiveMission fdm = result.get();
        User currentUser = currentUserService.getCurrentUser();

        if (fdm.isTraite()) {
            throw new ObjectNotValidException("Impossible de supprimer : FDM déjà traitée");
        }

        if (fdm.getEmetteur() == null || !fdm.getEmetteur().getId().equals(currentUser.getId())) {
            throw new ObjectNotValidException("Seul l'émetteur peut supprimer la FDM");
        }

        fdm.setDelete(true);
        ficheDescriptiveMissionDao.save(fdm);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel getMyRequests(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(ficheDescriptiveMissionDao.findByEmetteurId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel getPendingValidations(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        return new ResponseConstant().ok(ficheDescriptiveMissionDao.findPendingValidationsByUserId(currentUser.getId(), pageable));
    }

    @Override
    public ResponseModel traiterFDM(Long fdmId, Choix_decisions decision, String commentaire) {
        User currentUser = currentUserService.getCurrentUser();

        Optional<FicheDescriptiveMission> fdmOpt = ficheDescriptiveMissionDao.findById(fdmId);
        if (fdmOpt.isEmpty()) {
            throw new ObjectNotValidException("FDM introuvable");
        }

        FicheDescriptiveMission fdm = fdmOpt.get();

        if (Boolean.TRUE.equals(fdm.getDelete())) {
            throw new ObjectNotValidException("FDM supprimée");
        }

        if (fdm.isTraite()) {
            throw new ObjectNotValidException("FDM déjà traitée");
        }

        Validateur validateurSuivant = fdm.getValidateurSuivant();
        if (validateurSuivant == null || !validateurSuivant.getUser().getId().equals(currentUser.getId())) {
            throw new ObjectNotValidException("Vous n'êtes pas autorisé à traiter cette demande");
        }

        TraitementFicheDescriptiveMission traitement = new TraitementFicheDescriptiveMission();
        traitement.setFicheDescriptiveDeMission(fdm);
        traitement.setTraiteur(currentUser);
        traitement.setDecision(decision);
        traitement.setCommentaire(commentaire);
        traitement.setDateTraitement(LocalDateTime.now());

        traitementFicheDescriptiveMissionDao.save(traitement);

        fdm.setTraitementPrecedent(traitement);

        List<Validateur> validateurList = filterValidateurs(fdm.getEmetteur(), fdm.getTypeProcessus());

        if (decision == Choix_decisions.VALIDER) {
            handleValidation(fdm, validateurList, validateurSuivant);
        } else if (decision == Choix_decisions.REJETER) {
            handleRejet(fdm, commentaire, currentUser);
        } else if (decision == Choix_decisions.A_CORRIGER) {
            handleCorrection(fdm, validateurList, currentUser, commentaire);
        }

        ficheDescriptiveMissionDao.save(fdm);

        return new ResponseConstant().ok("Traitement effectué avec succès");
    }

    private List<Validateur> filterValidateurs(User emetteur, TypeProcessus typeProcessus) {
        List<Validateur> all = validateurRepository.handleValidatorByProcessCode(typeProcessus.getCode());
        Long subdivisionId = emetteur.getSubdivision() != null ? emetteur.getSubdivision().getId() : null;

        List<Validateur> filtered = all.stream()
                .filter(v -> v.getSubdivision() == null || (subdivisionId != null && v.getSubdivision().getId().equals(subdivisionId)))
                .sorted(Comparator.comparing(Validateur::getOrdre))
                .toList();

        if (!filtered.isEmpty()) {
            return filtered;
        }

        // Aucun validateur pour la subdivision : on retient tous les validateurs du process
        return all.stream()
                .sorted(Comparator.comparing(Validateur::getOrdre))
                .toList();
    }

    /**
     * Applique le même circuit qu'en Django : affecte le premier validateur, auto-valide si besoin,
     * ou approuve directement s'il n'y a pas de validateur.
     */
    private FicheDescriptiveMission routeFdmAfterSubmission(FicheDescriptiveMission fdm, User emetteur, List<Validateur> validateurList) {
        fdm.setDateEmission(LocalDateTime.now());

        if (validateurList.isEmpty()) {
            fdm.setTraite(true);
            fdm.setFavorable(true);
            fdm.setValidateurSuivant(null);
            FicheDescriptiveMission saved = ficheDescriptiveMissionDao.save(fdm);
            emailService.sendSimpleMail(
                    emetteur.getEmail(),
                    buildSubject(saved, "Validée"),
                    "Votre FDM est approuvée (aucun validateur configuré)."
            );
            notifyComptables(saved);
            return saved;
        }

        Validateur premierValidateur = validateurList.get(0);

        if (premierValidateur.getUser() != null && premierValidateur.getUser().getId().equals(emetteur.getId())) {
            // Auto-validation si l'émetteur est le premier validateur
            FicheDescriptiveMission saved = ficheDescriptiveMissionDao.save(fdm);

            TraitementFicheDescriptiveMission autoTraitement = new TraitementFicheDescriptiveMission();
            autoTraitement.setFicheDescriptiveDeMission(saved);
            autoTraitement.setTraiteur(emetteur);
            autoTraitement.setDecision(Choix_decisions.VALIDER);
            autoTraitement.setCommentaire("Auto-validation (émetteur = premier validateur)");
            autoTraitement.setDateTraitement(LocalDateTime.now());
            traitementFicheDescriptiveMissionDao.save(autoTraitement);

            saved.setTraitementPrecedent(autoTraitement);

            Optional<Validateur> nextValidateur = getNextValidateur(validateurList, premierValidateur);

            if (nextValidateur.isPresent()) {
                saved.setValidateurSuivant(nextValidateur.get());
                ficheDescriptiveMissionDao.save(saved);
                notifyValidateur(nextValidateur.get(), saved, "Vous avez une nouvelle fiche descriptive de mission à traiter.");
            } else {
                saved.setTraite(true);
                saved.setFavorable(true);
                saved.setValidateurSuivant(null);
                ficheDescriptiveMissionDao.save(saved);
                emailService.sendSimpleMail(
                        emetteur.getEmail(),
                        buildSubject(saved, "Validée"),
                        "Votre FDM a été approuvée."
                );
                notifyComptables(saved);
            }
            return saved;
        }

        // Processus normal
        fdm.setValidateurSuivant(premierValidateur);
        FicheDescriptiveMission saved = ficheDescriptiveMissionDao.save(fdm);
        notifyValidateur(premierValidateur, saved, "Vous avez une nouvelle fiche descriptive de mission en attente de traitement.");
        return saved;
    }

    private void handleValidation(FicheDescriptiveMission fdm, List<Validateur> validateurList, Validateur validateurActuel) {
        Optional<Validateur> nextValidateur = getNextValidateur(validateurList, validateurActuel);

        if (nextValidateur.isPresent()) {
            fdm.setValidateurSuivant(nextValidateur.get());
            notifyValidateur(nextValidateur.get(), fdm, "Vous avez une nouvelle fiche descriptive de mission en attente de traitement.");
        } else {
            fdm.setTraite(true);
            fdm.setFavorable(true);
            fdm.setValidateurSuivant(null);
            emailService.sendSimpleMail(
                    fdm.getEmetteur().getEmail(),
                    buildSubject(fdm, "Validée"),
                    "Votre FDM a été approuvée."
            );
            notifyComptables(fdm);
        }
    }

    private void handleRejet(FicheDescriptiveMission fdm, String commentaire, User currentUser) {
        fdm.setTraite(true);
        fdm.setFavorable(false);
        fdm.setValidateurSuivant(null);

        String motif = (commentaire != null && !commentaire.isBlank()) ? commentaire : "Sans commentaire";
        emailService.sendSimpleMail(
                fdm.getEmetteur().getEmail(),
                buildSubject(fdm, "Rejetée"),
                "Votre FDM a été rejetée. Motif : " + motif
        );

        // Informer les traiteurs précédents (hors traiteur actuel)
        List<TraitementFicheDescriptiveMission> traitements = traitementFicheDescriptiveMissionDao.findByFicheDescriptiveMissionId(fdm.getId());
        Set<Long> dejaNotifie = new HashSet<>();

        for (TraitementFicheDescriptiveMission t : traitements) {
            if (t.getTraiteur() == null) continue;
            if (t.getTraiteur().getId().equals(currentUser.getId())) continue;
            if (!dejaNotifie.add(t.getTraiteur().getId())) continue;

            emailService.sendSimpleMail(
                    t.getTraiteur().getEmail(),
                    buildSubject(fdm, "Rejetée"),
                    "Une FDM que vous avez validée a été rejetée. Motif : " + motif
            );
        }
    }

    private void handleCorrection(FicheDescriptiveMission fdm, List<Validateur> validateurList, User currentUser, String commentaire) {
        fdm.setTraite(false);
        fdm.setFavorable(false);

        String motif = (commentaire != null && !commentaire.isBlank()) ? commentaire : "Correction demandée";
        Optional<Validateur> previous = getPreviousValidateur(validateurList, fdm.getValidateurSuivant());

        if (previous.isPresent()) {
            fdm.setValidateurSuivant(previous.get());
            notifyValidateur(previous.get(), fdm, "Retour de FDM pour correction : " + motif);
        } else {
            // Retour à l'émetteur
            fdm.setValidateurSuivant(null);
        }

        // Notifier l'émetteur
        emailService.sendSimpleMail(
                fdm.getEmetteur().getEmail(),
                buildSubject(fdm, "À corriger"),
                "Votre FDM nécessite des corrections. Motif : " + motif
        );
    }

    private Optional<Validateur> getNextValidateur(List<Validateur> validateurList, Validateur current) {
        if (validateurList == null || current == null) {
            return Optional.empty();
        }
        for (int i = 0; i < validateurList.size(); i++) {
            if (validateurList.get(i).getId().equals(current.getId()) && i + 1 < validateurList.size()) {
                return Optional.of(validateurList.get(i + 1));
            }
        }
        return Optional.empty();
    }

    private Optional<Validateur> getPreviousValidateur(List<Validateur> validateurList, Validateur current) {
        if (validateurList == null || current == null) {
            return Optional.empty();
        }
        for (int i = 0; i < validateurList.size(); i++) {
            if (validateurList.get(i).getId().equals(current.getId()) && i - 1 >= 0) {
                return Optional.of(validateurList.get(i - 1));
            }
        }
        return Optional.empty();
    }

    private void notifyValidateur(Validateur validateur, FicheDescriptiveMission fdm, String message) {
        if (validateur == null || validateur.getUser() == null) {
            return;
        }
        emailService.sendSimpleMail(
                validateur.getUser().getEmail(),
                buildSubject(fdm, "Validation requise"),
                message
        );
    }

    private void notifyComptables(FicheDescriptiveMission fdm) {
        if (comptablePosteCode == null || comptablePosteCode.isBlank()) {
            return;
        }
        try {
            List<User> comptables = userRepository.findByPosteCode(comptablePosteCode);
            for (User comptable : comptables) {
                emailService.sendSimpleMail(
                        comptable.getEmail(),
                        buildSubject(fdm, "Règlement en attente"),
                        "Une FDM validée attend règlement."
                );
            }
        } catch (Exception ignored) {
            // Pas de poste comptable configuré
        }
    }

    private String buildSubject(FicheDescriptiveMission fdm, String suffix) {
        String ref = fdm.getId() != null ? fdm.getId().toString() : fdm.getReference();
        return "FDM " + ref + " - " + suffix;
    }

    // Méthode pour calculer la durée
    public static int calculerDuree(LocalDate depart, LocalDate arrivee) {
        if (depart.isEqual(arrivee)) {
            return 1; // Même jour, durée 1
        } else {
            // Calcul de la différence en jours
            return (int) Duration.between(depart.atStartOfDay(), arrivee.atStartOfDay()).toDays();
        }
    }

    @Override
    public ResponseModel uploadFilesToFDM(String reference, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return new ResponseConstant().ok("Pas de fichiers à uploader");
        }

        try {
            // Vérifier que la FDM existe
            Optional<FicheDescriptiveMission> fdmOpt = ficheDescriptiveMissionDao.findByReference(reference);
            if (fdmOpt.isEmpty()) {
                throw new ObjectNotValidException("FDM avec la référence " + reference + " non trouvée");
            }

            FicheDescriptiveMission fdm = fdmOpt.get();

            // Créer ou récupérer la PieceJointe associée à cette FDM
            List<PieceJointe> existingPieceJointes = pieceJointeDao.findByParentReferenceAndParentType(reference, "FDM");
            PieceJointe pieceJointe;
            
            if (!existingPieceJointes.isEmpty()) {
                pieceJointe = existingPieceJointes.get(0);
            } else {
                pieceJointe = new PieceJointe();
                pieceJointe.setParentReference(reference);
                pieceJointe.setParentType("FDM");
                pieceJointe.setDateUpload(LocalDateTime.now());
                pieceJointe = pieceJointeDao.save(pieceJointe);
            }

            // Uploader chaque fichier
            int successCount = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                try {
                    // Uploader le fichier via StorageService
                    ResponseModel storageResponse = storageService.store(file);
                    
                    if (storageResponse.getCode() == 200) {
                        // Créer une entrée FileData pour le fichier
                        FileData fileData = new FileData();
                        fileData.setOldName(file.getOriginalFilename());
                        fileData.setType(file.getContentType());
                        fileData.setSize(file.getSize());
                        // Le chemin est généralement défini par le StorageService
                        fileData.setFilePath(file.getOriginalFilename());
                        fileData = fileDataDao.save(fileData);

                        // Lier le FileData à la PieceJointe
                        FileDataPieceJointe link = new FileDataPieceJointe();
                        link.setFileData(fileData);
                        link.setPieceJointe(pieceJointe);
                        fileDataPieceJointeDao.save(link);

                        successCount++;
                    }
                } catch (Exception e) {
                    // Continuer avec le fichier suivant
                    System.err.println("Erreur lors de l'upload du fichier " + file.getOriginalFilename() + ": " + e.getMessage());
                }
            }

            return new ResponseConstant().ok(successCount + " fichier(s) uploadé(s) avec succès");
        } catch (ObjectNotValidException e) {
            return new ResponseConstant().badRequest(e.getMessage(), null);
        } catch (Exception e) {
            return new ResponseConstant().internalError("Erreur lors de l'upload des fichiers: " + e.getMessage(), null);
        }
    }
}
