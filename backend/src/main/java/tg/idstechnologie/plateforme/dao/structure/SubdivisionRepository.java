package tg.idstechnologie.plateforme.dao.structure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.structure.Subdivision;
// import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;

import java.util.Optional;

@Repository
public interface SubdivisionRepository extends JpaRepository<Subdivision, Long> {

    @Query(value = "SELECT * FROM subdivisions WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM subdivisions WHERE is_delete = false",
            nativeQuery = true)
    Page<Subdivision> handleAllEntity(Pageable pageable);


    @Query(value = "select * from subdivisions  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<Subdivision> findByReference(String ref);
}
