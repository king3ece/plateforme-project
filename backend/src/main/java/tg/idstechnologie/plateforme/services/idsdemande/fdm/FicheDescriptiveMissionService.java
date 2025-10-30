package tg.idstechnologie.plateforme.services.idsdemande.fdm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
            throw new ObjectNotValidException("Type Obligatoire");
        }

        ficheDescriptiveMission.setEmetteur(emetteur.get());
        ficheDescriptiveMission.setTypeProcessus(typeProcessus.get());
        ficheDescriptiveMission.setDureeMission(calculerDuree(ficheDescriptiveMission.getDateDepart(),ficheDescriptiveMission.getDateProbableRetour()));
        ficheDescriptiveMission.setTotalEstimatif(
                ficheDescriptiveMission.getPerdieme()+
                ficheDescriptiveMission.getTransport()+
                ficheDescriptiveMission.getPeage()+
                ficheDescriptiveMission.getLaisserPasser()+
                ficheDescriptiveMission.getHotel()+
                ficheDescriptiveMission.getDivers()
        );

        List<Validateur> validateurList = validateurRepository.handleValidatorByProcessCode("FDM");
        if(!validateurList.isEmpty())
        {

            Validateur validateur = validateurList.getFirst();
            ficheDescriptiveMission.setValidateurSuivant(validateur);
            ficheDescriptiveMission.setDateEmission(LocalDateTime.now());
            FicheDescriptiveMission newitem = ficheDescriptiveMissionDao.save(ficheDescriptiveMission);
            emailService.sendMailNewFdm(validateur.getUser().getEmail(), newitem.getId().toString(), emetteur.get().getEmail());

        } else {
            throw new ObjectNotValidException("Validateur vide");
        }


        return new ResponseConstant().ok("Action effectuée avec succes");
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

            item.setDureeMission(calculerDuree(ficheDescriptiveMission.getDateDepart(),ficheDescriptiveMission.getDateProbableRetour()));
            item.setTotalEstimatif(
                    ficheDescriptiveMission.getPerdieme()+
                            ficheDescriptiveMission.getTransport()+
                            ficheDescriptiveMission.getPeage()+
                            ficheDescriptiveMission.getLaisserPasser()+
                            ficheDescriptiveMission.getHotel()+
                            ficheDescriptiveMission.getDivers()
            );



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
            if (!validateurList.isEmpty()) {
                fdm.setValidateurSuivant(validateurList.getFirst());
            }
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
}
