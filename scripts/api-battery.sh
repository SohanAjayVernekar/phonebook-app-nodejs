#!/bin/bash
# API compatibility battery: exercises every endpoint + error shape.
# BASE env var selects the backend under test. Exits non-zero on failure.
BASE="${BASE:-http://localhost:18080}"
PASS=0; FAIL=0
PEG="testuser@example.com"; PPW="Test@12345"

check() { # name expected actual
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); # echo "ok: $1"
  else FAIL=$((FAIL+1)); echo "FAIL: $1 -- expected [$2] got [$3]"; fi
}

TOKEN=$(curl -s -m 10 -H "Content-Type: application/json" -d "{\"email\":\"$PEG\",\"password\":\"$PPW\"}" "$BASE/api/auth/login" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
[ -z "$TOKEN" ] && { echo "FATAL: login failed"; exit 1; }
A="Authorization: Bearer $TOKEN"
echo "== auth =="
check "health" '{"api": "online", "database": "online"}' "$(curl -s -m 10 "$BASE/api/health" | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps(d,sort_keys=True))")"
check "login shape" 'access_token,bearer,user' "$(curl -s -m 10 -H 'Content-Type: application/json' -d "{\"email\":\"$PEG\",\"password\":\"$PPW\"}" "$BASE/api/auth/login" | python3 -c "import sys,json;d=json.load(sys.stdin);print('access_token' in d and d['token_type']== 'bearer' and 'user' in d and ('access_token,bearer,user'))")"
check "login bad pw 401" '401|Invalid email or password' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H 'Content-Type: application/json' -d '{"email":"nobody@example.com","password":"wrongpass1"}' "$BASE/api/auth/login"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "register dup 409" '409|Email is already registered' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"email\":\"$PEG\",\"password\":\"LongEnough1\",\"name\":\"X Y\"}" "$BASE/api/auth/register"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "register bad email 400" '400|must be a well-formed email address' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H 'Content-Type: application/json' -d '{"email":"nope","password":"LongEnough1","name":"X Y"}' "$BASE/api/auth/register"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "register short pw 400" '400|size must be between 8 and 128' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H 'Content-Type: application/json' -d '{"email":"n@n.co","password":"short","name":"X Y"}' "$BASE/api/auth/register"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "me 200" 'Test User' "$(curl -s -m 10 -H "$A" "$BASE/api/auth/me" | python3 -c "import sys,json;print(json.load(sys.stdin)['name'])")"
check "me no token 401" '401|Could not validate authentication credentials' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' "$BASE/api/auth/me"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "me garbage 401" '401|Could not validate authentication credentials' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H 'Authorization: Bearer garbage.token.here' "$BASE/api/auth/me"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "patch name" 'Renamed User' "$(curl -s -m 10 -X PATCH -H "$A" -H 'Content-Type: application/json' -d '{"name":"Renamed User"}' "$BASE/api/auth/me" | python3 -c "import sys,json;print(json.load(sys.stdin)['name'])")"
check "patch blank 400" '400|Name is required' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X PATCH -H "$A" -H 'Content-Type: application/json' -d '{"name":"  "}' "$BASE/api/auth/me"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
curl -s -m 10 -X PATCH -H "$A" -H 'Content-Type: application/json' -d '{"name":"Test User"}' "$BASE/api/auth/me" > /dev/null
check "pw wrong current 400" '400|Current password is incorrect' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X PATCH -H "$A" -H 'Content-Type: application/json' -d '{"current_password":"Nope12345","new_password":"NewPass123"}' "$BASE/api/auth/me/password"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "pw same 400" '400|New password must be different from the current one' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X PATCH -H "$A" -H 'Content-Type: application/json' -d "{\"current_password\":\"$PPW\",\"new_password\":\"$PPW\"}" "$BASE/api/auth/me/password"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "pw change 204" '204' "$(curl -s -m 10 -o /dev/null -w '%{http_code}' -X PATCH -H "$A" -H 'Content-Type: application/json' -d "{\"current_password\":\"$PPW\",\"new_password\":\"TempPass123\"}" "$BASE/api/auth/me/password")"
check "login new pw" '200' "$(curl -s -m 10 -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"email\":\"$PEG\",\"password\":\"TempPass123\"}" "$BASE/api/auth/login")"
check "pw restore 204" '204' "$(curl -s -m 10 -o /dev/null -w '%{http_code}' -X PATCH -H "$A" -H 'Content-Type: application/json' -d "{\"current_password\":\"TempPass123\",\"new_password\":\"$PPW\"}" "$BASE/api/auth/me/password")"

