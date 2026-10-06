-- Second Look schema. Applied in order by scripts/migrate.mjs.

create table if not exists orders (
  id            text primary key,
  supplier      text not null,
  title         text not null,
  claimed_grade text not null check (claimed_grade in ('A','B','C','AB')),
  value_gbp     numeric(10,2) not null,
  state         text not null default 'DELIVERED'
                check (state in ('DELIVERED','VERIFYING','DISPUTED','CLEAN','RESOLVED')),
  delivered_at  timestamptz not null default now()
);

create table if not exists items (
  id                 text primary key,
  order_id           text not null references orders(id) on delete cascade,
  position           int  not null,
  name               text not null,
  claimed_grade      text not null check (claimed_grade in ('A','B','C')),
  unit_price_gbp     numeric(10,2) not null,
  listing_photo_url  text not null,
  demo_arrival_url   text,                       -- sample arrival photo offered in the demo picker
  listing_defects    jsonb not null default '[]', -- defects the supplier disclosed in the listing
  fallback_result    jsonb,                       -- scripted verdict used when no AI credentials
  received_photo_url text,
  verdict            text check (verdict in ('MATCH','BELOW_GRADE','NEEDS_REVIEW')),
  true_grade         text check (true_grade in ('A','B','C')),
  confidence         numeric(3,2),
  agent_reason       text,
  defects            jsonb not null default '[]',
  refund_gbp         numeric(10,2),
  source             text check (source in ('ai','scripted')),
  verified_at        timestamptz
);
create index if not exists items_order_idx on items(order_id, position);

create table if not exists disputes (
  id               text primary key,
  order_id         text not null unique references orders(id) on delete cascade,
  message          text not null,
  items_flagged    int not null,
  total_refund_gbp numeric(10,2) not null,
  status           text not null default 'OPEN' check (status in ('OPEN','RESOLVED')),
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);
