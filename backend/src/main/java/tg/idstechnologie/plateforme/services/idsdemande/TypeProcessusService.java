package tg.idstechnologie.plateforme.services.idsdemande;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.idsdemande.TypeProcessusRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.idsdemande.TypeProcessusInterface;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class TypeProcessusService  implements TypeProcessusInterface {

    private final TypeProcessusRepository typeProcessusRepository;

    @Override
    public ResponseModel createEntity(TypeProcessus typeProcessus) {
        if(typeProcessus.getCode() == null || typeProcessus.getCode().isEmpty() || typeProcessus.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(typeProcessus.getLibelle() == null || typeProcessus.getLibelle().isEmpty() || typeProcessus.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        typeProcessusRepository.save(typeProcessus);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(TypeProcessus typeProcessus) {
        if(typeProcessus.getCode() == null || typeProcessus.getCode().isEmpty() ||typeProcessus.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(typeProcessus.getLibelle() == null || typeProcessus.getLibelle().isEmpty() || typeProcessus.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        if(typeProcessus.getReference() == null || typeProcessus.getReference().isEmpty() || typeProcessus.getReference().isBlank()) {
            throw new ObjectNotValidException("Reference Obligatoire");
        }

        Optional<TypeProcessus> result = typeProcessusRepository.findByReference(typeProcessus.getReference());
        if(result.isPresent()) {
            TypeProcessus item = result.get();
            item.setLibelle(typeProcessus.getLibelle());
            item.setCode(typeProcessus.getCode());
            /*if(subdivision.getTypeSubdivision() !=null) {
                Optional<TypeSubdivision> resultTS =typeSubdivisionDao.findByReference(subdivision.getTypeSubdivision().getReference());
                if(
                        resultTS.isPresent() &&
                                !resultTS.get().getReference().equals(result.get().getTypeSubdivision().getReference())) {

                    item.setTypeSubdivision(resultTS.get());

                }
            }*/

            typeProcessusRepository.save(item);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(typeProcessusRepository.handleAllEntity(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<TypeProcessus> result = typeProcessusRepository.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<TypeProcessus> result = typeProcessusRepository.findByReference(ref);
        if(result.isPresent()) {
            TypeProcessus type = result.get();
            type.setDelete(true);
            typeProcessusRepository.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }
}
