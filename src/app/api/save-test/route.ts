import { NextRequest, NextResponse } from 'next/server'
import { supabase, type Teste } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body: Teste = await request.json()

    // Validar dados obrigatórios
    if (!body.nome || !body.dataTeste || !body.chaveAcesso || !body.xml) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios: nome, dataTeste, chaveAcesso, xml' },
        { status: 400 }
      )
    }

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('testes')
      .insert([{
        nome: body.nome,
        data_teste: body.dataTeste,
        chave_acesso: body.chaveAcesso,
        xml: body.xml
      }])
      .select()

    if (error) {
      console.error('Erro no Supabase:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar teste no banco de dados' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Teste salvo com sucesso!', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro na API save-test:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}