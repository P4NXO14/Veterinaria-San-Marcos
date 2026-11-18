package cl.sanmarcos.usuarios.configuracion;

import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.util.Locale;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class Seguridad {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/usuarios/admin/**").hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .httpBasic(withDefaults());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository repository) {
        return correo -> {
            String normalizado = correo.trim().toLowerCase(Locale.ROOT);

            Usuario usuario = repository.findByCorreo(normalizado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

            return User.withUsername(usuario.getCorreo())
                .password(usuario.getPasswordHash())
                .roles(usuario.getRol().toUpperCase(Locale.ROOT))
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}