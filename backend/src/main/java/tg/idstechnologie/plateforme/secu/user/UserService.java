package tg.idstechnologie.plateforme.secu.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.idstechnologie.plateforme.dao.user.UserRepository;
import tg.idstechnologie.plateforme.dao.structure.PosteRepository;
import tg.idstechnologie.plateforme.exceptions.ObjectNotValidException;
import tg.idstechnologie.plateforme.extern.UserInterface;
import tg.idstechnologie.plateforme.response.ResponseConstant;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.models.structure.Poste;

import java.security.Principal;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService implements UserInterface {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;
    private final PosteRepository posteRepository;

    public void changePassword(ChangePasswordRequest request, Principal connectUser) {

        var user = ((User) ((UsernamePasswordAuthenticationToken) connectUser).getPrincipal());
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalStateException("Mauvais mot de passe");
        }
        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new IllegalStateException("Les mots de passe ne sont pas les mêmes");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);
    }

    @Override
    public ResponseModel createEntity(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ObjectNotValidException("Email Obligatoire");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ObjectNotValidException("Mot de passe Obligatoire");
        }

        // encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // handle poste association if provided by reference
        if (user.getPoste() != null && user.getPoste().getReference() != null) {
            Optional<Poste> p = posteRepository.findByReference(user.getPoste().getReference());
            p.ifPresent(user::setPoste);
        }

        repository.save(user);
        return new ResponseConstant().ok("Action effectuée avec succes");
    }

    @Override
    public ResponseModel updateEntity(User user) {
        Optional<User> result = repository.findByReference(user.getReference());
        if (result.isPresent()) {
            User u = result.get();

            u.setName(!Objects.equals(u.getName(), user.getName()) ? user.getName() : u.getName());
            u.setLastName(!Objects.equals(u.getLastName(), user.getLastName()) ? user.getLastName() : u.getLastName());
            u.setEmail(!Objects.equals(u.getEmail(), user.getEmail()) ? user.getEmail() : u.getEmail());

            // if password provided, encode and update
            if (user.getPassword() != null && !user.getPassword().isBlank()) {
                u.setPassword(passwordEncoder.encode(user.getPassword()));
            }

            // role
            u.setRoles(user.getRoles() != null ? user.getRoles() : u.getRoles());

            // poste update: accept poste reference
            if (user.getPoste() != null && user.getPoste().getReference() != null) {
                Optional<Poste> p = posteRepository.findByReference(user.getPoste().getReference());
                p.ifPresent(u::setPoste);
            }

            repository.save(u);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel getAllEntityNotDeleted(Pageable pageable) {
        Page<User> users = repository.handleAllEntity(pageable);
        //System.out.println(users.toString());
        return new ResponseConstant().ok(users);
    };

    @Override
    public ResponseModel getOneEntityNotDeleted(String ref) {
        Optional<User> result = repository.findByReference(ref);
        if (result.isPresent()) {
            return new ResponseConstant().ok(result.get());
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

    @Override
    public ResponseModel deleteOneEntityNotDeleted(String ref) {
        Optional<User> result = repository.findByReference(ref);
        if (result.isPresent()) {
            User user = result.get();
            user.setDelete(true);
            repository.save(user);
            return new ResponseConstant().ok("Action effectuée avec succes");
        }
        return new ResponseConstant().noContent("Aucune correspondance trouvé");
    }

}
