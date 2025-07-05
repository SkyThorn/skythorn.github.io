/**
 * Security Testing Script for SkyThorn AI Labs
 * Helps verify security measures are working correctly
 */

(function() {
    'use strict';

    // Security test results
    const testResults = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    };

    // Test configuration
    const SECURITY_TESTS = {
        headers: {
            csp: 'Content-Security-Policy',
            xFrameOptions: 'X-Frame-Options',
            xContentTypeOptions: 'X-Content-Type-Options',
            xXSSProtection: 'X-XSS-Protection',
            referrerPolicy: 'Referrer-Policy',
            permissionsPolicy: 'Permissions-Policy',
            hsts: 'Strict-Transport-Security'
        },
        features: {
            https: 'HTTPS Enforcement',
            sri: 'Subresource Integrity',
            formValidation: 'Form Validation',
            rateLimiting: 'Rate Limiting',
            xssProtection: 'XSS Protection'
        }
    };

    // Test runner
    class SecurityTester {
        constructor() {
            this.results = { ...testResults };
        }

        // Test security headers
        testSecurityHeaders() {
            console.log('🔒 Testing Security Headers...');
            
            // Note: Headers can only be checked server-side
            // This is a client-side simulation
            const expectedHeaders = SECURITY_TESTS.headers;
            
            Object.keys(expectedHeaders).forEach(header => {
                this.addTest(
                    `Security Header: ${expectedHeaders[header]}`,
                    'info',
                    'Headers can only be verified server-side. Use browser DevTools or security testing tools.',
                    'info'
                );
            });
        }

        // Test HTTPS enforcement
        testHTTPS() {
            console.log('🔐 Testing HTTPS Enforcement...');
            
            const isHTTPS = window.location.protocol === 'https:';
            const hasHSTS = document.querySelector('meta[http-equiv="Strict-Transport-Security"]');
            const hasUpgradeInsecure = document.querySelector('meta[http-equiv="upgrade-insecure-requests"]');
            
            this.addTest(
                'HTTPS Protocol',
                isHTTPS,
                `Current protocol: ${window.location.protocol}`,
                isHTTPS ? 'pass' : 'fail'
            );
            
            this.addTest(
                'HSTS Meta Tag',
                !!hasHSTS,
                hasHSTS ? 'HSTS meta tag found' : 'HSTS meta tag missing',
                hasHSTS ? 'pass' : 'fail'
            );
            
            this.addTest(
                'Upgrade Insecure Requests',
                !!hasUpgradeInsecure,
                hasUpgradeInsecure ? 'Upgrade insecure requests meta tag found' : 'Upgrade insecure requests meta tag missing',
                hasUpgradeInsecure ? 'pass' : 'fail'
            );
        }

        // Test Subresource Integrity
        testSRI() {
            console.log('🔍 Testing Subresource Integrity...');
            
            const scripts = document.querySelectorAll('script[src]');
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            
            let sriCount = 0;
            let totalExternal = 0;
            
            // Check scripts
            scripts.forEach(script => {
                if (script.src && !script.src.startsWith(window.location.origin)) {
                    totalExternal++;
                    if (script.integrity) {
                        sriCount++;
                    }
                }
            });
            
            // Check stylesheets
            stylesheets.forEach(link => {
                if (link.href && !link.href.startsWith(window.location.origin)) {
                    totalExternal++;
                    if (link.integrity) {
                        sriCount++;
                    }
                }
            });
            
            this.addTest(
                'Subresource Integrity Coverage',
                sriCount === totalExternal && totalExternal > 0,
                `${sriCount}/${totalExternal} external resources have SRI (${totalExternal} total external resources)`,
                sriCount === totalExternal ? 'pass' : 'warn'
            );
        }

        // Test form security
        testFormSecurity() {
            console.log('📝 Testing Form Security...');
            
            const forms = document.querySelectorAll('form');
            
            forms.forEach((form, index) => {
                const hasAction = form.action && form.action !== '';
                const hasMethod = form.method && form.method.toLowerCase() === 'post';
                const hasValidation = form.querySelector('[required]') !== null;
                
                this.addTest(
                    `Form ${index + 1} - Action`,
                    hasAction,
                    hasAction ? `Form action: ${form.action}` : 'Form has no action attribute',
                    hasAction ? 'pass' : 'warn'
                );
                
                this.addTest(
                    `Form ${index + 1} - Method`,
                    hasMethod,
                    hasMethod ? 'Form uses POST method' : `Form uses ${form.method || 'GET'} method`,
                    hasMethod ? 'pass' : 'warn'
                );
                
                this.addTest(
                    `Form ${index + 1} - Validation`,
                    hasValidation,
                    hasValidation ? 'Form has required field validation' : 'Form lacks required field validation',
                    hasValidation ? 'pass' : 'warn'
                );
            });
        }

        // Test XSS protection
        testXSSProtection() {
            console.log('🛡️ Testing XSS Protection...');
            
            // Test if security.js is loaded
            const securityScript = document.querySelector('script[src*="security.js"]');
            const monitorScript = document.querySelector('script[src*="security-monitor.js"]');
            
            this.addTest(
                'Security.js Loaded',
                !!securityScript,
                securityScript ? 'Security.js script found' : 'Security.js script not found',
                securityScript ? 'pass' : 'fail'
            );
            
            this.addTest(
                'Security Monitor Loaded',
                !!monitorScript,
                monitorScript ? 'Security monitor script found' : 'Security monitor script not found',
                monitorScript ? 'pass' : 'fail'
            );
            
            // Test CSP meta tag
            const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            this.addTest(
                'CSP Meta Tag',
                !!cspMeta,
                cspMeta ? 'Content Security Policy meta tag found' : 'Content Security Policy meta tag missing',
                cspMeta ? 'pass' : 'fail'
            );
        }

        // Test external links security
        testExternalLinks() {
            console.log('🔗 Testing External Links Security...');
            
            const externalLinks = document.querySelectorAll('a[href^="http"]');
            let secureLinks = 0;
            let totalExternal = 0;
            
            externalLinks.forEach(link => {
                if (link.hostname !== window.location.hostname) {
                    totalExternal++;
                    if (link.rel && link.rel.includes('noopener')) {
                        secureLinks++;
                    }
                }
            });
            
            this.addTest(
                'External Links Security',
                secureLinks === totalExternal && totalExternal > 0,
                `${secureLinks}/${totalExternal} external links have security attributes (${totalExternal} total external links)`,
                secureLinks === totalExternal ? 'pass' : 'warn'
            );
        }

        // Test privacy compliance
        testPrivacyCompliance() {
            console.log('🔒 Testing Privacy Compliance...');
            
            const privacyLink = document.querySelector('a[href*="privacy-policy"]');
            const hasPrivacyPage = !!privacyLink;
            
            this.addTest(
                'Privacy Policy Link',
                hasPrivacyPage,
                hasPrivacyPage ? 'Privacy policy link found in footer' : 'Privacy policy link not found',
                hasPrivacyPage ? 'pass' : 'warn'
            );
            
            // Test for tracking scripts (should be minimal)
            const trackingScripts = document.querySelectorAll('script[src*="google-analytics"], script[src*="facebook"], script[src*="twitter"]');
            this.addTest(
                'No Unnecessary Tracking',
                trackingScripts.length === 0,
                trackingScripts.length === 0 ? 'No unnecessary tracking scripts found' : `${trackingScripts.length} tracking scripts found`,
                trackingScripts.length === 0 ? 'pass' : 'warn'
            );
        }

        // Add test result
        addTest(name, condition, message, status) {
            const test = {
                name: name,
                status: status,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            this.results.tests.push(test);
            
            switch (status) {
                case 'pass':
                    this.results.passed++;
                    console.log(`✅ ${name}: ${message}`);
                    break;
                case 'fail':
                    this.results.failed++;
                    console.log(`❌ ${name}: ${message}`);
                    break;
                case 'warn':
                    this.results.warnings++;
                    console.log(`⚠️ ${name}: ${message}`);
                    break;
                case 'info':
                    console.log(`ℹ️ ${name}: ${message}`);
                    break;
            }
        }

        // Run all tests
        runAllTests() {
            console.log('🚀 Starting Security Tests...\n');
            
            this.testSecurityHeaders();
            this.testHTTPS();
            this.testSRI();
            this.testFormSecurity();
            this.testXSSProtection();
            this.testExternalLinks();
            this.testPrivacyCompliance();
            
            this.generateReport();
        }

        // Generate test report
        generateReport() {
            console.log('\n📊 Security Test Report');
            console.log('='.repeat(50));
            console.log(`✅ Passed: ${this.results.passed}`);
            console.log(`❌ Failed: ${this.results.failed}`);
            console.log(`⚠️ Warnings: ${this.results.warnings}`);
            console.log(`📋 Total Tests: ${this.results.tests.length}`);
            
            const score = this.results.passed / this.results.tests.length * 100;
            console.log(`📈 Security Score: ${score.toFixed(1)}%`);
            
            if (this.results.failed > 0) {
                console.log('\n🔴 Failed Tests:');
                this.results.tests.filter(t => t.status === 'fail').forEach(test => {
                    console.log(`  - ${test.name}: ${test.message}`);
                });
            }
            
            if (this.results.warnings > 0) {
                console.log('\n🟡 Warnings:');
                this.results.tests.filter(t => t.status === 'warn').forEach(test => {
                    console.log(`  - ${test.name}: ${test.message}`);
                });
            }
            
            console.log('\n💡 Recommendations:');
            if (this.results.failed > 0) {
                console.log('  - Address failed tests immediately');
            }
            if (this.results.warnings > 0) {
                console.log('  - Review and address warnings');
            }
            console.log('  - Run regular security audits');
            console.log('  - Keep dependencies updated');
            console.log('  - Monitor security logs');
            
            // Store results for external access
            window.securityTestResults = this.results;
        }
    }

    // Initialize security testing
    function initSecurityTesting() {
        // Only run tests in development or when explicitly requested
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.search.includes('security-test=true')) {
            
            const tester = new SecurityTester();
            tester.runAllTests();
            
            // Export for manual testing
            window.runSecurityTests = () => tester.runAllTests();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurityTesting);
    } else {
        initSecurityTesting();
    }

})(); 