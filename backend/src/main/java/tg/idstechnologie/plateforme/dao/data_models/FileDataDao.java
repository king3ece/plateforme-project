package tg.idstechnologie.plateforme.dao.data_models;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.data_models.FileData;

import java.util.Optional;

@Repository
public interface FileDataDao extends JpaRepository<FileData, Long> {
    @Query(
            value = "select * from FileData ORDER BY create_date DESC;",
            countQuery = "SELECT count(*) FROM FileData ORDER BY create_date DESC",
            nativeQuery = true
    )
    Page<FileData> getEntityNotDelete(Pageable pageable);

    @Query(
            value = "select * from FileData where reference =:ref;",
            nativeQuery = true
    )
    Optional<FileData> getOneEntityNotDelete(String ref);

    Optional<FileData> findByReference(String reference);
}
