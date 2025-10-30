package tg.idstechnologie.plateforme;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import tg.idstechnologie.plateforme.file_upload.StorageProperties;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableConfigurationProperties({StorageProperties.class})
@EnableJpaRepositories(basePackages = "tg.idstechnologie.plateforme.dao")
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class PlateformeApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlateformeApplication.class, args);
	}

}