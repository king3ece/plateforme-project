package tg.idstechnologie.plateforme.secu.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;
import tg.idstechnologie.plateforme.dao.user.TokenRepository;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {


    private final TokenRepository tokenRepository;

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        jwtToken = authHeader.substring(7);
        var dbToken = tokenRepository.findByToken(jwtToken).orElse(null);
        if(dbToken != null) {
            dbToken.setExpired(true);
            dbToken.setRevoked(true);
            tokenRepository.save(dbToken);
        }

    }
}
