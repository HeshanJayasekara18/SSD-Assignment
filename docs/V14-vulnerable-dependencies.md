# Vulnerable Third-Party Dependencies

## A. Technical Description & Literature Reference

### What this vulnerability is

Modern web applications are mostly other people's code. The CeylonGO backend
declares 17 direct dependencies in `package.json`, but installing them pulls in
several hundred more — each of those has its own dependencies, and so on down
the tree. When someone discovers a security flaw in any one of those packages,
every application that installed it inherits the flaw, even though nobody on the
project ever wrote a line of the vulnerable code.

This is what OWASP calls **A06:2021 – Vulnerable and Outdated Components**. It
sits in the OWASP Top 10 not because the individual bugs are unusual, but
because the problem is so easy to miss: the code works, the tests pass, nothing
looks wrong, and the flaw is buried three levels deep in a folder nobody opens.

The best-known example is **Log4Shell** (CVE-2021-44228, December 2021), a flaw
in the Java logging library Log4j that allowed remote code execution through a
crafted log message. Ordinary applications were compromised simply because they
logged a string an attacker controlled. Most affected teams did not know they
used Log4j — it arrived as a dependency of a dependency.

The defence is to scan the dependency tree against a public vulnerability
database and update what the scan flags. Common tools are **OWASP
Dependency-Check**, **Snyk**, **GitHub Dependabot**, and for Node.js projects the
`npm audit` command built into the package manager itself. All of them check
installed package versions against the same underlying advisory data — the
**National Vulnerability Database (NVD)** and the **GitHub Advisory Database**.

### What the scan found in this project

Running `npm audit` against both halves of the application:

| Project | Critical | High | Moderate | Low | Total |
| --- | --- | --- | --- | --- | --- |
| Backend (`/backend`) | 1 | 10 | 6 | 0 | **17** |
| Frontend (`/frontend`) | 1 | 14 | 5 | 9 | **29** |

The findings below are the ones that matter for this system. Each names the
installed version, the advisory, and why it is a risk here specifically.

---

#### 1. jsPDF 3.0.1 — CRITICAL

*Used for: generating booking report PDFs*

Eleven separate advisories affect this version. The most serious are:

- **Local File Inclusion / Path Traversal** (GHSA-f8cm-6447-x5h2) — a crafted
  input can make the library read files from the server's disk.
- **Arbitrary JavaScript execution via PDF injection** (GHSA-pqxr-3g65-p328) —
  unsanitised input reaches the PDF's embedded scripting layer.
- **Denial of service via malformed image dimensions** (GHSA-67pg-wm7f-q7fj,
  GHSA-95fx-jjr5-f39c) — a malicious GIF or BMP crashes the process.

This is the highest-priority finding. `BookingController.generateReport` calls
jsPDF with data that originates from user-submitted bookings, so the untrusted
path to the vulnerable code is short and real.

#### 2. jws 3.2.2 — HIGH

*Used for: JWT signature verification, via `jsonwebtoken`*

**Improper HMAC signature verification** (GHSA-869p-cjfg-cm3x). The library does
not correctly verify HMAC signatures, which undermines the integrity guarantee
that JWT authentication depends on. Since `middleware/auth.js` uses
`jwt.verify()` to decide who a request belongs to and what role they hold, a flaw
in signature checking affects every protected route in the application.

Note this is a *transitive* dependency — `package.json` never mentions `jws`. It
arrives underneath `jsonwebtoken`, which is exactly the case that makes this
vulnerability class hard to spot by reading the manifest.

#### 3. Mongoose 8.13.2 — HIGH

*Used for: all database access*

- **Improper sanitisation of `$nor` in `sanitizeFilter`** (GHSA-wpg9-53fq-2r8h)
  — may allow NoSQL injection to bypass the library's own filter sanitisation.
- **Prototype pollution in update casting** (GHSA-664h-wqgq-64gw) — a
  `__proto__`-prefixed dotted path in an update can pollute object prototypes.

Both are directly relevant to this codebase. The NoSQL injection advisory
compounds the separate NoSQL injection finding, and the prototype pollution
advisory compounds the mass-assignment problem addressed in V-13 — the whitelist
fix there limits *which* fields reach Mongoose, which reduces but does not
eliminate this exposure.

#### 4. Nodemailer 6.10.1 — HIGH

*Used for: booking confirmation and notification emails*

Twelve advisories, of which the most relevant are:

- **SMTP command injection via CRLF** (GHSA-vvjj-xcjg-gr5g, GHSA-c7w3-x93f-qmm8)
  — newline characters in a parameter let an attacker inject SMTP commands.
