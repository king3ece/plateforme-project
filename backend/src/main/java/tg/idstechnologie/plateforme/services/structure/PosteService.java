package tg.idstechnologie.plateforme.services.structure;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.structure.PosteRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.structure.PosteInterface;
import tg.idstechnologie.plateforme.models.structure.Poste;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class PosteService implements PosteInterface {


    private final PosteRepository posteDao;


    @Override
    public ResponseModel createEntity(Poste poste) {
        if(poste.getCode() == null || poste.getCode().isEmpty() ||poste.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(poste.getLibelle() == null || poste.getLibelle().isEmpty() || poste.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        posteDao.save(poste);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(Poste poste) {
        if(poste.getCode() == null || poste.getCode().isEmpty() ||poste.getCode().isBlank()) {
            throw new ObjectNotValidException("Code Obligatoire");
        }

        if(poste.getLibelle() == null || poste.getLibelle().isEmpty() || poste.getLibelle().isBlank()) {
            throw new ObjectNotValidException("Libelle Obligatoire");
        }

        Optional<Poste> result = posteDao.findByReference(poste.getReference());
        if(result.isPresent()) {
            Poste poste1 = result.get();
            poste1.setLibelle((!Objects.equals(poste1.getLibelle(), poste.getLibelle()) ? poste.getLibelle() : poste1.getLibelle()));
            poste1.setCode((!Objects.equals(poste1.getCode(), poste.getCode()))?poste.getCode():poste1.getCode());
            posteDao.save(poste1);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        Page<Poste> postes = posteDao.handleAllEntity(pageable);
        return new ResponseConstant().ok(postes);
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<Poste> result = posteDao.findByReference(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<Poste> result = posteDao.findByReference(ref);
        if(result.isPresent()) {
            Poste type = result.get();
            type.setDelete(true);
            posteDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }
}
