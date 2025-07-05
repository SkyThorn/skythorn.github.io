/**
 * Security Enhancements for SkyThorn AI Labs
 * Client-side security measures and monitoring
 */

(function() {
    'use strict';

    // Security configuration
    const SECURITY_CONFIG = {
        maxFormLength: 1000,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        rateLimit: {
            formSubmission: 5000, // 5 seconds between submissions
            lastSubmission: 0
        }
    };

    // XSS Protection - Sanitize user input
    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // Form validation and security
    function secureFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Rate limiting
                const now = Date.now();
                if (now - SECURITY_CONFIG.rateLimit.lastSubmission < SECURITY_CONFIG.rateLimit.formSubmission) {
                    alert('Please wait a moment before submitting again.');
                    return false;
                }
                
                // Validate form data
                const formData = new FormData(form);
                let isValid = true;
                let sanitizedData = {};
                
                for (let [key, value] of formData.entries()) {
                    // Length validation
                    if (value.length > SECURITY_CONFIG.maxFormLength) {
                        alert(`Field ${key} is too long. Maximum ${SECURITY_CONFIG.maxFormLength} characters allowed.`);
                        isValid = false;
                        break;
                    }
                    
                    // Sanitize input
                    sanitizedData[key] = sanitizeInput(value);
                    
                    // Email validation
                    if (key === 'email' && value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            alert('Please enter a valid email address.');
                            isValid = false;
                            break;
                        }
                    }
                }
                
                if (isValid) {
                    // Update rate limit
                    SECURITY_CONFIG.rateLimit.lastSubmission = now;
                    
                    // Log security event
                    logSecurityEvent('form_submission', {
                        form: form.id || 'contact_form',
                        timestamp: new Date().toISOString()
                    });
                    
                    // Submit form (you can replace this with your backend endpoint)
                    console.log('Form data sanitized and validated:', sanitizedData);
                    alert('Thank you for your message. We will get back to you soon!');
                    form.reset();
                }
            });
        });
    }

    // Security monitoring and logging
    function logSecurityEvent(eventType, data) {
        const securityLog = {
            event: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            data: data
        };
        
        // Log to console (in production, send to security monitoring service)
        console.log('Security Event:', securityLog);
        
        // Store in localStorage for debugging (remove in production)
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(securityLog);
        if (logs.length > 100) logs.shift(); // Keep only last 100 logs
        localStorage.setItem('security_logs', JSON.stringify(logs));
    }

    // Detect and prevent common attacks
    function detectSecurityThreats() {
        // Check for suspicious URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const suspiciousParams = ['script', 'javascript', 'onload', 'onerror'];
        
        suspiciousParams.forEach(param => {
            if (urlParams.has(param)) {
                logSecurityEvent('suspicious_url_param', { param, value: urlParams.get(param) });
                // Redirect to clean URL
                window.location.href = window.location.pathname;
            }
        });
        
        // Monitor for DOM manipulation attempts
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const scripts = node.querySelectorAll('script');
                            if (scripts.length > 0) {
                                logSecurityEvent('dynamic_script_detected', {
                                    scripts: scripts.length,
                                    source: 'mutation_observer'
                                });
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Prevent right-click context menu (optional)
    function preventContextMenu() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            logSecurityEvent('context_menu_prevented', {
                x: e.clientX,
                y: e.clientY
            });
        });
    }

    // Prevent text selection (optional)
    function preventTextSelection() {
        document.addEventListener('selectstart', function(e) {
            // Allow selection in form inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });
    }

    // Secure external links
    function secureExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        
        externalLinks.forEach(link => {
            if (link.hostname !== window.location.hostname) {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('target', '_blank');
                
                link.addEventListener('click', function(e) {
                    logSecurityEvent('external_link_clicked', {
                        url: link.href,
                        text: link.textContent
                    });
                });
            }
        });
    }

    // Initialize security measures
    function initSecurity() {
        // Log page load
        logSecurityEvent('page_load', {
            title: document.title,
            url: window.location.href
        });
        
        // Initialize security features
        secureFormValidation();
        detectSecurityThreats();
        secureExternalLinks();
        
        // Optional security features (uncomment if needed)
        // preventContextMenu();
        // preventTextSelection();
        
        // Monitor for console access attempts
        const originalConsole = window.console;
        window.console = {
            ...originalConsole,
            log: function(...args) {
                logSecurityEvent('console_access', { method: 'log', args: args.length });
                originalConsole.log.apply(originalConsole, args);
            }
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

    // Export for debugging (remove in production)
    window.securityDebug = {
        getLogs: () => JSON.parse(localStorage.getItem('security_logs') || '[]'),
        clearLogs: () => localStorage.removeItem('security_logs'),
        config: SECURITY_CONFIG
    };

})(); 