package tg.idstechnologie.plateforme.file_upload;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;


@ConfigurationProperties("storage")
@Data
public class StorageProperties {

    /**
     * Folder location for storing files
     */
    private String location = "upload-dir";

    public void setLocation(String location) {
        this.location = location;
    }

}
