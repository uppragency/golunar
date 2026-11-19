-- Prețuri noi: Esențial 269 lei / 53 €, Creștere 790 lei / 155 €, Partener 1379 lei / 271 €, Vizibilitate Google 99 lei / 19 €.
-- GOLUNAR: prima lună pe Esențial 4,99 lei sau 1 € (reducere fixă = plan minus prețul de lansare).
update public.app_settings set value = '{
  "essential":{"name":"Esențial","eur":53,"ron":269,"improvements":1},
  "growth":{"name":"Creștere","eur":155,"ron":790,"improvements":2},
  "partner":{"name":"Partener","eur":271,"ron":1379,"improvements":4}}'::jsonb, updated_at = now()
where key = 'plans';
update public.app_settings set value = jsonb_set(value, '{local}', '{"name":"Vizibilitate locală Google","eur":19,"ron":99}'::jsonb), updated_at = now()
where key = 'addons';
update public.discount_codes set amount_ron = 264.01, amount_eur = 52 where code = 'GOLUNAR';
