# domain-check

Checks whether domain names are registered, asking each ending's registry directly over RDAP and
cross-checking with DNS. Give it bare names and a set of endings and it checks every combination.

Live: https://bencoman.github.io/toolshed/domain-check/

## Call

```
https://bencoman.github.io/toolshed/domain-check/?q=mathforge,numberly&tld=com,com.au,au
```

| Param | Required | Meaning | Default |
|---|---|---|---|
| `q` | yes | Names, comma separated. A bare word gets every ending in `tld`; anything containing a dot is checked as typed (`example.com.au`). Leading `http://`, `https://`, `www.` and trailing slashes are stripped. | none |
| `tld` | no | Endings, comma separated; a leading dot is optional. `tlds` also works. | `com,com.au,au` |

## Statuses

| Status | Meaning |
|---|---|
| `AVAILABLE` | The registry's RDAP server answered 404 for the name, and DNS shows no delegation for it. The strongest "free" signal a public lookup gives. |
| `TAKEN` | The registry's RDAP server returned a record. Detail gives registrar, registration and expiry dates where the record has them, and flags pending delete, redemption or inactive. |
| `LIKELY-FREE` | No usable RDAP answer for this ending, and DNS says NXDOMAIN. |
| `TAKEN-DNS` | No usable RDAP answer for this ending, and the name is delegated in DNS. |
| `CHECK` | RDAP says not found but DNS shows a delegation. Look it up at a registrar. |
| `UNKNOWN` | Neither lookup gave an answer, usually because of a rate limit. Re-run later. |
| `INVALID` | Not a valid hostname, so not looked up. |
| `CANCELLED` | The run was cancelled by hand before this name was checked. |

Summary line: `available N · taken N · needs a look N · unknown N`, where taken counts `TAKEN` and
`TAKEN-DNS`, needs a look counts `LIKELY-FREE` and `CHECK`, and unknown counts `UNKNOWN`, `INVALID`
and `CANCELLED`. A truncated run appends `· truncated to first 60 of N`.

## Result fields

Each `window.toolshed.results[]` entry has the standard `key` (the domain), `status` and `detail`,
plus:

| Field | Holds |
|---|---|
| `dns` | Up to two name servers and a `+N` count, or `NXDOMAIN`, `no NS`, or `—` when DNS gave no answer. |
| `rdapServer` | Host that answered the RDAP query, or `rdap.org` when the ending has no listed server. |

## Example

From `?q=google,zq9x7v3m-toolshed-test&tld=io,ai,co,dev,net.au`, run 2026-10-17:

```
DOMAIN-CHECK  DONE  10/10  2026-10-16 22:22 UTC
available 3 · taken 5 · needs a look 2 · unknown 0

google.net.au                  TAKEN         registrar MarkMonitor Corporate Services Inc
google.io                      TAKEN-DNS     No RDAP server known for this ending · DNS delegated (4 NS)
google.co                      TAKEN-DNS     No RDAP server known for this ending · DNS delegated (4 NS)
google.dev                     TAKEN         registrar MarkMonitor Inc. · since 2018-06-13 · expires 2027-06-13
google.ai                      TAKEN         registrar MarkMonitor Inc. · since 2017-12-16 · expires 2027-09-25
zq9x7v3m-toolshed-test.net.au  AVAILABLE     Not in registry (RDAP 404) · DNS NXDOMAIN
zq9x7v3m-toolshed-test.io      LIKELY-FREE   No RDAP server known for this ending · DNS NXDOMAIN
zq9x7v3m-toolshed-test.co      LIKELY-FREE   No RDAP server known for this ending · DNS NXDOMAIN
zq9x7v3m-toolshed-test.dev     AVAILABLE     Not in registry (RDAP 404) · DNS NXDOMAIN
zq9x7v3m-toolshed-test.ai      AVAILABLE     Not in registry (RDAP 404) · DNS NXDOMAIN
```

## Sources and limits

**Sources**

- **RDAP server per ending:** the IANA bootstrap file, `https://data.iana.org/rdap/dns.json`, cached
  in the browser for 24 hours.
- **`.au` and its second levels** (`com.au`, `net.au`, `org.au`, …): auDA's server at
  `rdap.cctld.au`. It is also hard-coded as a fallback in case the bootstrap file can't be fetched.
- **Endings with no listed server:** these go to `rdap.org`, which answers 404. The verdict then rests
  on DNS alone (`LIKELY-FREE` / `TAKEN-DNS`). As of 2026-10-17 this includes `.io` and `.co`.
- **DNS:** NS lookup over HTTPS from Google Public DNS (`dns.google`), with Cloudflare
  (`cloudflare-dns.com`) as the fallback.

**Limits**

- 60 domains per run (names × endings). Any beyond that are dropped, and the summary line says so.
- Four lookups run at a time, with a 250 ms gap per RDAP host. `rdap.org` gets at most one request
  per 1.2 s, under its limit of 10 per 10 s. On HTTP 429 it retries once after 3 s.
- Rows come out grouped by name, with endings in the page's preset order rather than the order given
  in `tld`.
- "Available" means "not in the registry", not "buyable at the standard price". Registries hold back
  reserved and premium names, and `.au` names have eligibility rules: an Australian presence, and
  for `com.au` an ABN or ACN plus a close connection to the name.
