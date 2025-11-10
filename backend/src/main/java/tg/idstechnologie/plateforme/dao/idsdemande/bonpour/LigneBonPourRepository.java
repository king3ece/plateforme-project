package tg.idstechnologie.plateforme.dao.idsdemande.bonpour;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.bonpour.LigneBonPour;

import java.util.List;
import java.util.Optional;

@Repository
public interface LigneBonPourRepository extends JpaRepository<LigneBonPour, Long> {

    @Query(value = "SELECT * FROM ligne_bon_pours WHERE is_delete = false AND reference = :ref",
            nativeQuery = true)
    Optional<LigneBonPour> findByReference(@Param("ref") String ref);

    @Query(value = "SELECT * FROM ligne_bon_pours WHERE is_delete = false AND bon_pour_id = :bonPourId ORDER BY create_date ASC",
            nativeQuery = true)
    List<LigneBonPour> findByBonPourId(@Param("bonPourId") Long bonPourId);
}
