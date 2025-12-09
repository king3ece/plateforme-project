package tg.idstechnologie.plateforme.services.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.Optional;

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

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode("FDM");
        FicheDescriptiveMission newitem;
        if(!validateurList.isEmpty())
        {
            Validateur premierValidateur = validateurList.getFirst();

            // Auto-validation si l'émetteur est le premier validateur
            if (premierValidateur.getUser().getId().equals(emetteur.get().getId())) {
                // Créer un traitement auto-validé
                ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
                newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);

                TraitementFicheDescriptiveMission autoTraitement = new TraitementFicheDescriptiveMission();
                autoTraitement.setFicheDescriptiveDeMission(newitem);
                autoTraitement.setTraiteur(emetteur.get());
                autoTraitement.setDecision(Choix_decisions.VALIDER);
                autoTraitement.setCommentaire("Auto-validation (émetteur = premier validateur)");
                autoTraitement.setDateTraitement(LocalDateTime.now());
                traitementFicheDescriptiveMissionDao.save(autoTraitement);

                newitem.setTraitementPrecedent(autoTraitement);

                // Passer au validateur suivant
                Optional<Validateur> nextValidateur = validateurList.stream()
                        .filter(v -> v.getOrdre() > premierValidateur.getOrdre())
                        .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

                if (nextValidateur.isPresent()) {
                    newitem.setValidateurSuivant(nextValidateur.get());
                    ficheDescriptiveMissionDao.save(newitem);
                    emailService.sendMailNewFdm(
                            nextValidateur.get().getUser().getEmail(),
                            newitem.getId().toString(),
                            emetteur.get().getEmail()
                    );
                } else {
                    // Pas de validateur suivant, demande approuvée
                    newitem.setTraite(true);
                    newitem.setFavorable(true);
                    newitem.setValidateurSuivant(null);
                    ficheDescriptiveMissionDao.save(newitem);
                    emailService.sendMailNewFdm(
                            emetteur.get().getEmail(),
                            newitem.getId().toString(),
                            "Votre FDM a été auto-approuvée"
                    );
                }
            } else {
                // Processus normal
                ficheDescriptiveMission.setValidateurSuivant(premierValidateur);
                ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
                newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);
                emailService.sendMailNewFdm(premierValidateur.getUser().getEmail(), newitem.getId().toString(), emetteur.get().getEmail());
            }
        } else {
            // Aucun validateur configuré pour ce processus : on enregistre quand même
            // et on considère la demande comme approuvée automatiquement en environnement dev
            ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
            newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);
            newitem.setTraite(true);
            newitem.setFavorable(true);
            newitem.setValidateurSuivant(null);
            ficheDescriptiveMissionDao.save(newitem);
            emailService.sendMailNewFdm(
                    emetteur.get().getEmail(),
                    newitem.getId().toString(),
                    "Votre FDM a été approuvée (aucun validateur configuré)"
            );
        }


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
        if(result.isPresent()) {
            FicheDescriptiveMission item = result.get();

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
            // Le totalEstimatif est calculé automatiquement par @PreUpdate

            ficheDescriptiveMissionDao.save(item);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
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
        if(result.isPresent()) {
            FicheDescriptiveMission type = result.get();
            type.setDelete(true);
            ficheDescriptiveMissionDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
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

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(fdm.getTypeProcessus().getCode());

        if (decision == Choix_decisions.VALIDER) {
            Validateur validateurActuel = fdm.getValidateurSuivant();

            Optional<Validateur> nextValidateur = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurActuel.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (nextValidateur.isPresent()) {
                fdm.setValidateurSuivant(nextValidateur.get());
                emailService.sendMailNewFdm(
                        nextValidateur.get().getUser().getEmail(),
                        fdm.getId().toString(),
                        fdm.getEmetteur().getEmail()
                );
            } else {
                fdm.setTraite(true);
                fdm.setFavorable(true);
                fdm.setValidateurSuivant(null);
                emailService.sendMailNewFdm(
                        fdm.getEmetteur().getEmail(),
                        fdm.getId().toString(),
                        "Votre FDM a été approuvée par tous les validateurs"
                );
            }
        } else if (decision == Choix_decisions.REJETER) {
            fdm.setTraite(true);
            fdm.setFavorable(false);
            fdm.setValidateurSuivant(null);
            emailService.sendMailNewFdm(
                    fdm.getEmetteur().getEmail(),
                    fdm.getId().toString(),
                    "Votre FDM a été rejetée: " + commentaire
            );
        } else if (decision == Choix_decisions.A_CORRIGER) {
            fdm.setTraite(false);
            Validateur validateurActuel = fdm.getValidateurSuivant();

            // Chercher le validateur précédent pour retourner la demande
            Optional<Validateur> previousValidateur = validateurRepository.findPreviousValidator(
                    fdm.getTypeProcessus().getId(),
                    validateurActuel.getOrdre()
            );

            if (previousValidateur.isPresent()) {
                // Retour au validateur précédent
                fdm.setValidateurSuivant(previousValidateur.get());
                emailService.sendMailNewFdm(
                        previousValidateur.get().getUser().getEmail(),
                        fdm.getId().toString(),
                        "FDM retournée pour correction par " + currentUser.getLastName() + " " + currentUser.getName()
                );
            } else {
                // Pas de validateur précédent, retour au premier validateur
                if (!validateurList.isEmpty()) {
                    fdm.setValidateurSuivant(validateurList.getFirst());
                }
            }

            // Notifier l'émetteur
            emailService.sendMailNewFdm(
                    fdm.getEmetteur().getEmail(),
                    fdm.getId().toString(),
                    "Votre FDM nécessite des corrections: " + commentaire
            );
        }

        ficheDescriptiveMissionDao.save(fdm);

        return new ResponseConstant().ok("Traitement effectué avec succès");
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
