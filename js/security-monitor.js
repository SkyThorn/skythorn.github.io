/**
 * Security Monitoring for SkyThorn AI Labs
 * Advanced security event tracking and reporting
 */

(function() {
    'use strict';

    // Security monitoring configuration
    const SECURITY_MONITOR = {
        enabled: true,
        logLevel: 'info', // debug, info, warn, error
        maxLogSize: 1000,
        reportThreshold: 10, // Report after this many events
        suspiciousPatterns: [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /document\.write/i,
            /innerHTML\s*=/i,
            /outerHTML\s*=/i
        ],
        blockedIPs: [], // Add IPs to block if needed
        rateLimits: {
            formSubmission: 5000,
            pageLoad: 1000,
            apiCall: 2000
        }
    };

    // Security event types
    const EVENT_TYPES = {
        PAGE_LOAD: 'page_load',
        FORM_SUBMISSION: 'form_submission',
        SUSPICIOUS_INPUT: 'suspicious_input',
        XSS_ATTEMPT: 'xss_attempt',
        RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
        EXTERNAL_LINK_CLICK: 'external_link_click',
        CONSOLE_ACCESS: 'console_access',
        DOM_MANIPULATION: 'dom_manipulation',
        FILE_ACCESS: 'file_access',
        NETWORK_REQUEST: 'network_request'
    };

    // Security event logger
    class SecurityLogger {
        constructor() {
            this.events = [];
            this.lastReport = Date.now();
            this.initializeStorage();
        }

        initializeStorage() {
            if (!localStorage.getItem('security_events')) {
                localStorage.setItem('security_events', JSON.stringify([]));
            }
        }

        log(eventType, data = {}, severity = 'info') {
            if (!SECURITY_MONITOR.enabled) return;

            const event = {
                id: this.generateEventId(),
                type: eventType,
                timestamp: new Date().toISOString(),
                severity: severity,
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer,
                ip: this.getClientIP(),
                data: data
            };

            // Add to memory
            this.events.push(event);

            // Add to localStorage
            const storedEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
            storedEvents.push(event);
            
            // Keep only recent events
            if (storedEvents.length > SECURITY_MONITOR.maxLogSize) {
                storedEvents.splice(0, storedEvents.length - SECURITY_MONITOR.maxLogSize);
            }
            
            localStorage.setItem('security_events', JSON.stringify(storedEvents));

            // Console logging for debugging
            if (SECURITY_MONITOR.logLevel === 'debug' || severity === 'error') {
                console.log(`[Security] ${eventType}:`, event);
            }

            // Check if we should report
            this.checkReportingThreshold();
        }

        generateEventId() {
            return 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        getClientIP() {
            // This would be set by server-side code
            return 'unknown';
        }

        checkReportingThreshold() {
            const recentEvents = this.events.filter(event => 
                Date.now() - new Date(event.timestamp).getTime() < 60000 // Last minute
            );

            if (recentEvents.length >= SECURITY_MONITOR.reportThreshold) {
                this.reportSecurityEvents(recentEvents);
            }
        }

        reportSecurityEvents(events) {
            // In production, send to security monitoring service
            console.warn('[Security Alert] Multiple security events detected:', events);
            
            // Example: Send to your security endpoint
            // fetch('/api/security/report', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ events })
            // });
        }

        getEvents() {
            return JSON.parse(localStorage.getItem('security_events') || '[]');
        }

        clearEvents() {
            localStorage.removeItem('security_events');
            this.events = [];
        }
    }

    // Input validation and sanitization
    class InputValidator {
        constructor(logger) {
            this.logger = logger;
        }

        validateInput(input, fieldName = 'unknown') {
            if (typeof input !== 'string') return { valid: true, sanitized: input };

            // Check for suspicious patterns
            for (let pattern of SECURITY_MONITOR.suspiciousPatterns) {
                if (pattern.test(input)) {
                    this.logger.log(EVENT_TYPES.XSS_ATTEMPT, {
                        field: fieldName,
                        pattern: pattern.toString(),
                        input: input.substring(0, 100) // Truncate for logging
                    }, 'error');
                    
                    return { valid: false, sanitized: null };
                }
            }

            // Sanitize input
            const sanitized = this.sanitizeInput(input);
            
            return { valid: true, sanitized };
        }

        sanitizeInput(input) {
            return input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
    }

    // Rate limiting
    class RateLimiter {
        constructor(logger) {
            this.logger = logger;
            this.attempts = new Map();
        }

        checkLimit(action, limit) {
            const now = Date.now();
            const key = `${action}_${this.getClientId()}`;
            
            if (!this.attempts.has(key)) {
                this.attempts.set(key, []);
            }

            const attempts = this.attempts.get(key);
            
            // Remove old attempts
            const recentAttempts = attempts.filter(time => now - time < limit);
            this.attempts.set(key, recentAttempts);

            if (recentAttempts.length >= 5) { // Max 5 attempts per limit period
                this.logger.log(EVENT_TYPES.RATE_LIMIT_EXCEEDED, {
                    action: action,
                    limit: limit,
                    attempts: recentAttempts.length
                }, 'warn');
                
                return false;
            }

            recentAttempts.push(now);
            return true;
        }

        getClientId() {
            // Simple client identification (in production, use more sophisticated methods)
            return navigator.userAgent + window.screen.width + window.screen.height;
        }
    }

    // Network security monitor
    class NetworkMonitor {
        constructor(logger) {
            this.logger = logger;
            this.initializeMonitoring();
        }

        initializeMonitoring() {
            // Monitor fetch requests
            const originalFetch = window.fetch;
            window.fetch = (...args) => {
                this.logger.log(EVENT_TYPES.NETWORK_REQUEST, {
                    url: args[0],
                    method: args[1]?.method || 'GET'
                });
                return originalFetch.apply(this, args);
            };

            // Monitor XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this.logger.log(EVENT_TYPES.NETWORK_REQUEST, {
                    url: url,
                    method: method
                });
                return originalXHROpen.apply(this, [method, url, ...args]);
            };
        }
    }

    // DOM security monitor
    class DOMSecurityMonitor {
        constructor(logger) {
            this.logger = logger;
            this.initializeMonitoring();
        }

        initializeMonitoring() {
            // Monitor DOM mutations
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.checkForSuspiciousContent(node);
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

        checkForSuspiciousContent(node) {
            // Check for script tags
            const scripts = node.querySelectorAll('script');
            if (scripts.length > 0) {
                this.logger.log(EVENT_TYPES.DOM_MANIPULATION, {
                    type: 'script_tag_added',
                    count: scripts.length
                }, 'warn');
            }

            // Check for suspicious attributes
            const suspiciousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover'];
            suspiciousAttrs.forEach(attr => {
                if (node.hasAttribute && node.hasAttribute(attr)) {
                    this.logger.log(EVENT_TYPES.DOM_MANIPULATION, {
                        type: 'suspicious_attribute',
                        attribute: attr,
                        value: node.getAttribute(attr)
                    }, 'error');
                }
            });
        }
    }

    // Initialize security monitoring
    function initializeSecurityMonitoring() {
        const logger = new SecurityLogger();
        const validator = new InputValidator(logger);
        const rateLimiter = new RateLimiter(logger);
        const networkMonitor = new NetworkMonitor(logger);
        const domMonitor = new DOMSecurityMonitor(logger);

        // Log page load
        logger.log(EVENT_TYPES.PAGE_LOAD, {
            title: document.title,
            url: window.location.href
        });

        // Monitor form submissions
        document.addEventListener('submit', (e) => {
            if (!rateLimiter.checkLimit('form_submission', SECURITY_MONITOR.rateLimits.formSubmission)) {
                e.preventDefault();
                alert('Too many form submissions. Please wait a moment.');
                return;
            }

            const formData = new FormData(e.target);
            let hasSuspiciousInput = false;

            for (let [key, value] of formData.entries()) {
                const validation = validator.validateInput(value, key);
                if (!validation.valid) {
                    hasSuspiciousInput = true;
                    break;
                }
            }

            if (hasSuspiciousInput) {
                e.preventDefault();
                alert('Suspicious input detected. Please check your input and try again.');
                return;
            }

            logger.log(EVENT_TYPES.FORM_SUBMISSION, {
                formId: e.target.id || 'unknown',
                formAction: e.target.action
            });
        });

        // Monitor external links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href) {
                const url = new URL(e.target.href);
                if (url.hostname !== window.location.hostname) {
                    logger.log(EVENT_TYPES.EXTERNAL_LINK_CLICK, {
                        url: e.target.href,
                        text: e.target.textContent
                    });
                }
            }
        });

        // Export for debugging
        window.securityMonitor = {
            logger: logger,
            validator: validator,
            rateLimiter: rateLimiter,
            getEvents: () => logger.getEvents(),
            clearEvents: () => logger.clearEvents(),
            config: SECURITY_MONITOR
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecurityMonitoring);
    } else {
        initializeSecurityMonitoring();
    }

})(); 