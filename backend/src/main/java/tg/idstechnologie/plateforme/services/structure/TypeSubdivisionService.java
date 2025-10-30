package tg.idstechnologie.plateforme.services.structure;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.structure.TypeSubdivisionRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.structure.TypeSubdivisionInterface;
import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class TypeSubdivisionService implements TypeSubdivisionInterface {
    private final TypeSubdivisionRepository typeSubdivisionDao;

    @Override
    public ResponseModel createEntity(TypeSubdivision typeSubdivision){
        if(typeSubdivision.getCode() == null || typeSubdivision.getCode().isEmpty() ||typeSubdivision.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(typeSubdivision.getLibelle() == null || typeSubdivision.getLibelle().isEmpty() || typeSubdivision.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        typeSubdivisionDao.save(typeSubdivision);
        return new ResponseConstant().ok("Action effectuée avec succes");

    }

    @Override
    public ResponseModel updateEntity(TypeSubdivision typeSubdivision) {
        if(typeSubdivision.getCode() == null || typeSubdivision.getCode().isEmpty() ||typeSubdivision.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(typeSubdivision.getLibelle() == null || typeSubdivision.getLibelle().isEmpty() || typeSubdivision.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        Optional<TypeSubdivision> result = typeSubdivisionDao.findByReference(typeSubdivision.getReference());
        if(result.isPresent()) {
            TypeSubdivision type = result.get();
            type.setLibelle(typeSubdivision.getLibelle());
            type.setCode(typeSubdivision.getCode());
            typeSubdivisionDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");

    }

    @Override
    public ResponseModel getAllTypeSubdivisionsNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(typeSubdivisionDao.findAll(pageable));
    }

//  @Override
//     public ResponseModel getAllTypeSubdivisionsNotDeleted(Pageable pageable) {
//         return new ResponseConstant().ok(typeSubdivisionDao.handleAllEntity(pageable));
//     }
    
    @Override
    public ResponseModel getOneTypeSubdivisionsNotDeleted(String ref) {
        Optional<TypeSubdivision> result = typeSubdivisionDao.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneTypeSubdivisionsNotDeleted(String ref) {
        Optional<TypeSubdivision> result = typeSubdivisionDao.findByReference(ref);
        if(result.isPresent()) {
            TypeSubdivision type = result.get();
            type.setDelete(true);
            typeSubdivisionDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }



}
