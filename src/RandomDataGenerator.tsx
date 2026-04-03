import { useState, useCallback } from 'react'
import { Copy, Check, RefreshCw, Download, Sun, Moon, Languages, Database } from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'Random Data Generator',
    subtitle: 'Generate fake Brazilian data for testing and development. All data is randomly generated client-side.',
    configTitle: 'Data Types',
    configDesc: 'Choose what to generate',
    quantity: 'Quantity',
    rows: 'rows',
    fields: 'Fields',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone (BR)',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    address: 'Address',
    city: 'City (BR)',
    ip: 'IPv4',
    mac: 'MAC Address',
    date: 'Random Date',
    generate: 'Generate',
    regenerate: 'Regenerate',
    copyJson: 'Copy JSON',
    copyCsv: 'Copy CSV',
    downloadJson: 'Download JSON',
    downloadCsv: 'Download CSV',
    copied: 'Copied!',
    result: 'Generated Data',
    resultDesc: 'Preview and export',
    empty: 'Select fields and click "Generate"...',
    errorNoField: 'Select at least one field.',
    builtBy: 'Built by',
    notice: 'Generated CPFs and CNPJs pass check-digit validation but are entirely fictional.',
    rowCount: 'rows',
  },
  pt: {
    title: 'Gerador de Dados Aleatorios',
    subtitle: 'Gere dados brasileiros fictícios para testes e desenvolvimento. Todos os dados sao gerados no navegador.',
    configTitle: 'Tipos de Dados',
    configDesc: 'Escolha o que gerar',
    quantity: 'Quantidade',
    rows: 'linhas',
    fields: 'Campos',
    name: 'Nome Completo',
    email: 'Email',
    phone: 'Telefone (BR)',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    address: 'Endereco',
    city: 'Cidade (BR)',
    ip: 'IPv4',
    mac: 'Endereco MAC',
    date: 'Data Aleatoria',
    generate: 'Gerar',
    regenerate: 'Gerar novamente',
    copyJson: 'Copiar JSON',
    copyCsv: 'Copiar CSV',
    downloadJson: 'Baixar JSON',
    downloadCsv: 'Baixar CSV',
    copied: 'Copiado!',
    result: 'Dados Gerados',
    resultDesc: 'Visualize e exporte',
    empty: 'Selecione campos e clique em "Gerar"...',
    errorNoField: 'Selecione pelo menos um campo.',
    builtBy: 'Criado por',
    notice: 'CPFs e CNPJs gerados passam na validacao de digitos verificadores mas sao completamente fictícios.',
    rowCount: 'linhas',
  },
} as const
type Lang = keyof typeof translations

// ── Data generators ───────────────────────────────────────────────────────────
const FIRST_NAMES = ['Ana','Bruno','Carlos','Daniela','Eduardo','Fernanda','Gabriel','Helena','Igor','Julia','Lucas','Maria','Nicolas','Olivia','Pedro','Rafaela','Samuel','Tatiana','Victor','Wanda','Xavier','Yasmin','Zeca','Beatriz','Claudio','Diana','Emilio','Flavia','Gustavo','Heloisa','Ivan','Joana','Kaio','Larissa','Marcos','Nadia','Otavio','Patricia','Rafael','Silvia']
const LAST_NAMES = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Sousa','Fernandes','Vieira','Barbosa','Rocha','Dias','Nascimento','Andrade','Moreira','Nunes','Marques','Machado','Mendes','Freitas']
const DOMAINS = ['gmail.com','yahoo.com.br','outlook.com','hotmail.com','bol.com.br','uol.com.br','terra.com.br']
const STREETS = ['Rua das Flores','Av. Paulista','Rua do Comercio','Av. Brasil','Rua da Liberdade','Rua Sete de Setembro','Av. Atlantica','Rua Voluntarios da Patria','Av. Ipiranga','Rua Marechal Deodoro']
const CITIES = ['Sao Paulo','Rio de Janeiro','Belo Horizonte','Salvador','Fortaleza','Curitiba','Manaus','Recife','Porto Alegre','Belem','Goiania','Florianopolis','Maceio','Natal','Teresina','Campo Grande','Joao Pessoa','Aracaju','Macapa','Porto Velho']
const STATES = ['SP','RJ','MG','BA','CE','PR','AM','PE','RS','PA','GO','SC','AL','RN','PI','MS','PB','SE','AP','RO']

