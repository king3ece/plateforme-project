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
public class FicheDescriptiveMissionService implements FicheDescriptiveMissionInterface {

    private static final String PROCESS_CODE = "FDM";

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
        validateFDM(ficheDescriptiveMission);

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("User Obligatoire");
        }

        Optional<TypeProcessus> typeProcessus = typeProcessusRepository.findByCode(PROCESS_CODE);
        if (typeProcessus.isEmpty()) {
            TypeProcessus tp = new TypeProcessus();
            tp.setCode(PROCESS_CODE);
            tp.setLibelle("Fiche descriptive de mission");
            tp = typeProcessusRepository.save(tp);
            typeProcessus = Optional.of(tp);
        }

        ficheDescriptiveMission.setEmetteur(emetteur.get());
        ficheDescriptiveMission.setTypeProcessus(typeProcessus.get());
        ficheDescriptiveMission.setDureeMission(calculerDuree(ficheDescriptiveMission.getDateDepart(), ficheDescriptiveMission.getDateProbableRetour()));

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode(PROCESS_CODE);
        FicheDescriptiveMission newitem;
        String emetteurNom = emetteur.get().getLastName() + " " + emetteur.get().getName();

        if (!validateurList.isEmpty()) {
            Validateur premierValidateur = validateurList.getFirst();

            if (premierValidateur.getUser().getId().equals(emetteur.get().getId())) {
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

                Optional<Validateur> nextValidateur = validateurList.stream()
                        .filter(v -> v.getOrdre() > premierValidateur.getOrdre())
                        .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

                if (nextValidateur.isPresent()) {
                    newitem.setValidateurSuivant(nextValidateur.get());
                    ficheDescriptiveMissionDao.save(newitem);
                    emailService.sendMailNewDemande(
                            nextValidateur.get().getUser().getEmail(),
                            PROCESS_CODE,
                            newitem.getReference(),
                            emetteurNom
                    );
                } else {
                    newitem.setTraite(true);
                    newitem.setFavorable(true);
                    newitem.setValidateurSuivant(null);
                    ficheDescriptiveMissionDao.save(newitem);
                    emailService.sendMailApprobation(emetteur.get().getEmail(), PROCESS_CODE, newitem.getReference());
                    notifyComptables(newitem.getReference(), emetteurNom);
                }
            } else {
                ficheDescriptiveMission.setValidateurSuivant(premierValidateur);
                ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
                newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);
                emailService.sendMailNewDemande(
                        premierValidateur.getUser().getEmail(),
                        PROCESS_CODE,
                        newitem.getReference(),
                        emetteurNom
                );
            }
        } else {
            ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
            newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);
            newitem.setTraite(true);
            newitem.setFavorable(true);
            newitem.setValidateurSuivant(null);
            ficheDescriptiveMissionDao.save(newitem);
            emailService.sendMailApprobation(emetteur.get().getEmail(), PROCESS_CODE, newitem.getReference());
            notifyComptables(newitem.getReference(), emetteurNom);
        }

        return new ResponseConstant().ok(newitem);
    }

    @Override
    public ResponseModel updateEntity(FicheDescriptiveMission ficheDescriptiveMission) {
        validateFDM(ficheDescriptiveMission);

        if (ficheDescriptiveMission.getTypeProcessus() == null) {
            throw new ObjectNotValidException("Type Obligatoire");
        }

        Optional<User> emetteur = userRepository.findByReference(currentUserService.getCurrentUserRef());
        if (emetteur.isEmpty()) {
            throw new ObjectNotValidException("User Obligatoire");
        }

        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ficheDescriptiveMission.getReference());
        if (result.isPresent()) {
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

            ficheDescriptiveMissionDao.save(item);
            return new ResponseConstant().ok("Action effectuée avec succès");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(ficheDescriptiveMissionDao.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ref);
        if (result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<FicheDescriptiveMission> result = ficheDescriptiveMissionDao.findByReference(ref);
        if (result.isPresent()) {
            FicheDescriptiveMission type = result.get();
            type.setDelete(true);
            ficheDescriptiveMissionDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succès");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvée");
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
        String currentUserNom = currentUser.getLastName() + " " + currentUser.getName();
        String emetteurNom = fdm.getEmetteur().getLastName() + " " + fdm.getEmetteur().getName();

        if (decision == Choix_decisions.VALIDER) {
            Validateur validateurActuel = fdm.getValidateurSuivant();

            Optional<Validateur> nextValidateur = validateurList.stream()
                    .filter(v -> v.getOrdre() > validateurActuel.getOrdre())
                    .min((v1, v2) -> Integer.compare(v1.getOrdre(), v2.getOrdre()));

            if (nextValidateur.isPresent()) {
                fdm.setValidateurSuivant(nextValidateur.get());
                emailService.sendMailNewDemande(
                        nextValidateur.get().getUser().getEmail(),
                        PROCESS_CODE,
                        fdm.getReference(),
                        emetteurNom
                );
            } else {
                fdm.setTraite(true);
                fdm.setFavorable(true);
                fdm.setValidateurSuivant(null);
                emailService.sendMailApprobation(fdm.getEmetteur().getEmail(), PROCESS_CODE, fdm.getReference());
                notifyComptables(fdm.getReference(), emetteurNom);
            }
        } else if (decision == Choix_decisions.REJETER) {
            fdm.setTraite(true);
            fdm.setFavorable(false);
            fdm.setValidateurSuivant(null);

            emailService.sendMailRejet(
                    fdm.getEmetteur().getEmail(),
                    PROCESS_CODE,
                    fdm.getReference(),
                    currentUserNom,
                    commentaire
            );

            notifyPreviousValidatorsOnRejection(fdm, currentUser, commentaire);
        } else if (decision == Choix_decisions.A_CORRIGER) {
            fdm.setTraite(false);
            Validateur validateurActuel = fdm.getValidateurSuivant();

            Validateur premierValidateur = validateurList.isEmpty() ? null : validateurList.getFirst();

            if (premierValidateur != null && validateurActuel.getId().equals(premierValidateur.getId())) {
                fdm.setValidateurSuivant(null);
                emailService.sendMailCorrection(
                        fdm.getEmetteur().getEmail(),
                        PROCESS_CODE,
                        fdm.getReference(),
                        commentaire
                );
            } else {
                Optional<Validateur> previousValidateur = validateurRepository.findPreviousValidator(
                        fdm.getTypeProcessus().getId(),
                        validateurActuel.getOrdre()
                );

                if (previousValidateur.isPresent()) {
                    if (previousValidateur.get().getUser().getId().equals(fdm.getEmetteur().getId())) {
                        fdm.setValidateurSuivant(null);
                        emailService.sendMailCorrection(
                                fdm.getEmetteur().getEmail(),
                                PROCESS_CODE,
                                fdm.getReference(),
                                commentaire
                        );
                    } else {
                        fdm.setValidateurSuivant(previousValidateur.get());
                        emailService.sendMailCorrection(
                                previousValidateur.get().getUser().getEmail(),
                                PROCESS_CODE,
                                fdm.getReference(),
                                commentaire
                        );
                        emailService.sendMailCorrection(
                                fdm.getEmetteur().getEmail(),
                                PROCESS_CODE,
                                fdm.getReference(),
                                commentaire
                        );
                    }
                } else {
                    fdm.setValidateurSuivant(null);
                    emailService.sendMailCorrection(
                            fdm.getEmetteur().getEmail(),
                            PROCESS_CODE,
                            fdm.getReference(),
                            commentaire
                    );
                }
            }
        }

        ficheDescriptiveMissionDao.save(fdm);

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
    private void notifyPreviousValidatorsOnRejection(FicheDescriptiveMission fdm, User rejeteur, String raison) {
        List<TraitementFicheDescriptiveMission> traitements = traitementFicheDescriptiveMissionDao.findByFicheDescriptiveMissionId(fdm.getId());
        String rejeteurNom = rejeteur.getLastName() + " " + rejeteur.getName();

        for (TraitementFicheDescriptiveMission t : traitements) {
            if (t.getTraiteur() != null && !t.getTraiteur().getId().equals(rejeteur.getId())) {
                emailService.sendMailRejet(
                        t.getTraiteur().getEmail(),
                        PROCESS_CODE,
                        fdm.getReference(),
                        rejeteurNom,
                        raison
                );
            }
        }
    }

    /**
     * Valider les champs obligatoires d'une FDM
     */
    private void validateFDM(FicheDescriptiveMission fdm) {
        if (fdm.getNomProjet() == null || fdm.getNomProjet().isEmpty() || fdm.getNomProjet().isBlank()) {
            throw new ObjectNotValidException("Nom Obligatoire");
        }

        if (fdm.getLieuMission() == null || fdm.getLieuMission().isEmpty() || fdm.getLieuMission().isBlank()) {
            throw new ObjectNotValidException("Lieu Obligatoire");
        }

        if (fdm.getObjectifMission() == null || fdm.getObjectifMission().isEmpty() || fdm.getObjectifMission().isBlank()) {
            throw new ObjectNotValidException("Objectif Obligatoire");
        }

        if (fdm.getPerdieme() == null || fdm.getPerdieme() < 0) {
            throw new ObjectNotValidException("Perdieme Obligatoire");
        }

        if (fdm.getTransport() == null || fdm.getTransport() < 0) {
            throw new ObjectNotValidException("Transport Obligatoire");
        }

        if (fdm.getPeage() == null || fdm.getPeage() < 0) {
            throw new ObjectNotValidException("Peage Obligatoire");
        }

        if (fdm.getLaisserPasser() == null || fdm.getLaisserPasser() < 0) {
            throw new ObjectNotValidException("Laisser passer Obligatoire");
        }

        if (fdm.getBonEssence() == null || fdm.getBonEssence() < 0) {
            throw new ObjectNotValidException("Bon essence Obligatoire");
        }

        if (fdm.getHotel() == null || fdm.getHotel() < 0) {
            throw new ObjectNotValidException("Hotel Obligatoire");
        }

        if (fdm.getDivers() == null || fdm.getDivers() < 0) {
            throw new ObjectNotValidException("Divers Obligatoire");
        }

        if (fdm.getDateDepart() == null || fdm.getDateDepart().isBefore(LocalDate.now())) {
            throw new ObjectNotValidException("Date départ erreur");
        }

        if (fdm.getDateProbableRetour() == null) {
            throw new ObjectNotValidException("Date probable retour erreur");
        }

        if (fdm.getDateDepart().isAfter(fdm.getDateProbableRetour())) {
            throw new ObjectNotValidException("Date erreur");
        }
    }

    public static int calculerDuree(LocalDate depart, LocalDate arrivee) {
        if (depart.isEqual(arrivee)) {
            return 1;
        } else {
            return (int) Duration.between(depart.atStartOfDay(), arrivee.atStartOfDay()).toDays();
        }
    }

    @Override
    public ResponseModel uploadFilesToFDM(String reference, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return new ResponseConstant().ok("Pas de fichiers à uploader");
        }

        try {
            Optional<FicheDescriptiveMission> fdmOpt = ficheDescriptiveMissionDao.findByReference(reference);
            if (fdmOpt.isEmpty()) {
                throw new ObjectNotValidException("FDM avec la référence " + reference + " non trouvée");
            }

            FicheDescriptiveMission fdm = fdmOpt.get();

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

            int successCount = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                try {
                    ResponseModel storageResponse = storageService.store(file);

                    if (storageResponse.getCode() == 200) {
                        FileData fileData = new FileData();
                        fileData.setOldName(file.getOriginalFilename());
                        fileData.setType(file.getContentType());
                        fileData.setSize(file.getSize());
                        fileData.setFilePath(file.getOriginalFilename());
                        fileData = fileDataDao.save(fileData);

                        FileDataPieceJointe link = new FileDataPieceJointe();
                        link.setFileData(fileData);
                        link.setPieceJointe(pieceJointe);
                        fileDataPieceJointeDao.save(link);

                        successCount++;
                    }
                } catch (Exception e) {
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
