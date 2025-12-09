package tg.idstechnologie.plateforme.services.idsdemande;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.idsdemande.ValidateurRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.ValidateurInterface;
import tg.idstechnologie.plateforme.models.idsdemande.Validateur;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ValidateurService  implements ValidateurInterface {

    private final ValidateurRepository validateurDao;

    @Override
    public ResponseModel createEntity(Validateur validateur) {
        if(validateur.getOrdre() == null || validateur.getOrdre() <=0 ) {
            throw new ObjectNotValidException("Ordre Obligatoire");
        }

        if(validateur.getTypeProcessus() == null) {
            throw new ObjectNotValidException("Type processus Obligatoire");
        }

        validateurDao.save(validateur);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(Validateur validateur) {
        if(validateur.getOrdre() == null || validateur.getOrdre() <=0 ) {
            throw new ObjectNotValidException("Ordre Obligatoire");
        }

        if(validateur.getTypeProcessus() == null) {
            throw new ObjectNotValidException("Type processus Obligatoire");
        }

        if(validateur.getUser() == null) {
            throw new ObjectNotValidException("User Obligatoire");
        }

        if(validateur.getReference() == null || validateur.getReference().isEmpty() || validateur.getReference().isBlank()) {
            throw new ObjectNotValidException("Reference Obligatoire");
        }

        Optional<Validateur> result = validateurDao.findByReference(validateur.getReference());
        if(result.isPresent()) {
            Validateur item = result.get();
            item.setOrdre(validateur.getOrdre() != null ? validateur.getOrdre() : item.getOrdre());
            item.setUser(validateur.getUser() != null ? validateur.getUser() : item.getUser());
            item.setTypeProcessus(validateur.getTypeProcessus() != null ? validateur.getTypeProcessus() : item.getTypeProcessus());

            validateurDao.save(item);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(validateurDao.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<Validateur> result = validateurDao.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<Validateur> result = validateurDao.findByReference(ref);
        if(result.isPresent()) {
            Validateur type = result.get();
            type.setDelete(true);
            validateurDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
public ResponseModel getValidateursByTypeProcessus(Long typeProcessusId) {
    List<Validateur> validateurs = validateurDao.findByTypeProcessusIdAndDeleteFalse(typeProcessusId);
    return new ResponseConstant().ok(validateurs);
}
}
