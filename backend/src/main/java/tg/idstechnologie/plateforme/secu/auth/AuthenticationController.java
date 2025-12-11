package tg.idstechnologie.plateforme.secu.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tg.idstechnologie.plateforme.response.ResponseModel;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

//    @PostMapping("/register")
//    public ResponseEntity<AuthenticationResponse> register(
//            @RequestBody RegisterRequest request
//    )
//    {
//        return ResponseEntity.ok(authenticationService.register(request));
//    }

    @PostMapping("/register")
    public ResponseEntity<ResponseModel> register(
            @RequestBody RegisterRequest request
    )
    {
        return ResponseEntity.ok(authenticationService.register(request));
    }
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> auth(
            @RequestBody AuthenticationRequest request
    )
    {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @GetMapping("/activate")
    public ResponseEntity<ResponseModel> activateUser(@RequestParam("token") String activationToken) {
        return ResponseEntity.ok(authenticationService.activateUser(activationToken));
    }

    @PostMapping("/resend-activation")
    public ResponseEntity<ResponseModel> resendActivationEmail(@RequestBody ResendActivationRequest request) {
        return ResponseEntity.ok(authenticationService.resendActivationEmail(request.getEmail()));
    }

//    @PostMapping("/active/{ref}")
//    public ResponseEntity<AuthenticationResponse> newPassword(
//            @PathVariable String ref
//    )
//    {
//        return ResponseEntity.ok(authenticationService.authenticate(request));
//    }
}
