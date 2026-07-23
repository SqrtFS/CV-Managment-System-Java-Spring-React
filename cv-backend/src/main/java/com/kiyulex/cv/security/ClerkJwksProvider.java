package com.kiyulex.cv.security;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;
import java.net.URL;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


import io.jsonwebtoken.SigningKeyResolver;
import io.jsonwebtoken.SigningKeyResolverAdapter;

@Component
public class ClerkJwksProvider {

    private static final Logger logger = LoggerFactory.getLogger(ClerkJwksProvider.class);

    @Value("${clerk.jwks-url}")
    private String jwksUrl;

    private final Map<String, PublicKey> keyCache = new ConcurrentHashMap<>();
    private long lastFetchTime = 0;
    private static final long CACHE_TTL = 3600000; // 1hour

    public PublicKey getPublicKey(String kid) throws Exception {
        if (kid == null) throw new IllegalArgumentException("kid must not be null");

        if (keyCache.containsKey(kid) && (System.currentTimeMillis() - lastFetchTime) < CACHE_TTL) {
            return keyCache.get(kid);
        }

        refreshKeys();

        PublicKey pk = keyCache.get(kid);
        if (pk == null) {
            throw new IllegalStateException("Public key not found for kid: " + kid);
        }
        return pk;
    }

    public synchronized void refreshKeys() throws Exception{
        if (jwksUrl == null || jwksUrl.isEmpty()) {
            throw new IllegalStateException("clerk.jwks-url property is not configured");
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode jwks = mapper.readTree(new URL(jwksUrl));
        JsonNode keys = jwks.get("keys");
        if (keys == null || !keys.isArray()) {
            throw new IllegalStateException("Invalid JWKS data: missing 'keys' array");
        }

        for (JsonNode keyNode : keys) {
            String kid = safeGetText(keyNode, "kid");
            String kty = safeGetText(keyNode, "kty");
            String alg = safeGetText(keyNode, "alg");

            if (kid == null) {
                logger.warn("Skipping JWKS entry with missing kid");
                continue;
            }

            if ("RSA".equals(kty) && ("RS256".equals(alg) || alg == null)) {
                String n = safeGetText(keyNode, "n");
                String e = safeGetText(keyNode, "e");

                if (n == null || e == null) {
                    logger.warn("Skipping RSA key with missing modulus/exponent for kid={}", kid);
                    continue;
                }

                try {
                    PublicKey publicKey = createPublicKey(n, e);
                    keyCache.put(kid, publicKey);
                } catch (Exception ex) {
                    logger.warn("Failed to construct public key for kid {}: {}", kid, ex.getMessage());
                }
            } else {
                logger.debug("Skipping non-RSA or non-RS256 key kid={}, kty={}, alg={}", kid, kty, alg);
            }
        }

        lastFetchTime = System.currentTimeMillis();
    }

    private static String safeGetText(JsonNode node, String fieldName) {
        JsonNode f = node.get(fieldName);
        return (f == null || f.isNull()) ? null : f.asText();
    }

    private PublicKey createPublicKey(String modulus, String exponent) throws Exception {
        byte[] modulusBytes = Base64.getUrlDecoder().decode(modulus);
        byte[] exponentBytes = Base64.getUrlDecoder().decode(exponent);

        BigInteger modulusBigInt = new BigInteger(1, modulusBytes);
        BigInteger exponentBigInt = new BigInteger(1, exponentBytes);

        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulusBigInt, exponentBigInt);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        return factory.generatePublic(spec);
    }

    public SigningKeyResolver getSigningKeyResolver() {
        return new SigningKeyResolverAdapter() {
            @Override
            public java.security.Key resolveSigningKey(io.jsonwebtoken.JwsHeader header, io.jsonwebtoken.Claims claims) {
                try {
                    String kid = header.getKeyId();
                    if (kid == null) return null;
                    return getPublicKey(kid);
                } catch (Exception e) {
                    logger.warn("Unable to resolve signing key for kid: {}", header.getKeyId(), e);
                    return null;
                }
            }
        };
    }

}