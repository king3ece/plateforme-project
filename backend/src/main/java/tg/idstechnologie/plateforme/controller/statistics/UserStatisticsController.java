package tg.idstechnologie.plateforme.controller.statistics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tg.idstechnologie.plateforme.response.ResponseModel;
import tg.idstechnologie.plateforme.services.statistics.UserStatisticsService;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class UserStatisticsController {

    private final UserStatisticsService userStatisticsService;

    @GetMapping("/user/dashboard")
    public ResponseEntity<ResponseModel> getUserDashboardStats(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userStatisticsService.getUserDashboardStatistics(username));
    }
}
