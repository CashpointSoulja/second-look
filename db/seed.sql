-- Demo seed: 3 delivered orders, 9 pieces. Idempotent: wipes and re-inserts demo rows.
-- Photos in /public/demo are synthetic illustrations, not real supplier stock.
-- Suppliers are fictional. bbox = [x, y, width, height] as fractions of the photo.

begin;
delete from disputes;
delete from orders;

insert into orders (id, supplier, title, claimed_grade, value_gbp, state, delivered_at) values
  ('FLK-24817', 'Lahore Reclaim Co.', 'Lululemon activewear bundle', 'AB', 58.00, 'DELIVERED', now() - interval '1 day'),
  ('FLK-24903', 'Vintage Mile',       'Vintage graphic tees box',   'B',  28.00, 'DELIVERED', now() - interval '2 days'),
  ('FLK-25011', 'Atelier Seconde',    'Designer mix',               'AB', 105.00,'DELIVERED', now() - interval '3 days');

insert into items (id, order_id, position, name, claimed_grade, unit_price_gbp, listing_photo_url, demo_arrival_url, listing_defects, fallback_result) values
('lulu-align-black', 'FLK-24817', 1, 'Align high-rise legging, black', 'A', 18.00,
 '/demo/lulu-align-black-listing.jpg', '/demo/lulu-align-black-arrival.jpg', '[]',
 '{"verdict":"BELOW_GRADE","true_grade":"C","confidence":0.9,
   "reason":"The listing shows even black fabric consistent with grade A. The arrival photo shows a small, faint bleach-type patch on the upper left thigh that is not visible in the listing. A visible bleach mark stops this piece reselling as A or B, so it reads as grade C.",
   "defects":[{"type":"stain","severity":"major","status":"NEW","bbox":[0.25,0.37,0.065,0.09],"note":"Bleach-type discolouration on upper left thigh, not in listing"}]}'),

('lulu-define-navy', 'FLK-24817', 2, 'Define jacket, navy', 'B', 24.00,
 '/demo/lulu-define-navy-listing.jpg', '/demo/lulu-define-navy-arrival.jpg',
 '[{"type":"pilling","severity":"minor","note":"Light pilling on both cuffs (disclosed by supplier)"}]',
 '{"verdict":"MATCH","true_grade":"B","confidence":0.82,
   "reason":"Light pilling on both cuffs is visible on arrival, and the supplier disclosed it in the listing. No new damage is visible, so the piece is consistent with grade B.",
   "defects":[{"type":"pilling","severity":"minor","status":"DISCLOSED","bbox":[0.08,0.7,0.16,0.14],"note":"Cuff pilling, disclosed in listing"},{"type":"pilling","severity":"minor","status":"DISCLOSED","bbox":[0.76,0.7,0.16,0.14],"note":"Cuff pilling, disclosed in listing"}]}'),

('lulu-wunder-olive', 'FLK-24817', 3, 'Wunder Under legging, olive', 'A', 16.00,
 '/demo/lulu-wunder-olive-listing.jpg', '/demo/lulu-wunder-olive-arrival.jpg', '[]',
 '{"verdict":"BELOW_GRADE","true_grade":"C","confidence":0.84,
   "reason":"The listing shows like-new fabric with no visible faults. On arrival there is a hole at the right knee and a pulled seam on the left calf. A hole plus seam damage is repair-grade, so this reads as grade C.",
   "defects":[{"type":"hole","severity":"major","status":"NEW","bbox":[0.52,0.48,0.12,0.1],"note":"Ragged hole at right knee"},{"type":"seam","severity":"moderate","status":"NEW","bbox":[0.34,0.66,0.1,0.16],"note":"Pulled seam, left inner calf"}]}'),

