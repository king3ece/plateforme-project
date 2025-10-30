package tg.idstechnologie.plateforme.services.data_models;

import lombok.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.data_models.FileDataDao;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.interfaces.data_models.FileDataInterface;
import tg.idstechnologie.plateforme.models.data_models.FileData;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class FileDataService implements FileDataInterface {
    private final FileDataDao fileDataDao;


    @Override
    public ResponseModel createEntity(FileData fileData) {
        if(fileData.getOldName() == null || fileData.getOldName().isEmpty() || fileData.getOldName().isBlank()) {
            throw new ObjectNotValidException("Nom Obligatoire");
        }

        if(fileData.getType() == null || fileData.getType().isEmpty() || fileData.getType().isBlank()) {
            throw new ObjectNotValidException("Type Obligatoire");
        }

        if(fileData.getFilePath() == null || fileData.getFilePath().isEmpty() || fileData.getFilePath().isBlank()) {
            throw new ObjectNotValidException("File path Obligatoire");
        }

        if(fileData.getSize() == null) {
            throw new ObjectNotValidException("Size Obligatoire");
        }



        FileData folder=fileDataDao.save(fileData);
        //

        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(FileData fileData) {
        if(fileData.getOldName() == null || fileData.getOldName().isEmpty() || fileData.getOldName().isBlank()) {
            throw new ObjectNotValidException("Nom Obligatoire");
        }

        if(fileData.getType() == null || fileData.getType().isEmpty() || fileData.getType().isBlank()) {
            throw new ObjectNotValidException("Type Obligatoire");
        }

        if(fileData.getFilePath() == null || fileData.getFilePath().isEmpty() || fileData.getFilePath().isBlank()) {
            throw new ObjectNotValidException("File path Obligatoire");
        }

        if(fileData.getSize() == null) {
            throw new ObjectNotValidException("Size Obligatoire");
        }

        /*Optional<FileData> result = fileDataDao.findByReference(fileDataDto.reference());
        if(result.isPresent()) {
            FileData item = result.get();
            item.set(fileDataDto.name());
            item.set(folderDto.description());
            // ***** Modifier type subdivision
            if(folderDto.parent_reference() != null) {
                Optional<Folder> resultF =folderDao.findByReference(folderDto.parent_reference());
                if(
                        resultF.isPresent() &&
                                !resultF.get().getReference().equals(result.get().getParent().getReference())) {

                    item.setParent(resultF.get());

                }
            }

            folderDao.save(item);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }*/
        return new ResponseConstant().noContent("Aucune action effectué");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        return new ResponseConstant().ok(fileDataDao.getEntityNotDelete(pageable));
    }

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<FileData> result = fileDataDao.getOneEntityNotDelete(ref);
        if(result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<FileData> result = fileDataDao.findByReference(ref);
        if(result.isPresent()) {
            FileData type = result.get();
            type.setDelete(true);
            fileDataDao.save(type);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }
}
