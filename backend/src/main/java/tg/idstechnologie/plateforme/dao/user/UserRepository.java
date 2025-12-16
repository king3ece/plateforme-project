package tg.idstechnologie.plateforme.dao.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.secu.user.User;
import tg.idstechnologie.plateforme.secu.user.Role;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * ✅ NOUVEAU : Méthode manquante qui récupère tous les users non supprimés
     * Utilisée par UserService.getAllEntityNotDeleted()
     */
    @Query(value = """
        SELECT * FROM _users 
        WHERE is_delete = false 
        ORDER BY create_date DESC
        """,
        countQuery = "SELECT COUNT(*) FROM _users WHERE is_delete = false",
        nativeQuery = true
    )
    Page<User> handleAllEntity(Pageable pageable);

    /**
     * Récupère un user par sa reference (UUID unique)
     */
    @Query(value = """
        SELECT * FROM _users 
        WHERE is_delete = false 
        AND reference = :ref
        """,
        nativeQuery = true
    )
    Optional<User> findByReference(String ref);

    /**
     * Récupère un user par son email
     */
    Optional<User> findByEmail(String email);

    boolean existsByRoles(Role role);

    /**
     * Récupère un user par son activation token
     */
    Optional<User> findByActivationToken(String activationToken);

    /**
     * Récupère les utilisateurs ayant un poste spécifique (ex: comptable).
     */
    @Query(value = """
        SELECT u.* FROM _users u
        INNER JOIN postes p ON u.poste_id = p.id
        WHERE u.is_delete = false
          AND p.is_delete = false
          AND p.code = :code
        """, nativeQuery = true)
    List<User> findByPosteCode(@Param("code") String code);
}
