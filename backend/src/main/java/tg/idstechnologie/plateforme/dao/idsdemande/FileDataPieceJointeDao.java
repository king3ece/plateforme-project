package tg.idstechnologie.plateforme.dao.idsdemande;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.models.idsdemande.FileDataPieceJointe;

import java.util.List;

@Repository
public interface FileDataPieceJointeDao extends JpaRepository<FileDataPieceJointe, Long> {
    // basic JPA repository for FileDataPieceJointe; use findAll() and filter if needed
}
