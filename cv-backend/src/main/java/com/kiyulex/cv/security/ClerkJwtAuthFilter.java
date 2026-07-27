package com.kiyulex.cv.security;

import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ClerkJwtAuthFilter extends OncePerRequestFilter {

    @Value("${clerk.issuer}")
    private String clerkIssuer;

    private final ClerkJwksProvider jwksProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Allow webhook requests to pass through without JWT validation
        String path = request.getServletPath();
        String method = request.getMethod();

        if (isPublicPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }


        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authorization header missing or invalid");
            return;
        }

        String token = authHeader.substring(7);

        try {
            //Validate JWT using your jwksProvider
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKeyResolver(jwksProvider.getSigningKeyResolver())
                    .requireIssuer(clerkIssuer)
                    .build()
                    .parseClaimsJws(token);

            String clerkId = claims.getBody().getSubject();

            Optional<User> userOpt = userRepository.findByClerkId(clerkId);
            if (userOpt.isEmpty()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                        "User is not synchronized from Clerk: " + clerkId);
                return;
            }

            User user = userOpt.get();
            if (user.isBlocked()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "User Blocked");
                return;
            }

            List<GrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()));


            //If valid, set authentication in SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            claims.getBody().getSubject(),
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (JwtException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path, String method) {
        boolean isPublicPositionsRead =
                "GET".equals(method)
                        && (path.equals("/positions")
                        || path.matches("^/positions/\\d+$")
                        || path.equals("/positions/latest"));

        return path.contains("/webhooks/")
                || isPublicPositionsRead
                || path.contains("/main-page")
                || path.startsWith("/ws");
    }
}