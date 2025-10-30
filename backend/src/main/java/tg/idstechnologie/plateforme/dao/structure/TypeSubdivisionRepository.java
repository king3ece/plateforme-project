package tg.idstechnologie.plateforme.dao.structure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.structure.Poste;
import tg.idstechnologie.plateforme.models.structure.TypeSubdivision;

import java.util.Optional;

@Repository
public interface TypeSubdivisionRepository extends JpaRepository<TypeSubdivision, Long> {

    @Query(value = "SELECT * FROM type_subdivisions WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM type_subdivisions WHERE is_delete = false",
            nativeQuery = true)
    Page<TypeSubdivision> handleAllEntity(Pageable pageable);


    @Query(value = "select * from type_subdivisions  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<TypeSubdivision> findByReference(String ref);
}
