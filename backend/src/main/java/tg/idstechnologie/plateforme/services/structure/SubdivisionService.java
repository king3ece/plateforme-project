package tg.idstechnologie.plateforme.services.structure;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.structure.SubdivisionRepository;
import tg.idstechnologie.plateforme.dao.structure.TypeSubdivisionRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.structure.SubdivisionInterface;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class SubdivisionService implements SubdivisionInterface {

    private final SubdivisionRepository subdivisionDao;
    private final TypeSubdivisionRepository typeSubdivisionDao;

    @Override
    public ResponseModel createEntity(Subdivision subdivision) {
        if(subdivision.getCode() == null || subdivision.getCode().isEmpty() || subdivision.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(subdivision.getLibelle() == null || subdivision.getLibelle().isEmpty() || subdivision.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        subdivisionDao.save(subdivision);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(Subdivision subdivision) {
        if(subdivision.getCode() == null || subdivision.getCode().isEmpty() ||subdivision.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(subdivision.getLibelle() == null || subdivision.getLibelle().isEmpty() || subdivision.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        if(subdivision.getReference() == null || subdivision.getReference().isEmpty() || subdivision.getReference().isBlank()) {
            throw new ObjectNotValidException("Reference Obligatoire");
        }

        Optional<Subdivision> result = subdivisionDao.findByReference(subdivision.getReference());
        if(result.isPresent()) {
            Subdivision item = result.get();
            item.setLibelle(subdivision.getLibelle());
            item.setCode(subdivision.getCode());
            if(subdivision.getTypeSubdivision() !=null) {
                Optional<TypeSubdivision> resultTS =typeSubdivisionDao.findByReference(subdivision.getTypeSubdivision().getReference());
                if(
                        resultTS.isPresent() &&
                                !resultTS.get().getReference().equals(result.get().getTypeSubdivision().getReference())) {

                    item.setTypeSubdivision(resultTS.get());

                }
            }

            subdivisionDao.save(item);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(subdivisionDao.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<Subdivision> result = subdivisionDao.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<Subdivision> result = subdivisionDao.findByReference(ref);
        if(result.isPresent()) {
            Subdivision type = result.get();
            type.setDelete(true);
            subdivisionDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }
}
