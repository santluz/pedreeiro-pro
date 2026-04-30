# 🏗️ PedreiroPro

Sistema web mobile-first para pedreiros autônomos.
**Stack:** Next.js 14 · Firebase (Auth + Firestore + Storage) · Tailwind CSS · TypeScript

---

## ✅ Funcionalidades

| Módulo | O que faz |
|---|---|
| Dashboard | Saldo do mês, entradas, despesas, últimos orçamentos |
| Serviços | Cadastro com tipo m², diária ou valor fixo |
| Orçamentos | Gerador com cálculo automático + PDF para impressão |
| Portfólio | Upload de fotos salvas no Firebase Storage |
| Financeiro | Registro de entradas/despesas + saldo mensal |

---

## 🚀 Como configurar — passo a passo

### 1️⃣ Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `pedreeiro-pro`) e clique em Continuar
4. Desative o Google Analytics (não precisamos) → **Criar projeto**

---

### 2️⃣ Ativar Autenticação Google

1. No menu lateral: **Authentication → Primeiros passos**
2. Clique em **Google** → Ativar
3. Informe um e-mail de suporte → **Salvar**

---

### 3️⃣ Criar o banco de dados (Firestore)

1. No menu: **Firestore Database → Criar banco de dados**
2. Escolha **"Iniciar no modo de produção"** → Avançar
3. Escolha a região **southamerica-east1 (São Paulo)** → Ativar
4. Vá em **Regras** e cole o conteúdo do arquivo `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Clique em **Publicar**

---

### 4️⃣ Ativar o Storage (para as fotos)

1. No menu: **Storage → Primeiros passos**
2. Clique em **"Iniciar no modo de produção"** → Avançar → Concluir
3. Vá em **Regras** e cole o conteúdo do arquivo `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/fotos/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Clique em **Publicar**

---

### 5️⃣ Pegar as credenciais do Firebase

1. No canto superior esquerdo, clique na **engrenagem ⚙️ → Configurações do projeto**
2. Role até **"Seus apps"** → clique no ícone `</>`  (Web)
3. Dê um apelido (ex: `pedreeiro-web`) → Registrar app
4. Copie o bloco `firebaseConfig` que aparecer — vai ter esses campos:

```js
apiKey: "...",
authDomain: "...",
projectId: "...",
storageBucket: "...",
messagingSenderId: "...",
appId: "..."
```

---

### 6️⃣ Configurar as variáveis de ambiente no projeto

1. Na pasta do projeto, copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```
2. Abra o `.env.local` e preencha com os valores do passo anterior:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pedreeiro-pro.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=pedreeiro-pro
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pedreeiro-pro.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

---

### 7️⃣ Rodar o projeto localmente

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Abra no navegador: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Como hospedar gratuitamente no Vercel

### 1. Subir o código no GitHub

```bash
git init
git add .
git commit -m "PedreiroPro v1"
# Crie um repositório no github.com e siga as instruções de push
git remote add origin https://github.com/seu-usuario/pedreeiro-pro.git
git push -u origin main
```

### 2. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) → Login com GitHub
2. Clique em **"Add New Project"**
3. Selecione seu repositório `pedreeiro-pro`
4. Em **"Environment Variables"**, adicione todas as variáveis do seu `.env.local`
5. Clique em **Deploy**

Pronto! Em 2 minutos você terá uma URL pública como:
`https://pedreeiro-pro.vercel.app`

---

### 3. Autorizar o domínio no Firebase

1. No Firebase Console: **Authentication → Settings → Domínios autorizados**
2. Clique em **Adicionar domínio**
3. Cole sua URL do Vercel (ex: `pedreeiro-pro.vercel.app`)
4. Salvar

---

## 📁 Estrutura do projeto

```
pedreeiro-pro/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Dashboard
│   │   ├── layout.tsx            ← Layout raiz (header + nav)
│   │   ├── globals.css
│   │   ├── servicos/page.tsx     ← Cadastro de serviços
│   │   ├── orcamentos/
│   │   │   ├── page.tsx          ← Lista de orçamentos
│   │   │   ├── novo/page.tsx     ← Formulário novo orçamento
│   │   │   └── [id]/page.tsx     ← Detalhes + PDF
│   │   ├── portfolio/page.tsx    ← Upload de fotos
│   │   └── financeiro/page.tsx  ← Entradas e despesas
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        ← Cabeçalho laranja
│   │   │   └── BottomNav.tsx     ← Nav inferior mobile
│   │   └── ui/
│   │       ├── index.tsx         ← Card, BtnPrimary, Input, etc.
│   │       └── LoginScreen.tsx   ← Tela de login Google
│   ├── hooks/
│   │   └── useAuth.tsx           ← Contexto de autenticação
│   └── lib/
│       ├── firebase.ts           ← Inicialização Firebase
│       ├── types.ts              ← Tipos TypeScript
│       └── utils.ts              ← Formatadores + gerador PDF
├── firestore.rules               ← Regras de segurança Firestore
├── storage.rules                 ← Regras de segurança Storage
├── .env.local.example            ← Modelo das variáveis de ambiente
└── README.md
```

---

## 💡 Próximos passos sugeridos

- [ ] Envio do orçamento por **WhatsApp** (link direto com texto pré-formatado)
- [ ] Marcar orçamento como **"aprovado" ou "pendente"**
- [ ] Notificação de **pagamentos em atraso**
- [ ] Transformar em **PWA** (instalável no celular como app nativo)
- [ ] Página pública de **portfólio** para compartilhar com clientes
