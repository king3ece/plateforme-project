package tg.idstechnologie.plateforme.dao.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tg.idstechnologie.plateforme.secu.user.Role;
import tg.idstechnologie.plateforme.secu.user.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tg.idstechnologie.plateforme.secu.user.*;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query(value = "SELECT * FROM _users WHERE is_delete = false ORDER BY id DESC",
            countQuery = "SELECT COUNT(*) FROM _users WHERE is_delete = false",
            nativeQuery = true)
    Page<User> handleAllEntity(Pageable pageable);

    @Query(value = "select * from _users  where is_delete = false and reference = :ref",
            nativeQuery = true
    )
    Optional<User> findByReference(@Param("ref") String ref);
    Optional<User> findByEmail(String email);
    Optional<User> findByActivationToken(String activationToken);
    Optional<User> findByRoles(Role roles);

}

