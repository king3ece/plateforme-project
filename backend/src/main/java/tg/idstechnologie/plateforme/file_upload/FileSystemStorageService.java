package tg.idstechnologie.plateforme.file_upload;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;
import tg.idstechnologie.plateforme.dao.data_models.FileDataDao;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.exceptions.StorageException;
import tg.idstechnologie.plateforme.exceptions.StorageFileNotFoundException;
import tg.idstechnologie.plateforme.models.data_models.FileData;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.services.data_models.FileDataService;


@Service
@RequiredArgsConstructor
@Transactional
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;
    private final FileDataService fileDataService;
    //private final FileDataFolderDao fileDataFolderDao;
    //private final FolderDao folderDao;
    private final UserRepository userRepository;
    private final FileDataDao fileDataDao;
    //private final CurrentUserService currentUserService;

    @Autowired
    public FileSystemStorageService(StorageProperties properties, FileDataService fileDataService, UserRepository userRepository, FileDataDao fileDataDao) {
        this.fileDataService = fileDataService;
        //this.fileDataFolderDao = fileDataFolderDao;
        //this.folderDao = folderDao;
        this.userRepository = userRepository;
        this.fileDataDao = fileDataDao;
        //this.currentUserService = currentUserService;


        if(properties.getLocation().trim().length() == 0){
            throw new StorageException("File upload location can not be Empty.");
        }

        this.rootLocation = Paths.get(properties.getLocation());
    }

    @Override
    public ResponseModel store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file.");
            }
            String name = LocalDate.now().toString()+UUID.randomUUID().toString();
            String destFileName = name+file.getOriginalFilename();
            Path destinationFile = this.rootLocation.resolve(
                            Paths.get(destFileName))
                    .normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                // This is a security check
                throw new StorageException(
                        "Cannot store file outside current directory.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile,
                        StandardCopyOption.REPLACE_EXISTING);
            }
            FileData fileDataDto = new FileData(null, name,file.getContentType(),file.getOriginalFilename(),destinationFile.toString(),file.getSize());
            return fileDataService.createEntity(fileDataDto);
        }
        catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.rootLocation, 1)
                    .filter(path -> !path.equals(this.rootLocation))
                    .map(this.rootLocation::relativize);
        }
        catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }

    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(
            String filename,
            String file_data_doc_ref,
            String folderRef,
            String userRef,
            String file_data_ref
    ) {
        try {
            if(file_data_ref == null || file_data_ref.isEmpty() || file_data_ref.isBlank()) {
                throw new ObjectNotValidException("Reference fichier Obligatoire");
            }
            if(userRef == null || userRef.isEmpty() || userRef.isBlank()) {
                throw new ObjectNotValidException("Reference utilisateur Obligatoire");
            }
            if(folderRef == null || folderRef.isEmpty() || folderRef.isBlank()) {
                throw new ObjectNotValidException("Reference dossier Obligatoire");
            }
            if(file_data_doc_ref == null || file_data_doc_ref.isEmpty() || file_data_doc_ref.isBlank()) {
                throw new ObjectNotValidException("Reference Obligatoire");
            }

//            Optional<FileDataFolder> fileDataFolder = fileDataFolderDao.findByReference(file_data_doc_ref);
//            if(fileDataFolder.isEmpty()) {
//                throw new ObjectNotValidException("Reference non trouvé");
//            }
//            Optional<Folder> folder = folderDao.findByReference(folderRef);
//            if(folder.isEmpty()) {
//                throw new ObjectNotValidException("Dossier non trouvé");
//            }
            Optional<FileData> fileData = fileDataDao.findByReference(file_data_ref);
            if(fileData.isEmpty()) {
                throw new ObjectNotValidException("Fichier non trouvé");
            }
            Optional<User> user = userRepository.findByReference(userRef);
            if(user.isEmpty()) {
                throw new ObjectNotValidException("Lien erroné!");
            }
//            if(!Objects.equals(currentUserService.getCurrentUserRef(), user.get().getReference())) {
//                throw new ObjectNotValidException("Lien erroné!!");
//            }
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new StorageFileNotFoundException(
                        "Could not read file: " + filename);

            }
        }
        catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        }
        catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
    }

}