- **Email delivered to an unintended domain** (GHSA-mm7p-fcc7-pg87,
  GHSA-wmmp-3585-3rmp) — address-parsing conflicts can route mail to a domain
  the attacker controls.
- **Arbitrary file read and SSRF via the raw message option**
  (GHSA-p6gq-j5cr-w38f).

The application emails user-supplied addresses, so the parsing flaws are
reachable. Fixing these requires Nodemailer 10.x, which is a breaking change.

#### 5. Express 4.21.2 and its dependency chain — MODERATE to HIGH

*Used for: the entire HTTP layer*

Express itself is not directly flawed, but it depends on vulnerable versions of:

- **body-parser** — DoS when an invalid `limit` value silently disables size
  enforcement (GHSA-v422-hmwv-36x6).
- **path-to-regexp** — ReDoS via multiple route parameters (GHSA-37ch-88jc-xwx2).
- **qs** — four DoS advisories, including memory exhaustion through `arrayLimit`
  bypass (GHSA-6rw7-vpxm-498p).

These are all denial-of-service rather than data-disclosure issues, but they are
reachable by any unauthenticated request, because every request passes through
this layer.

#### 6. lodash 4.17.21 — HIGH

**Code injection via `_.template`** (GHSA-r5fr-rjxr-66jc) and **prototype
pollution in `_.unset` / `_.omit`** (GHSA-f23m-r3pf-42rh, GHSA-xxjr-mmjv-4gpg).

Worth noting: lodash arrives here underneath `express-validator`, the library
introduced to fix V-13. This is a useful illustration of the problem — adding a
package to *improve* security still expands the dependency tree and therefore
the attack surface. Security fixes are not exempt from dependency review.

#### 7. ReDoS cluster: brace-expansion, minimatch, picomatch — HIGH

Ten advisories across three glob-matching libraries, all Regular Expression
Denial of Service. These are build-time and file-matching tools rather than
request-handling code, so exposure is lower, but they are still counted in the
totals and still worth updating.

---

### How the findings were produced

```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit
```

`npm audit` compares every installed package version against the GitHub Advisory
Database and reports matches by severity. It is the same check OWASP
Dependency-Check and Snyk perform; the tools differ mainly in reporting format
and in whether they also cover non-JavaScript ecosystems.

For a formal OWASP Dependency-Check report:

```bash
dependency-check --project "CeylonGO" --scan ./backend --format HTML --out ./reports
```

---

### Why this is serious

A vulnerable dependency is harder to defend against than a bug in your own code,
for three reasons.

**It is invisible in code review.** Reading every controller in this project
would never reveal the jws signature flaw, because the flawed code is not in this
repository. It is in `node_modules`, which nobody reads and most teams do not
commit.

**It is publicly documented.** Every advisory listed above has a public page
describing the flaw and often a proof-of-concept exploit. An attacker does not
need to discover anything — they need only determine which library version the
application runs, which is frequently inferable from response headers, error
pages or timing behaviour.

**It arrives without being requested.** `jws`, `lodash`, `qs` and `path-to-regexp`
are not in `package.json`. Nobody chose them. They were pulled in by packages
that were chosen, which means the attack surface is considerably larger than the
dependency list suggests.

---

### Recommended remediation

**Step 1 — apply non-breaking updates.** Most findings, including the critical
jsPDF one, resolve without any API changes:

```bash
cd backend && npm audit fix
cd ../frontend && npm audit fix
```

**Step 2 — handle breaking changes deliberately.** Nodemailer requires a major
version upgrade (6.x → 10.x). Read the migration notes, update the calls in
`utils/Mailer.js`, and test that booking confirmation emails still send. Do not
use `npm audit fix --force` without reviewing what it changes — it can upgrade
across major versions and silently break working features.

**Step 3 — re-scan and record the result.** Run `npm audit` again and capture the
before/after totals as evidence.

**Step 4 — make it continuous.** A one-time scan is only accurate on the day it
runs; new advisories are published constantly. Enable GitHub Dependabot on the
repository, or add `npm audit --audit-level=high` to the CI pipeline so a build
fails when a serious advisory appears.

---

### References

- OWASP Top 10:2021 — A06 Vulnerable and Outdated Components.
  https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/
- OWASP Dependency-Check. https://owasp.org/www-project-dependency-check/
- GitHub Advisory Database. https://github.com/advisories
- National Vulnerability Database (NVD). https://nvd.nist.gov/
- CVE-2021-44228 (Log4Shell). https://nvd.nist.gov/vuln/detail/CVE-2021-44228
- npm audit documentation. https://docs.npmjs.com/cli/commands/npm-audit