echo "== contacts list =="
J() { curl -s -m 15 -H "$A" "$BASE/api/contacts$1"; }
check "default shape" '1000|1|8|125|newest|null' "$(J '' | python3 -c "import sys,json;d=json.load(sys.stdin);print(str(d['total'])+'|'+str(d['page'])+'|'+str(d['page_size'])+'|'+str(d['total_pages'])+'|'+str(d['sort'])+'|'+json.dumps(d['category']))")"
check "page2 first id" '992' "$(J '?page=2' | python3 -c "import sys,json;print(json.load(sys.stdin)['items'][0]['id'])")"
check "page_size=100" '10' "$(J '?page_size=100' | python3 -c "import sys,json;print(json.load(sys.stdin)['total_pages'])")"
check "page_size=101 400" '400|Page size must be between 1 and 100' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?page_size=101"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "page=0 400" '400|Page number must be at least 1' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?page=0"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "oldest first id" '1' "$(J '?sort=oldest&page_size=1' | python3 -c "import sys,json;print(json.load(sys.stdin)['items'][0]['id'])")"
check "bad sort 400" '400|sort must be one of newest, oldest, name_asc, name_desc' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?sort=bogus"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "categories filter" 'True' "$(J '?categories=WORK,FRIEND' | python3 -c "import sys,json;d=json.load(sys.stdin);print(all(i['category'] in ('WORK','FRIEND') for i in d['items']))")"
check "category lowercase ok" 'True' "$(J '?category=work&page_size=1' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['items'][0]['category']=='WORK')")"
check "bad category 400" '400|Category must be WORK, FAMILY, or FRIEND' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?category=BAD"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "has_email=true" 'True' "$(J '?has_email=true&page_size=50' | python3 -c "import sys,json;d=json.load(sys.stdin);print(all(i['email'] for i in d['items']))")"
check "has_email=false" 'True' "$(J '?has_email=false&page_size=50' | python3 -c "import sys,json;d=json.load(sys.stdin);print(all(i['email'] is None for i in d['items']))")"
check "has_email bad 400" '400|has_email must be true or false' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?has_email=maybe"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "bad date 400" '400|Dates must use the format yyyy-MM-dd' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts?date_from=2024-13-99"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "search finds" 'True' "$(J '?search=liam' | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['total']>0 and all('liam' in (i['name']+i['phone_number']).lower() for i in d['items']))")"

echo "== contacts crud =="
NEWID=$(curl -s -m 10 -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"Probe Row","phone_number":"+15550001111","email":"probe.row@example.com","address":"1 Test St","category":"WORK"}' "$BASE/api/contacts" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['id'])")
check "create 201 + echo" "Probe Row|+15550001111|WORK" "$(curl -s -m 10 -H "$A" "$BASE/api/contacts/$NEWID" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['name']+'|'+d['phone_number']+'|'+d['category'])")"
check "create bad phone 400" '400|Phone number must contain 7-20 digits and may start with +' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"X Y","phone_number":"123-4567"}' "$BASE/api/contacts"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "create bad category 400" '400|Category must be WORK, FAMILY, or FRIEND' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"X Y","phone_number":"+15550002222","category":"ENEMY"}' "$BASE/api/contacts"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "create dup phone 409" '409|Phone number is already in use' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"X Y","phone_number":"+15550001111"}' "$BASE/api/contacts"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "get missing 404" '404|Contact not found' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -H "$A" "$BASE/api/contacts/999999"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "update" 'Probe Row 2|FAMILY' "$(curl -s -m 10 -X PUT -H "$A" -H 'Content-Type: application/json' -d '{"name":"Probe Row 2","phone_number":"+15550001111","category":"FAMILY"}' "$BASE/api/contacts/$NEWID" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['name']+'|'+d['category'])")"
check "delete" "Contact deleted successfully|$NEWID" "$(curl -s -m 10 -X DELETE -H "$A" "$BASE/api/contacts/$NEWID" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['message']+'|'+str(d['id']))")"
check "get after delete 404" '404' "$(curl -s -m 10 -o /dev/null -w '%{http_code}' -H "$A" "$BASE/api/contacts/$NEWID")"
ID2=$(curl -s -m 10 -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"Bulk A","phone_number":"+15550003333"}' "$BASE/api/contacts" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
ID3=$(curl -s -m 10 -X POST -H "$A" -H 'Content-Type: application/json' -d '{"name":"Bulk B","phone_number":"+15550004444"}' "$BASE/api/contacts" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
check "bulk empty 400" '400|Provide at least one contact id' "$(curl -s -m 10 -o /tmp/b -w '%{http_code}' -X POST -H "$A" -H 'Content-Type: application/json' -d '{"ids":[]}' "$BASE/api/contacts/bulk-delete"; echo -n '|'; python3 -c "import json;print(json.load(open('/tmp/b')).get('detail'))")"
check "bulk ok" '2' "$(curl -s -m 10 -X POST -H "$A" -H 'Content-Type: application/json' -d "{\"ids\":[$ID2,$ID3]}" "$BASE/api/contacts/bulk-delete" | python3 -c "import sys,json;print(json.load(sys.stdin)['deleted'])")"
check "no token 401" '401' "$(curl -s -m 10 -o /dev/null -w '%{http_code}' "$BASE/api/contacts")"

echo "== RESULT: $PASS passed, $FAIL failed =="
[ "$FAIL" = "0" ]
