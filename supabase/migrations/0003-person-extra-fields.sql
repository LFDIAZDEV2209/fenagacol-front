-- Migración 0003: campos de identificador gremial + otra asociación en people.
-- Ejecutada vía Management API (2026-09-29). Idempotente.
alter table public.people
  add column if not exists galleros_unidos boolean not null default false,
  add column if not exists other_assoc_name text,
  add column if not exists other_assoc_contact text;

comment on column public.people.galleros_unidos is 'Identificador "Galleros Unidos de Colombia" (casilla del paso 4).';
comment on column public.people.other_assoc_name is 'Nombre de asociación no listada (texto libre del formulario).';
comment on column public.people.other_assoc_contact is 'Contacto de la otra asociación (persona o teléfono).';
