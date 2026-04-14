package com.ecommpadel.club.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    public static final String ATTR_ERROR = "REQUEST_ERROR";

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        long start = System.currentTimeMillis();
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        try {
            chain.doFilter(request, wrappedResponse);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            int status = wrappedResponse.getStatus();
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String query = request.getQueryString();
            String fullUri = query != null ? uri + "?" + query : uri;

            if (status >= 200 && status < 300) {
                log.info("[{} {}] -> {} ({}ms)", method, fullUri, status, elapsed);
            } else {
                Throwable error = (Throwable) request.getAttribute(ATTR_ERROR);
                String errorMessage = (String) request.getAttribute(ATTR_ERROR + "_MSG");

                if (error != null) {
                    log.error("[{} {}] -> {} ({}ms) | {}", method, fullUri, status, elapsed, errorMessage, error);
                } else if (errorMessage != null) {
                    log.warn("[{} {}] -> {} ({}ms) | {}", method, fullUri, status, elapsed, errorMessage);
                } else {
                    log.warn("[{} {}] -> {} ({}ms)", method, fullUri, status, elapsed);
                }
            }

            wrappedResponse.copyBodyToResponse();
        }
    }
}
