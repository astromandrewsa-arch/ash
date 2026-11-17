#!/bin/bash
# slug url pairs, run up to 4 at a time
cd /home/user/ash/leadgen
run() { node tools/vf_pw.cjs "$1" "$2" 2>&1 | tail -1; }
export -f run
cat <<'L' | xargs -P 4 -L 1 bash -c 'run "$0" "$1"'
r_d_electric https://www.rdelectricinc.com/
fisec_technology_convergence_llc http://www.fisectech.com/
florida_safeguard_inc http://www.floridasafeguard.com/
cameras_solutions_ii_inc https://cs2security.com/
omega_security_inc https://www.omegasecurity.com/
udt https://udtonline.com/
zone_1_security https://www.zone1security.com/
flying_a_security_systems_inc https://www.flyinga.net/
es_lvs http://www.eslvs.com/
protective_security_solutions_inc http://protectivesecuritysolutions.com/
chactech https://www.chactech.com/
omni_data_llc_dba_paradyme_secure_llc https://paradyme360.com/
rrr_electrical_llc https://rrrelectrical.com/
L
