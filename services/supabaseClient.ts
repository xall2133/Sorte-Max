
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais do projeto
// Substitua estas chaves se gerar novas no painel do Supabase
const SUPABASE_URL = 'https://phzrnhtxzbwqoylblfev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenJuaHR4emJ3cW95bGJsZmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDQ2MDksImV4cCI6MjA4MDI4MDYwOX0.yflKBKBwGSwnAddAR71LzTZayEGZo0oAukf8iL_X7Ro';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
