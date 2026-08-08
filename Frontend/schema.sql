-- VaultMedics Supabase Schema
-- This file contains all the tables needed for the medical records application
-- Deploy this to your Supabase project using the SQL editor

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  record_type TEXT NOT NULL, -- e.g., 'lab_report', 'scan', 'prescription'
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  encryption_key TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create record_attachments table for multiple files per medical record
CREATE TABLE IF NOT EXISTS public.record_attachments (
  id BIGSERIAL PRIMARY KEY,
  record_id BIGINT NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  encryption_key TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.record_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own record attachments"
  ON public.record_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own record attachments"
  ON public.record_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own record attachments"
  ON public.record_attachments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own record attachments"
  ON public.record_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create record_summaries table
CREATE TABLE IF NOT EXISTS public.record_summaries (
  id BIGSERIAL PRIMARY KEY,
  record_id BIGINT NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_findings TEXT,
  recommendations TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create blockchain_records table
CREATE TABLE IF NOT EXISTS public.blockchain_records (
  id BIGSERIAL PRIMARY KEY,
  record_id BIGINT NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blockchain_hash TEXT NOT NULL,
  transaction_hash TEXT,
  verification_timestamp TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  chain_id INTEGER,
  contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create consent_logs table
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g., 'upload', 'view', 'share', 'delete'
  resource_type TEXT NOT NULL, -- e.g., 'medical_record'
  resource_id BIGINT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for medical_records
CREATE POLICY "Users can view their own medical records"
  ON public.medical_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical records"
  ON public.medical_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records"
  ON public.medical_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records"
  ON public.medical_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS Policies for record_summaries
CREATE POLICY "Users can view their own record summaries"
  ON public.record_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own record summaries"
  ON public.record_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own record summaries"
  ON public.record_summaries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for blockchain_records
CREATE POLICY "Users can view their own blockchain records"
  ON public.blockchain_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blockchain records"
  ON public.blockchain_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blockchain records"
  ON public.blockchain_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for consent_logs
CREATE POLICY "Users can view their own consent logs"
  ON public.consent_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent logs"
  ON public.consent_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON public.medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON public.medical_records(created_at);
CREATE INDEX IF NOT EXISTS idx_record_summaries_record_id ON public.record_summaries(record_id);
CREATE INDEX IF NOT EXISTS idx_record_summaries_user_id ON public.record_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_record_id ON public.blockchain_records(record_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_records_user_id ON public.blockchain_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON public.consent_logs(created_at);

-- Create health_profiles table for emergency health card
CREATE TABLE IF NOT EXISTS public.health_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  blood_type TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medications TEXT,
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health profile"
  ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health profile"
  ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
  ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON public.health_profiles(user_id);

CREATE TYPE public.permission_status AS ENUM ('pending', 'granted', 'revoked');

-- Create provider_permissions table for tracking provider access to patient records
CREATE TABLE IF NOT EXISTS public.provider_permissions (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_wallet_address TEXT NOT NULL,
  provider_wallet_address TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, provider_wallet_address)
);

ALTER TABLE public.provider_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own provider permissions"
  ON public.provider_permissions FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view permissions granted to them"
  ON public.provider_permissions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND LOWER(auth.users.raw_user_meta_data->>'wallet_address') = LOWER(provider_wallet_address)
    )
  );

CREATE POLICY "System can insert provider permissions"
  ON public.provider_permissions FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update provider permissions"
  ON public.provider_permissions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "System can delete provider permissions"
  ON public.provider_permissions FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_provider_permissions_patient_id ON public.provider_permissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_provider_permissions_provider_wallet ON public.provider_permissions(provider_wallet_address);
CREATE INDEX IF NOT EXISTS idx_provider_permissions_is_active ON public.provider_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_permissions_expires_at ON public.provider_permissions(expires_at);

-- Create provider_notes table for provider notes on patient records
CREATE TABLE IF NOT EXISTS public.provider_notes (
  id BIGSERIAL PRIMARY KEY,
  record_id BIGINT NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  provider_wallet_address TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.provider_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own notes"
  ON public.provider_notes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND LOWER(auth.users.raw_user_meta_data->>'wallet_address') = LOWER(provider_wallet_address)
    )
  );

CREATE POLICY "Providers can insert their own notes"
  ON public.provider_notes FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND LOWER(auth.users.raw_user_meta_data->>'wallet_address') = LOWER(provider_wallet_address)
    )
  );

CREATE POLICY "Providers can update their own notes"
  ON public.provider_notes FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND LOWER(auth.users.raw_user_meta_data->>'wallet_address') = LOWER(provider_wallet_address)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND LOWER(auth.users.raw_user_meta_data->>'wallet_address') = LOWER(provider_wallet_address)
    )
  );

CREATE POLICY "Patients can view notes on their records"
  ON public.provider_notes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.medical_records
      WHERE medical_records.id = provider_notes.record_id
      AND medical_records.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_provider_notes_record_id ON public.provider_notes(record_id);
CREATE INDEX IF NOT EXISTS idx_provider_notes_provider_wallet ON public.provider_notes(provider_wallet_address);
