create policy "master docs read" on storage.objects for select to authenticated
  using (bucket_id = 'master-documents');
create policy "master docs upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'master-documents' and owner = auth.uid());
create policy "master docs update own" on storage.objects for update to authenticated
  using (bucket_id = 'master-documents' and owner = auth.uid())
  with check (bucket_id = 'master-documents' and owner = auth.uid());
create policy "master docs delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'master-documents' and (owner = auth.uid() or public.has_role(auth.uid(),'admin')));