('tee-harley-black', 'FLK-24903', 1, 'Harley-Davidson 90s tee, black', 'B', 9.00,
 '/demo/tee-harley-black-listing.jpg', '/demo/tee-harley-black-arrival.jpg',
 '[{"type":"fading","severity":"minor","note":"Overall fading and cracked print (disclosed)"},{"type":"mark","severity":"minor","note":"Small light mark near neckline (disclosed)"}]',
 '{"verdict":"MATCH","true_grade":"B","confidence":0.8,
   "reason":"The fading, cracked print and small neckline mark on arrival all appear in the listing. These are normal vintage wear for grade B, and there is no new damage.",
   "defects":[{"type":"fading","severity":"minor","status":"DISCLOSED","bbox":[0.3,0.3,0.4,0.32],"note":"Print cracking and fading, disclosed"},{"type":"mark","severity":"minor","status":"DISCLOSED","bbox":[0.44,0.1,0.12,0.08],"note":"Neckline mark, disclosed"}]}'),

('tee-band-white', 'FLK-24903', 2, 'Single-stitch band tee, white', 'B', 11.00,
 '/demo/tee-band-white-listing.jpg', '/demo/tee-band-white-arrival.jpg', '[]',
 '{"verdict":"BELOW_GRADE","true_grade":"C","confidence":0.88,
   "reason":"The listing shows a bright white body and a flat collar. On arrival there is yellow staining at both underarms and a visibly stretched collar. Heavy staining on a white tee takes it below B.",
   "defects":[{"type":"stain","severity":"major","status":"NEW","bbox":[0.14,0.26,0.14,0.14],"note":"Yellow underarm staining"},{"type":"stain","severity":"major","status":"NEW","bbox":[0.72,0.26,0.14,0.14],"note":"Yellow underarm staining"},{"type":"stretch","severity":"moderate","status":"NEW","bbox":[0.38,0.06,0.24,0.1],"note":"Stretched, wavy collar"}]}'),

('tee-nike-grey', 'FLK-24903', 3, 'Nike centre swoosh tee, grey', 'B', 8.00,
 '/demo/tee-nike-grey-listing.jpg', '/demo/tee-nike-grey-arrival.jpg', '[]',
 '{"verdict":"MATCH","true_grade":"A","confidence":0.9,
   "reason":"No visible defects in either photo. The piece arrived in the same clean condition as listed and meets or exceeds its claimed grade.",
   "defects":[]}'),

('designer-burberry-scarf', 'FLK-25011', 1, 'Burberry check cashmere scarf', 'A', 45.00,
 '/demo/designer-burberry-scarf-listing.jpg', '/demo/designer-burberry-scarf-arrival.jpg', '[]',
 '{"verdict":"MATCH","true_grade":"A","confidence":0.86,
   "reason":"The check pattern, fringe and surface look the same as the listing. There are no visible pulls, holes or marks, so this is consistent with grade A.",
   "defects":[]}'),

('designer-rl-cable', 'FLK-25011', 2, 'Ralph Lauren cable-knit jumper, cream', 'A', 32.00,
 '/demo/designer-rl-cable-listing.jpg', '/demo/designer-rl-cable-arrival.jpg', '[]',
 '{"verdict":"BELOW_GRADE","true_grade":"C","confidence":0.86,
   "reason":"The listing shows an intact cream knit at grade A. On arrival there is a cluster of three small holes on the front body, consistent with moth damage. Knit holes need repair before resale, so this reads as grade C.",
   "defects":[{"type":"hole","severity":"major","status":"NEW","bbox":[0.4,0.44,0.2,0.14],"note":"Cluster of moth holes, front body"}]}'),

('designer-tommy-harrington', 'FLK-25011', 3, 'Tommy Hilfiger harrington jacket', 'B', 28.00,
 '/demo/designer-tommy-harrington-listing.jpg', '/demo/designer-tommy-harrington-arrival.jpg',
 '[{"type":"scuff","severity":"minor","note":"Small light scuff on left cuff (disclosed)"}]',
 '{"verdict":"BELOW_GRADE","true_grade":"C","confidence":0.78,
   "reason":"The supplier disclosed a small cuff scuff, but on arrival it is much larger and frayed. The zip pull tab is also missing, which was not in the listing. A worsened defect plus a broken fastening takes this below B.",
   "defects":[{"type":"scuff","severity":"moderate","status":"WORSENED","bbox":[0.1,0.72,0.16,0.14],"note":"Cuff scuff larger and frayed vs listing"},{"type":"hardware","severity":"moderate","status":"NEW","bbox":[0.46,0.2,0.08,0.1],"note":"Zip pull tab missing"}]}');

commit;
