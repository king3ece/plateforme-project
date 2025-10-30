package tg.idstechnologie.plateforme.dao.idsdemande;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.TypeProcessus;

import java.util.Optional;

@Repository
public interface TypeProcessusRepository extends JpaRepository<TypeProcessus, Long> {

    @Query(value = "SELECT * FROM type_processus WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM type_processus WHERE is_delete = false ORDER BY create_date DESC",
            nativeQuery = true)
    Page<TypeProcessus> handleAllEntity(Pageable pageable);



    @Query(value = "select * from type_processus  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<TypeProcessus> findByReference(String ref);

    @Query(value = "select * from type_processus  where is_delete = false and code = :code",
            nativeQuery = true
    )
    Optional<TypeProcessus> findByCode(String code);


}
