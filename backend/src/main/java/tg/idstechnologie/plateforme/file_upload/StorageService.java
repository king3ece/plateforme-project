package tg.idstechnologie.plateforme.file_upload;


import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    ResponseModel store(MultipartFile file);

    Stream<Path> loadAll();

    Path load(String filename);

    Resource loadAsResource(String filename,String file_data_doc_ref, String folderRef, String userRef, String file_data_ref);

    void deleteAll();

}
