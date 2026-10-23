# Security policy

Security fixes target the latest published bootstrapcn release. Older versions may not receive backports. Bootstrap 6 is a prerelease dependency; check upstream advisories when choosing a version for production.

## Report a vulnerability privately

Use the repository's [private vulnerability reporting form](https://github.com/soumit101/bootstrapcn/security/advisories/new). Include the affected version, a minimal reproduction, impact and any proposed fix. Do not include real credentials or private user data.

Please avoid public disclosure until the maintainer has assessed the issue and coordinated a fix. If private reporting is unavailable, contact the owner through a private contact method listed on [their GitHub profile](https://github.com/soumit101), or ask for a private channel without disclosing exploit details publicly.

## Application responsibilities

bootstrapcn provides browser UI. Your PHP application remains responsible for authentication, authorization, output escaping, CSRF protection, file validation and database security. A styled or client-validated form does not provide those guarantees.
