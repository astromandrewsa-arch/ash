Read CLAUDE.md in full, then PROGRESS.md and DECISIONS.md. You are running unattended; never ask a question, decide and log. Run `git status` first: if uncommitted work from an earlier attempt of this pass exists, review it and continue from it rather than starting over. If an earlier pass in PROGRESS.md is unticked, do that pass instead and say so. Claim rule: before starting a pass, append "(in progress since <UTC date time>)" to its line in PROGRESS.md, commit and push; if that line already carries a stamp less than 3 hours old, another session is on it, so stop and reply "pass N is in progress elsewhere". When you tick the pass, remove the stamp.

# Pass 5 — fire drawer v2, More info, negotiation stepper

Goal: CLAUDE.md sections 10, 11 (display), 12 (stepper) and 8.

1. Drawer header in the format `Called 29 Sep · Burns 14–18 Oct · 92%` with severity pill and the lead-time line. Tabs: Forecast · Spread · Exposure · Plan · Negotiation.
2. Forecast tab: both fuel clocks laid out as two groups (slow: live FM with trend, curing; fast: 1-h, 10-h, 100-h, 1000-h, ERC vs 90th percentile, KBDI, days since rain), threshold dates, a recharts chart of live FM and 100-h dead FM over the last 30 days with the crossing marked, and the ensemble-narrowing strip.
3. Exposure tab: three band cards (homes, assets, exposed TIV, damage ratio, loss), lower/point/upper, ground-up/gross toggle, return period line, analogue, inclusions line, the scrollable in-path list.
4. Plan tab: verdict pill, action list with owner/payer/cost/dates, payer split bar, scope rule when it applies, warnings ledger, mitigation credit, cost vs loss avoided with the green net figure and pPrevent. The "Pass to your dedicated Pyrome agent" button.
5. Negotiation tab: stepper with the six stages plus Partial and State plan branch states, counterparty, decision-due date, payer split agreed so far, timeline with declined entries in red, ledger and documents. First click of the button animates Identified → Agent engaged over one second.
6. More info: full-height panel with Addresses (sortable table of every home and asset in the path), Plan, Negotiation, Export (a disabled button labelled "PDF export arrives in pass 11").
7. Check on PH-01, AU-02, RP-07 (state plan) and OK-09 (no action) that the drawer reads correctly for each verdict.

## How to finish this pass (same for every pass)
1. Run `npm run build`; fix every error and warning.
2. Run `node scripts/smoke.mjs --pass 5`; fix until it exits 0 with zero console errors.
3. Open the screenshots it wrote in `screenshots/` (use the Read tool on the PNGs) and judge them as a demanding designer would: alignment, contrast, empty states, anything that looks unfinished. Fix and rerun. Use a subagent for this review if the main context is getting long.
4. `git add -A && git commit -m "pass 5: <one-line summary>" && git push -u origin HEAD` (the push matters: this VM is temporary and the branch on GitHub is the only copy).
5. In PROGRESS.md change `- [ ] Pass 5:` to `- [x] Pass 5:` and add one line under it saying what was built and any deviation from CLAUDE.md. Add decisions to DECISIONS.md.
6. Your final message: three lines, what was built, what was deviated, what is left. Do not ask questions.

If you cannot finish, leave the pass unticked, write the blocker under "Blocked" in PROGRESS.md, commit what works, and stop.
