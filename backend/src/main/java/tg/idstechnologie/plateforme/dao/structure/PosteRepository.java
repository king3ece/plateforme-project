package tg.idstechnologie.plateforme.dao.structure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.structure.Poste;
// import tg.idstechnologie.plateforme.secu.user.User;

import java.util.Optional;

@Repository
public interface PosteRepository extends JpaRepository<Poste, Long> {

    @Query(value = "SELECT * FROM postes WHERE is_delete = false ORDER BY create_date DESC",
            countQuery = "SELECT COUNT(*) FROM postes WHERE is_delete = false",
            nativeQuery = true)
    Page<Poste> handleAllEntity(Pageable pageable);

//    @Query(value = "select p from Poste p where p.is_delete=false order by p.create_date DESC",
//            nativeQuery = true
//            )
//    Page<Poste> handleAllEntity(Pageable pageable);


    @Query(value = "select * from postes  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<Poste> findByReference(String ref);


}