function rnd(max: number) { return Math.floor(Math.random() * max) }
function pick<T>(arr: T[]): T { return arr[rnd(arr.length)] }

function genName() { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` }
function genEmail(name?: string) {
  const base = name ? name.toLowerCase().replace(' ', '.').replace(/[^a-z.]/g, '') : pick(FIRST_NAMES).toLowerCase()
  return `${base}${rnd(999) > 100 ? rnd(99) : ''}@${pick(DOMAINS)}`
}
function genPhone() { return `(${10 + rnd(89)}) 9${String(rnd(9000) + 1000).padStart(4,'0')}-${String(rnd(9000) + 1000).padStart(4,'0')}` }

function calcCpfDigits(digits: number[]): [number, number] {
  let s1 = 0; for (let i = 0; i < 9; i++) s1 += digits[i] * (10 - i)
  const d1 = (s1 * 10) % 11; const r1 = d1 >= 10 ? 0 : d1
  let s2 = 0; for (let i = 0; i < 9; i++) s2 += digits[i] * (11 - i); s2 += r1 * 2
  const d2 = (s2 * 10) % 11; const r2 = d2 >= 10 ? 0 : d2
  return [r1, r2]
}
function genCpf() {
  const d = Array.from({ length: 9 }, () => rnd(9))
  const [d1, d2] = calcCpfDigits(d)
  return `${d.slice(0,3).join('')}.${d.slice(3,6).join('')}.${d.slice(6,9).join('')}-${d1}${d2}`
}

function calcCnpjDigits(digits: number[]): [number, number] {
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  let s1 = 0; for (let i = 0; i < 12; i++) s1 += digits[i] * w1[i]
  const r1 = s1 % 11; const d1 = r1 < 2 ? 0 : 11 - r1
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  let s2 = 0; for (let i = 0; i < 12; i++) s2 += digits[i] * w2[i]; s2 += d1 * 2
  const r2 = s2 % 11; const d2 = r2 < 2 ? 0 : 11 - r2
  return [d1, d2]
}
function genCnpj() {
  const d = Array.from({ length: 8 }, () => rnd(9)).concat([0,0,0,1])
  const [d1, d2] = calcCnpjDigits(d)
  return `${d.slice(0,2).join('')}.${d.slice(2,5).join('')}.${d.slice(5,8).join('')}/000${d[11]}-${String(d1).padStart(1,'0')}${d2}`
}

function genAddress() { return `${pick(STREETS)}, ${rnd(2000) + 1}` }
function genCity() { const i = rnd(CITIES.length); return `${CITIES[i]} - ${STATES[i]}` }
function genIp() { return `${rnd(223)+1}.${rnd(255)}.${rnd(255)}.${rnd(254)+1}` }
function genMac() { return Array.from({length:6},()=>rnd(256).toString(16).padStart(2,'0')).join(':').toUpperCase() }
function genDate() {
  const start = new Date(1970, 0, 1).getTime()
  const end = Date.now()
  return new Date(start + Math.random() * (end - start)).toLocaleDateString('pt-BR')
}

type FieldKey = 'name'|'email'|'phone'|'cpf'|'cnpj'|'address'|'city'|'ip'|'mac'|'date'

function generateRow(fields: FieldKey[]): Record<string, string> {
  const name = fields.includes('name') ? genName() : undefined
  const row: Record<string, string> = {}
  for (const f of fields) {
    if (f === 'name') row.name = name!
    else if (f === 'email') row.email = genEmail(name)
    else if (f === 'phone') row.phone = genPhone()
    else if (f === 'cpf') row.cpf = genCpf()
    else if (f === 'cnpj') row.cnpj = genCnpj()
    else if (f === 'address') row.address = genAddress()
    else if (f === 'city') row.city = genCity()
    else if (f === 'ip') row.ip = genIp()
    else if (f === 'mac') row.mac = genMac()
    else if (f === 'date') row.date = genDate()
  }
  return row
}

function toCSV(data: Record<string, string>[]): string {
  if (!data.length) return ''
  const keys = Object.keys(data[0])
  const header = keys.join(',')
  const rows = data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))
  return [header, ...rows].join('\n')
}

function download(content: string, filename: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = filename
  a.click()
}

// ── Component ─────────────────────────────────────────────────────────────────
const ALL_FIELDS: FieldKey[] = ['name','email','phone','cpf','cnpj','address','city','ip','mac','date']

export default function RandomDataGenerator() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => {
    const d = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', d)
    return d
  })
  const [quantity, setQuantity] = useState(5)
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(new Set(['name','email','cpf','phone']))
  const [data, setData] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'json'|'csv'|null>(null)

  const t = translations[lang]

  const toggleDark = () => { const n=!dark; setDark(n); document.documentElement.classList.toggle('dark',n) }
  const toggleField = (f: FieldKey) => {
    setSelectedFields(prev => { const n = new Set(prev); if (n.has(f)) n.delete(f); else n.add(f); return n })
  }

  const generate = useCallback(() => {
    if (selectedFields.size === 0) { setError(t.errorNoField); return }
    setError('')
    const fields = ALL_FIELDS.filter(f => selectedFields.has(f))
    setData(Array.from({ length: quantity }, () => generateRow(fields)))
  }, [quantity, selectedFields, t])

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied('json'); setTimeout(() => setCopied(null), 2000)
    })
  }
  const copyCsv = () => {
    navigator.clipboard.writeText(toCSV(data)).then(() => {
      setCopied('csv'); setTimeout(() => setCopied(null), 2000)
    })
  }
  const dlJson = () => download(JSON.stringify(data, null, 2), 'data.json', 'application/json')
  const dlCsv = () => download(toCSV(data), 'data.csv', 'text/csv')

  const columns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <span className="font-semibold">Random Data Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/random-data-generator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Config row */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-6">
              {/* Quantity */}
              <div className="flex items-center gap-3 min-w-[260px]">
                <span className="text-sm font-medium whitespace-nowrap">{t.quantity}</span>
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">-</button>
                <input type="range" min={1} max={50} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="h-1.5 w-32 cursor-pointer accent-pink-500" />
                <button onClick={() => setQuantity(q => Math.min(50, q+1))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+</button>
                <span className="text-sm font-bold text-pink-500 tabular-nums whitespace-nowrap">{quantity} {t.rows}</span>
              </div>
            </div>

            {/* Fields */}
            <div>
              <p className="text-sm font-medium mb-3">{t.fields}</p>
              <div className="flex flex-wrap gap-2">
                {ALL_FIELDS.map(f => (
                  <button key={f} onClick={() => toggleField(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedFields.has(f) ? 'bg-pink-500 border-pink-500 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    {t[f]}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button onClick={generate} className="flex items-center gap-2 rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition-colors">
              <RefreshCw size={15} />
              {data.length ? t.regenerate : t.generate}
            </button>
          </div>

          {/* Results */}
          {data.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold">{t.result}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{data.length} {t.rowCount} &middot; {columns.length} {t.fields.toLowerCase()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyJson} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    {copied==='json' ? <Check size={12} className="text-pink-500" /> : <Copy size={12} />}
                    {copied==='json' ? t.copied : t.copyJson}
                  </button>
                  <button onClick={copyCsv} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    {copied==='csv' ? <Check size={12} className="text-pink-500" /> : <Copy size={12} />}
                    {copied==='csv' ? t.copied : t.copyCsv}
                  </button>
                  <button onClick={dlJson} className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 transition-colors">
                    <Download size={12} />JSON
                  </button>
                  <button onClick={dlCsv} className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600 transition-colors">
                    <Download size={12} />CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-zinc-400 font-semibold w-8">#</th>
                      {columns.map(c => (
                        <th key={c} className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-zinc-400 font-semibold whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3 py-2 text-zinc-400 tabular-nums">{i+1}</td>
                        {columns.map(c => (
                          <td key={c} className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{row[c]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-zinc-400">{t.notice}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-pink-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
