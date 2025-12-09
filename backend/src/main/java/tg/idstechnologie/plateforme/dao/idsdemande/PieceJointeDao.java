package tg.idstechnologie.plateforme.dao.idsdemande;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.PieceJointe;

import java.util.List;
import java.util.Optional;

@Repository
public interface PieceJointeDao extends JpaRepository<PieceJointe, Long> {
    List<PieceJointe> findByParentReferenceAndParentType(String parentReference, String parentType);
    Optional<PieceJointe> findByReference(String reference);
}
