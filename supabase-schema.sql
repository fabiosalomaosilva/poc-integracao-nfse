-- Schema SQL para criar a tabela 'testes' no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

CREATE TABLE IF NOT EXISTS public.testes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_teste TIMESTAMP WITH TIME ZONE NOT NULL,
    chave_acesso VARCHAR(255) NOT NULL,
    xml TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar comentários às colunas
COMMENT ON TABLE public.testes IS 'Tabela para armazenar testes de XML NFSe';
COMMENT ON COLUMN public.testes.id IS 'ID único do teste';
COMMENT ON COLUMN public.testes.nome IS 'Nome descritivo do teste';
COMMENT ON COLUMN public.testes.data_teste IS 'Data e hora em que o teste foi realizado';
COMMENT ON COLUMN public.testes.chave_acesso IS 'Chave de acesso retornada pela API';
COMMENT ON COLUMN public.testes.xml IS 'Conteúdo XML do teste';
COMMENT ON COLUMN public.testes.created_at IS 'Data de criação do registro';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_testes_data_teste ON public.testes(data_teste);
CREATE INDEX IF NOT EXISTS idx_testes_chave_acesso ON public.testes(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_testes_created_at ON public.testes(created_at);