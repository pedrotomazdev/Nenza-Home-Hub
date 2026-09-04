# 🏠 Nenza Home Hub

> Hub pessoal para gerenciamento de arquivos, dispositivos e recursos da sua casa — desenvolvido com React Native e Expo, com suporte para Android e Web.

O **Nenza Home Hub** é um aplicativo criado para centralizar ferramentas e serviços pessoais em um único lugar.

A ideia do projeto é transformar um dispositivo Android em um pequeno **hub doméstico**, permitindo acessar arquivos, navegar pelo armazenamento e futuramente centralizar outros serviços e automações.

---

## ✨ Funcionalidades

### 📁 Gerenciamento de arquivos

* Navegação pelo armazenamento do dispositivo
* Visualização de pastas e arquivos
* Breadcrumbs para navegação entre diretórios
* Abertura de arquivos compatíveis
* Interface inspirada em exploradores de arquivos desktop

### 🖥️ Servidor local

O projeto pode trabalhar em conjunto com um servidor local executado no próprio dispositivo Android, permitindo acessar os recursos do celular através da rede.

A arquitetura foi pensada para possibilitar o uso do celular como um pequeno servidor doméstico.

### 📊 Dashboard

Interface de dashboard para acompanhar informações do dispositivo e do servidor.

Inclui componentes visuais como:

* Métricas em tempo real
* Gráficos de desempenho
* Sparklines
* Indicadores neon/cyberpunk
* Informações do sistema

### 🎨 Interface

O Nenza Home Hub possui uma interface inspirada em dashboards modernos de tecnologia:

* Dark UI
* Visual cyberpunk
* Componentes reutilizáveis
* Design responsivo
* Suporte para Web e Android

---

## 🛠️ Tecnologias

* **React Native**
* **Expo**
* **TypeScript**
* **Expo Router**
* **NativeWind**
* **Tailwind CSS**
* **React Native SVG**
* **Lucide React Native**
* **Node.js** — utilizado no servidor complementar
* **Termux** — utilizado para executar o servidor diretamente no Android

---

## 📱 Plataformas

| Plataforma | Suporte |
| ---------- | ------- |
| Android    | ✅       |
| Web        | ✅       |
| iOS        | 🚧      |

---

## 🚀 Instalação

Clone o repositório:

```bash
git clone https://github.com/pedrotomazdev/NenzaHomeHub.git
cd NenzaHomeHub
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npx expo start
```

Para executar especificamente no Web:

```bash
npx expo start --web
```

---

## 🌐 Build Web

Para gerar a versão de produção:

```bash
npx expo export --platform web
```

Os arquivos serão gerados na pasta:

```text
dist/
```

A pasta `dist` pode então ser publicada em um servidor web.

---

## 📦 Build Android

O projeto pode ser compilado localmente utilizando o Gradle, sem depender do EAS Build.

Primeiro, gere os arquivos nativos caso necessário:

```bash
npx expo prebuild
```

Entre na pasta Android:

```bash
cd android
```

No Windows:

```bash
.\gradlew assembleRelease
```

O APK de release será gerado em:

```text
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🧩 Arquitetura

O projeto é dividido em componentes reutilizáveis e serviços responsáveis pela comunicação com recursos externos e pelo gerenciamento dos dados.

Uma estrutura simplificada:

```text
src/
├── components/
│   ├── ui/
│   └── ...
│
├── screens/
│   └── ...
│
├── services/
│   └── ...
│
├── theme/
│   └── colors.ts
│
└── ...
```

A aplicação também pode se comunicar com um servidor Node.js executado no próprio dispositivo.

```text
┌──────────────────────┐
│      Nenza Home      │
│   React Native / Web │
└──────────┬───────────┘
           │
           │ HTTP
           ▼
┌──────────────────────┐
│    Nenza Home Hub    │
│      Node.js API     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Android Storage    │
│       /storage       │
└──────────────────────┘
```

---

## 🏡 Objetivo do projeto

O Nenza Home Hub faz parte do ecossistema **Nenza**, com o objetivo de criar ferramentas pessoais integradas para gerenciamento de dispositivos, arquivos, serviços e recursos domésticos.

O projeto começou como uma experiência de desenvolvimento com React Native e foi evoluindo para uma arquitetura capaz de utilizar dispositivos Android como pequenos servidores pessoais.

---

## 🔐 Segurança

O projeto foi desenvolvido inicialmente para uso em ambientes controlados e redes locais.

Ao disponibilizar o servidor para acesso externo, recomenda-se implementar medidas adicionais de segurança, como:

* HTTPS
* Autenticação
* Controle de acesso
* Firewall
* Tokens de sessão
* Limitação de endpoints
* Validação de arquivos e caminhos

**Não exponha diretamente um servidor de arquivos para a internet sem implementar autenticação e controles de segurança adequados.**

---

## 📌 Status

🚧 **Em desenvolvimento**

O projeto ainda está em evolução e novas funcionalidades serão adicionadas conforme o ecossistema Nenza crescer.

---

## 👨‍💻 Autor

Desenvolvido por **Pedro Tomaz**.

---

## 📄 Licença

Este projeto está em desenvolvimento. Consulte o repositório para informações sobre a licença antes de utilizar ou redistribuir o código.
