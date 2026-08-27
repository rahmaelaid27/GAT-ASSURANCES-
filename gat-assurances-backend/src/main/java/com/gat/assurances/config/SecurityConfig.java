package com.gat.assurances.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                // Notifications (tous rôles authentifiés)
                .requestMatchers("/notifications/**").authenticated()

                // Dashboards — chaque rôle accède uniquement à son dashboard
                .requestMatchers("/dashboard/client").hasAnyRole("CLIENT","ADMIN")
                .requestMatchers("/dashboard/gestionnaire").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/dashboard/garage").hasAnyRole("GARAGE","ADMIN")
                .requestMatchers("/dashboard/expert").hasAnyRole("EXPERT","ADMIN")
                .requestMatchers("/dashboard/remorqueur").hasAnyRole("REMORQUEUR","ADMIN")
                .requestMatchers("/dashboard/manager").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers("/dashboard/admin").hasRole("ADMIN")

                // Sinistres
                .requestMatchers(HttpMethod.POST, "/sinistres").hasAnyRole("CLIENT","ADMIN")
                .requestMatchers("/sinistres/mes-sinistres").hasAnyRole("CLIENT","ADMIN")
                .requestMatchers("/sinistres/mes-dossiers").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/sinistres/mes-dossiers-garage").hasAnyRole("GARAGE","ADMIN")
                .requestMatchers(HttpMethod.GET, "/sinistres").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers("/sinistres/*/statut").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/sinistres/*/affecter-garage/**").hasAnyRole("CLIENT","ADMIN")
                .requestMatchers("/sinistres/*/approuver").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/sinistres/*/cloturer").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/sinistres/*/refuser").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/sinistres/*/garages-recommandes").hasAnyRole("CLIENT","GESTIONNAIRE","ADMIN")

                // Forums
                .requestMatchers("/sinistres/*/commentaires/**").authenticated()

                // Garages
                .requestMatchers("/garages/recommandations").hasAnyRole("CLIENT","GESTIONNAIRE","ADMIN")
                .requestMatchers(HttpMethod.GET, "/garages").hasAnyRole("GESTIONNAIRE","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.POST, "/garages").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/garages/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/garages/**").hasRole("ADMIN")

                // Remorquage
                .requestMatchers(HttpMethod.POST, "/remorquages").hasAnyRole("GESTIONNAIRE","ADMIN")
                .requestMatchers("/remorquages/en-attente").hasAnyRole("REMORQUEUR","ADMIN")
                .requestMatchers("/remorquages/mes-missions").hasAnyRole("REMORQUEUR","ADMIN")
                .requestMatchers("/remorquages/*/accepter").hasRole("REMORQUEUR")
                .requestMatchers("/remorquages/*/avancer").hasAnyRole("REMORQUEUR","ADMIN")

                // Missions
                .requestMatchers("/missions/**").authenticated()

                // Experts
                .requestMatchers(HttpMethod.GET, "/experts").hasAnyRole("CLIENT","GESTIONNAIRE","MANAGER","ADMIN")
                .requestMatchers(HttpMethod.POST, "/experts").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/experts/**").hasRole("ADMIN")

                // Le client choisit un partenaire disponible lors de la déclaration
                .requestMatchers(HttpMethod.GET, "/remorqueurs").hasAnyRole("CLIENT","GESTIONNAIRE","MANAGER","ADMIN")

                // Clients
                .requestMatchers(HttpMethod.GET, "/clients").hasAnyRole("GESTIONNAIRE","MANAGER","ADMIN")

                // Véhicules
                .requestMatchers("/vehicules/client/**").hasAnyRole("CLIENT","GESTIONNAIRE","ADMIN")

                // Stats / Admin
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/stats/**").hasAnyRole("MANAGER","ADMIN")

                .anyRequest().authenticated()
            )
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
