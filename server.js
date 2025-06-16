require('dotenv').config();
const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORTA = process.env.PORTA || 3000;
const ARQUIVO_CHAVES = path.join(__dirname, 'settings/keys.json');
const SENHA_DONO = process.env.SENHA_DONO;

fs.ensureDir(path.dirname(ARQUIVO_CHAVES))
  .then(() => {
    return fs.pathExists(ARQUIVO_CHAVES)
      .then(exists => {
        if (!exists) {
          return fs.writeJson(ARQUIVO_CHAVES, { chaves: [] });
        }
      });
  })
  .catch(err => {
    console.error('Erro ao inicializar arquivo de chaves:', err);
    process.exit(1);
  });

app.use(express.json());

//Configurações de dono
function checaDono(req, res, next) {
  const senha = req.body.senha || req.query.senha;
  if (!senha) {
    return res.status(400).json({ erro: 'Cadê a senha, meu?' });
  }
  if (senha !== SENHA_DONO) {
    return res.status(403).json({ erro: 'Tá tentando o quê? Senha errada!' });
  }
  next();
}

// HTML da página home
const htmlHome = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yanni-APIs</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.1/iconfont/material-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-bg: #0a0a0a;
            --secondary-bg: #151515;
            --accent-color: #d92626;
            --accent-hover: #ff3333;
            --text-primary: #e0e0e0;
            --text-secondary: #a0a0a0;
            --card-bg: #1a1a1a;
            --border-color: #333;
            --highlight: #2a2a2a;
            --transition: all 0.25s ease;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: var(--primary-bg);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
        }
        .navbar {
            background-color: var(--secondary-bg);
            border-bottom: 1px solid var(--border-color);
            padding: 0 20px;
            position: relative;
        }
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            height: 70px;
            padding: 0 30px;
        }
        .logo {
            font-family: 'Comic Neue', sans-serif;
            font-size: 28px;
            font-weight: 600;
            color: var(--accent-color);
            letter-spacing: 1px;
        }
        .menu-toggle {
            display: none;
            cursor: pointer;
        }
        .menu-toggle i {
            font-size: 24px;
            color: var(--text-primary);
        }
        .nav-menu {
            display: flex;
            list-style: none;
        }
        .nav-item {
            position: relative;
            padding: 0 15px;
        }
        .nav-link, .dropdown-btn {
            color: var(--text-primary);
            text-decoration: none;
            display: flex;
            align-items: center;
            height: 60px;
            transition: var(--transition);
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        .nav-link i, .dropdown-btn i {
            margin-right: 8px;
            font-size: 18px;
        }
        .nav-link:hover, .dropdown-btn:hover {
            color: var(--accent-color);
        }
        .dropdown-menu {
            position: absolute;
            top: 60px;
            left: 0;
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 0 0 4px 4px;
            width: 220px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: var(--transition);
            z-index: 100;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .dropdown-menu::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 20px;
            width: 10px;
            height: 10px;
            background-color: var(--card-bg);
            transform: rotate(45deg);
            border-top: 1px solid var(--border-color);
            border-left: 1px solid var(--border-color);
        }
        .dropdown-item {
            padding: 12px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        .dropdown-item:last-child {
            border-bottom: none;
        }
        .dropdown-link {
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            transition: var(--transition);
            font-size: 13px;
        }
        .dropdown-link i {
            margin-right: 10px;
            font-size: 16px;
            color: var(--accent-color);
        }
        .dropdown-link:hover {
            color: var(--accent-color);
            padding-left: 5px;
        }
        .dropdown-link::before {
            content: '•';
            margin-right: 10px;
            color: var(--accent-color);
        }
        .nav-item:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            font-family: 'Comic Neue', cursive;
            font-size: 18px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .title {
            font-family: 'Comic Neue', cursive;
            font-size: 42px;
            color: var(--accent-color);
            letter-spacing: 2px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .subtitle {
            color: var(--text-secondary);
            font-size: 18px;
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            font-family: 'Comic Neue', cursive;
        }
        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 25px;
            transition: var(--transition);
        }
        .card:hover {
            border-color: var(--accent-color);
            transform: translateY(-3px);
        }
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .card-header i {
            font-size: 24px;
            color: var(--accent-color);
            margin-right: 10px;
        }
        .card-title {
            font-size: 20px;
            font-weight: 500;
        }
        .card-body p {
            margin-bottom: 10px;
            font-size: 16px;
        }
        .card-value {
            font-size: 24px;
            font-weight: 500;
            color: var(--accent-color);
            margin-top: 10px;
            font-family: 'Roboto Mono', monospace;
        }
        .input-group {
            margin-top: 20px;
        }
        .form-input {
            width: 100%;
            padding: 12px 15px;
            background-color: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            color: var(--text-primary);
            font-family: 'Roboto Mono', monospace;
            margin-bottom: 15px;
            transition: var(--transition);
        }
        .form-input:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(217, 38, 38, 0.2);
        }
        .btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
            width: 100%;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn i {
            margin-left: 8px;
        }
        .btn:hover {
            background-color: var(--accent-hover);
        }
        .status {
            margin-top: 15px;
            font-size: 16px;
            min-height: 20px;
            text-align: center;
        }
        @media (max-width: 992px) {
            .menu-toggle {
                display: block;
            }
            .nav-menu {
                position: fixed;
                top: 60px;
                left: -100%;
                background-color: var(--secondary-bg);
                width: 280px;
                height: calc(100vh - 60px);
                flex-direction: column;
                align-items: flex-start;
                padding: 20px 0;
                transition: var(--transition);
                border-right: 1px solid var(--border-color);
                overflow-y: auto;
            }
            .nav-menu.active {
                left: 0;
            }
            .nav-item {
                width: 100%;
                padding: 0;
            }
            .nav-link, .dropdown-btn {
                height: auto;
                padding: 15px 25px;
                width: 100%;
            }
            .dropdown-menu {
                position: static;
                opacity: 1;
                visibility: visible;
                transform: none;
                width: 100%;
                border: none;
                border-radius: 0;
                box-shadow: none;
                display: none;
                background-color: var(--highlight);
            }
            .dropdown-menu::before {
                display: none;
            }
            .dropdown-item {
                padding: 10px 25px 10px 45px;
            }
            .nav-item:hover .dropdown-menu {
                transform: none;
            }
            .dropdown.active .dropdown-menu {
                display: block;
            }
        }
    </style>
</head>
<body>
<nav class="navbar">
    <div class="nav-container">
        <div class="logo">YANNI - API</div>
        <div class="menu-toggle" id="mobile-menu">
            <i class="material-icons">menu</i>
        </div>
        <ul class="nav-menu" id="nav-menu">
            <li class="nav-item">
                <a href="/" class="nav-link"><span>• Home</span></a>
            </li>
            <li class="nav-item">
                <a href="/admin" class="nav-link"><span>• Admin</span></a>
            </li>
            <li class="nav-item dropdown">
                <div class="dropdown-btn">
                    <span>• Inteligência Artificial</span>
                    <i class="material-icons">arrow_drop_down</i>
                </div>
                <ul class="dropdown-menu">
                    <li class="dropdown-item">
                        <a href="/api/gpt?apikey=ninja&prompt=Digite%20sua%20pergunta%20aqui&pergunta=Olá" class="dropdown-link">
                            <span>ChatGPT API</span>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <div class="dropdown-btn">
                    <span>• Pesquisas</span>
                    <i class="material-icons">arrow_drop_down</i>
                </div>
                <ul class="dropdown-menu">
                    <li class="dropdown-item">
                        <a href="#" class="dropdown-link"><span>TikTok Stalk</span></a>
                    </li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <div class="dropdown-btn">
                    <span>• Downloads</span>
                    <i class="material-icons">arrow_drop_down</i>
                </div>
                <ul class="dropdown-menu">
                    <li class="dropdown-item">
                        <a href="/api/fbdownload?apikey=ninja&url=https://www.facebook.com/100063912948451/videos/854763336412008/?mibextid=rS40aB7S9Ucbxw6v" class="dropdown-link">
                            <span>Facebook Downloader</span>
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</nav>
<div class="container">
    <div class="header"></div>
    <div class="dashboard">
        <div class="card">
            <div class="card-header">
                <i class="material-icons">language</i>
                <h3 class="card-title">Seu Endereço IP</h3>
            </div>
            <div class="card-body">
                <p>Endereço IP público detectado:</p>
                <div class="card-value" id="ip">Carregando...</div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <i class="material-icons">groups</i>
                <h3 class="card-title">Nossa Comunidade</h3>
            </div>
            <div class="card-body">
                <p>Junte-se à nossa comunidade de desenvolvedores:</p>
                <div class="card-value">+500 membros</div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <i class="material-icons">visibility</i>
                <h3 class="card-title">Total de Visitas</h3>
            </div>
            <div class="card-body">
                <p>Número de acessos a esta página:</p>
                <div class="card-value" id="visitas">0</div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <i class="material-icons">vpn_key</i>
                <h3 class="card-title">Verificar Key</h3>
            </div>
            <div class="card-body">
                <p>Digite sua chave API para verificação:</p>
                <div class="input-group">
                    <input type="text" class="form-input" id="key-input" placeholder="Insira sua chave API">
                    <button class="btn" onclick="verificarKey()">
                        Verificar
                        <i class="material-icons">arrow_forward</i>
                    </button>
                    <div class="status" id="key-status"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                dropdown.classList.toggle('active');
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
            }
        });
    });
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    async function getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            document.getElementById('ip').textContent = data.ip;
        } catch (error) {
            document.getElementById('ip').textContent = 'Erro ao obter IP';
        }
    }
    function updateVisitCounter() {
        let visits = localStorage.getItem('ninjaApiVisits');
        if (!visits) {
            visits = 1;
        } else {
            visits = parseInt(visits) + 1;
        }
        localStorage.setItem('ninjaApiVisits', visits);
        document.getElementById('visitas').textContent = visits;
    }
    async function verificarKey() {
        const keyInput = document.getElementById('key-input').value.trim();
        const keyStatus = document.getElementById('key-status');
        if (!keyInput) {
            keyStatus.innerHTML = '<i class="material-icons">error</i> Bota uma chave aí, véi!';
            keyStatus.style.color = 'var(--accent-color)';
            return;
        }
        keyStatus.innerHTML = '<i class="material-icons">sync</i> Tô verificando...';
        keyStatus.style.color = 'var(--text-secondary)';
        try {
            const resposta = await fetch('/api/verifica-chave?apikey=' + encodeURIComponent(keyInput));
            const dados = await resposta.json();
            if (dados.valida) {
                keyStatus.innerHTML = '<i class="material-icons">check_circle</i> Chave de boa! Sobrou ' + dados.requests + ' requests.';
                keyStatus.style.color = '#4caf50';
            } else {
                keyStatus.innerHTML = '<i class="material-icons">cancel</i> Chave zuada! Sem acesso.';
                keyStatus.style.color = 'var(--accent-color)';
            }
        } catch (erro) {
            keyStatus.innerHTML = '<i class="material-icons">error</i> Deu pau na verificação!';
            keyStatus.style.color = 'var(--accent-color)';
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        getIP();
        updateVisitCounter();
        document.getElementById('key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verificarKey();
            }
        });
    });
</script>
</body>
</html>
`;

const htmlAdmin = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Yanni-APIs</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.1/iconfont/material-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-bg: #0a0a0a;
            --secondary-bg: #151515;
            --accent-color: #d92626;
            --accent-hover: #ff3333;
            --text-primary: #e0e0e0;
            --text-secondary: #a0a0a0;
            --card-bg: #1a1a1a;
            --border-color: #333;
            --highlight: #2a2a2a;
            --transition: all 0.25s ease;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: var(--primary-bg);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
            font-family: 'Comic Neue', cursive;
        }
        .navbar {
            background-color: var(--secondary-bg);
            border-bottom: 1px solid var(--border-color);
            padding: 0 20px;
        }
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
            padding: 0 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: 600;
            color: var(--accent-color);
            letter-spacing: 1px;
        }
        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .title {
            font-size: 42px;
            color: var(--accent-color);
            text-align: center;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .admin-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 25px;
            transition: var(--transition);
        }
        .card:hover {
            border-color: var(--accent-color);
            transform: translateY(-3px);
        }
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .card-header i {
            font-size: 24px;
            color: var(--accent-color);
            margin-right: 10px;
        }
        .card-title {
            font-size: 20px;
            font-weight: 500;
        }
        .form-input {
            width: 100%;
            padding: 12px 15px;
            background-color: var(--secondary-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            color: var(--text-primary);
            font-family: 'Roboto Mono', monospace;
            margin-bottom: 15px;
            transition: var(--transition);
        }
        .form-input:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(217, 38, 38, 0.2);
        }
        .btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Roboto Mono', monospace;
            font-weight: 500;
            width: 100%;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn i {
            margin-left: 8px;
        }
        .btn:hover {
            background-color: var(--accent-hover);
        }
        .status {
            margin-top: 15px;
            font-size: 16px;
            text-align: center;
            min-height: 20px;
        }
        .keys-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .keys-table th, .keys-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        .keys-table th {
            background-color: var(--secondary-bg);
            color: var(--accent-color);
        }
        .keys-table tr:hover {
            background-color: var(--highlight);
        }
    </style>
</head>
<body>
<nav class="navbar">
    <div class="nav-container">
        <div class="logo">YANNI - API</div>
        <a href="/" style="color: var(--text-primary); text-decoration: none;">← Voltar</a>
    </div>
</nav>
<div class="container">
    <h1 class="title">Painel de Administração</h1>
    <div class="admin-section">
        <div class="card">
            <div class="card-header">
                <i class="material-icons">add_circle</i>
                <h3 class="card-title">Adicionar Chave</h3>
            </div>
            <div class="card-body">
                <input type="password" class="form-input" id="add-senha" placeholder="Senha do dono">
                <input type="text" class="form-input" id="add-chave" placeholder="Nova chave API">
                <input type="number" class="form-input" id="add-requests" placeholder="Quantidade de requests" value="100">
                <button class="btn" onclick="adicionarChave()">
                    Adicionar
                    <i class="material-icons">arrow_forward</i>
                </button>
                <div class="status" id="add-status"></div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <i class="material-icons">delete</i>
                <h3 class="card-title">Deletar Chave</h3>
            </div>
            <div class="card-body">
                <input type="password" class="form-input" id="delete-senha" placeholder="Senha do dono">
                <input type="text" class="form-input" id="delete-chave" placeholder="Chave para deletar">
                <button class="btn" onclick="deletarChave()">
                    Deletar
                    <i class="material-icons">arrow_forward</i>
                </button>
                <div class="status" id="delete-status"></div>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="card-header">
            <i class="material-icons">list</i>
            <h3 class="card-title">Lista de Chaves</h3>
        </div>
        <div class="card-body">
            <input type="password" class="form-input" id="list-senha" placeholder="Senha do dono">
            <button class="btn" onclick="listarChaves()">
                Carregar Chaves
                <i class="material-icons">refresh</i>
            </button>
            <div class="status" id="list-status"></div>
            <table class="keys-table" id="keys-table">
                <thead>
                    <tr>
                        <th>Chave</th>
                        <th>Requests</th>
                        <th>Criado Em</th>
                    </tr>
                </thead>
                <tbody id="keys-table-body"></tbody>
            </table>
        </div>
    </div>
</div>
<script>
    async function adicionarChave() {
        const senha = document.getElementById('add-senha').value.trim();
        const chave = document.getElementById('add-chave').value.trim();
        const requests = document.getElementById('add-requests').value.trim();
        const status = document.getElementById('add-status');
        if (!senha || !chave || !requests) {
            status.innerHTML = '<i class="material-icons">error</i> Preenche tudo, véi!';
            status.style.color = 'var(--accent-color)';
            return;
        }
        status.innerHTML = '<i class="material-icons">sync</i> Tô adicionando...';
        status.style.color = 'var(--text-secondary)';
        try {
            const resposta = await fetch('/api/add-chave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha, chave, requests: parseInt(requests) })
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                status.innerHTML = '<i class="material-icons">check_circle</i> Chave adicionada na moral!';
                status.style.color = '#4caf50';
                document.getElementById('add-senha').value = '';
                document.getElementById('add-chave').value = '';
                document.getElementById('add-requests').value = '100';
            } else {
                status.innerHTML = '<i class="material-icons">cancel</i> ' + dados.erro;
                status.style.color = 'var(--accent-color)';
            }
        } catch (erro) {
            status.innerHTML = '<i class="material-icons">error</i> Deu pau ao adicionar!';
            status.style.color = 'var(--accent-color)';
        }
    }
    async function deletarChave() {
        const senha = document.getElementById('delete-senha').value.trim();
        const chave = document.getElementById('delete-chave').value.trim();
        const status = document.getElementById('delete-status');
        if (!senha || !chave) {
            status.innerHTML = '<i class="material-icons">error</i> Preenche tudo, mano!';
            status.style.color = 'var(--accent-color)';
            return;
        }
        status.innerHTML = '<i class="material-icons">sync</i> Tô deletando...';
        status.style.color = 'var(--text-secondary)';
        try {
            const resposta = await fetch('/api/delete-chave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha, chave })
            });
            const dados = await resposta.json();
            if (resposta.ok) {
                status.innerHTML = '<i class="material-icons">check_circle</i> Chave apagada com sucesso!';
                status.style.color = '#4caf50';
                document.getElementById('delete-senha').value = '';
                document.getElementById('delete-chave').value = '';
            } else {
                status.innerHTML = '<i class="material-icons">cancel</i> ' + dados.erro;
                status.style.color = 'var(--accent-color)';
            }
        } catch (erro) {
            status.innerHTML = '<i class="material-icons">error</i> Deu pau ao deletar!';
            status.style.color = 'var(--accent-color)';
        }
    }
    
async function listarChaves() {
    const senha = document.getElementById('list-senha').value.trim();
    const status = document.getElementById('list-status');
    const tableBody = document.getElementById('keys-table-body');
    if (!senha) {
        status.innerHTML = '<i class="material-icons">error</i> Bota a senha, véi!';
        status.style.color = 'var(--accent-color)';
        return;
    }
    status.innerHTML = '<i class="material-icons">sync</i> Carregando chaves...';
    status.style.color = 'var(--text-secondary)';
    try {
        const resposta = await fetch('/api/lista-chaves?senha=' + encodeURIComponent(senha));
        const dados = await resposta.json();
        if (resposta.ok) {
            status.innerHTML = '<i class="material-icons">check_circle</i> Chaves carregadas!';
            status.style.color = '#4caf50';
            tableBody.innerHTML = '';
            if (dados.chaves.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3">Nenhuma chave cadastrada.</td></tr>';
            } else {
                dados.chaves.forEach(chave => {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td>' + chave.chave + '</td><td>' + chave.requests + '</td><td>' + new Date(chave.criadoEm).toLocaleString('pt-BR') + '</td>';
                    tableBody.appendChild(row);
                });
            }
        } else {
            status.innerHTML = '<i class="material-icons">cancel</i> ' + dados.erro;
            status.style.color = 'var(--accent-color)';
            tableBody.innerHTML = '';
        }
    } catch (erro) {
        status.innerHTML = '<i class="material-icons">error</i> Deu pau ao carregar!';
        status.style.color = 'var(--accent-color)';
        tableBody.innerHTML = '';
    }
}
</script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(htmlHome);
});

app.get('/admin', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(htmlAdmin);
});

async function pegaChaves() {
  try {
    const dados = await fs.readJson(ARQUIVO_CHAVES);
    return dados.chaves || [];
  } catch (erro) {
    console.log('Deu ruim ao carregar chaves:', erro);
    return [];
  }
}

async function salvaChaves(chaves) {
  try {
    await fs.writeJson(ARQUIVO_CHAVES, { chaves }, { spaces: 2 });
  } catch (erro) {
    console.log('Deu ruim ao salvar chaves:', erro);
    throw new Error('Não rolou salvar as chaves');
  }
}

app.post('/api/add-chave', checaDono, async (req, res) => {
  try {
    const { chave, requests } = req.body;
    if (!chave) {
      return res.status(400).json({ erro: 'Manda uma chave, por favor!' });
    }
    const chaves = await pegaChaves();
    if (chaves.find(c => c.chave === chave)) {
      return res.status(400).json({ erro: 'Essa chave já tá na área!' });
    }
    chaves.push({
      chave,
      requests: requests || 100,
      criadoEm: new Date().toISOString()
    });
    await salvaChaves(chaves);
    res.status(201).json({ mensagem: 'Chave adicionada na moral!', chave: { chave, requests } });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

app.post('/api/delete-chave', checaDono, async (req, res) => {
  try {
    const { chave } = req.body;
    if (!chave) {
      return res.status(400).json({ erro: 'Qual chave tu quer apagar, mano?' });
    }
    const chaves = await pegaChaves();
    const novasChaves = chaves.filter(c => c.chave !== chave);
    if (chaves.length === novasChaves.length) {
      return res.status(400).json({ erro: 'Não achei essa chave!' });
    }
    await salvaChaves(novasChaves);
    res.json({ mensagem: 'Chave apagada com sucesso!' });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

app.get('/api/lista-chaves', checaDono, async (req, res) => {
  try {
    const chaves = await pegaChaves();
    res.json({ chaves });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

app.get('/api/verifica-chave', async (req, res) => {
  try {
    const { apikey } = req.query;
    if (!apikey) {
      return res.status(400).json({ erro: 'Manda a chave, por favor!' });
    }
    const chaves = await pegaChaves();
    const chaveEncontrada = chaves.find(c => c.chave === apikey);
    if (!chaveEncontrada) {
      return res.status(400).json({ erro: 'Chave inválida, irmão!' });
    }
    res.json({ valida: true, requests: chaveEncontrada.requests });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Rota de exemplo pra API GPT
app.get('/api/gpt', async (req, res) => {
  try {
    const { apikey, prompt } = req.query;
    if (!apikey || !prompt) {
      return res.status(400).json({ erro: 'Faltou chave ou prompt, meu!' });
    }
    const chaves = await pegaChaves();
    const chaveEncontrada = chaves.find(c => c.chave === apikey);
    if (!chaveEncontrada) {
      return res.status(400).json({ erro: 'Chave inválida!' });
    }
    if (chaveEncontrada.requests <= 0) {
      return res.status(400).json({ erro: 'Acabou os requests dessa chave!' });
    }
    chaveEncontrada.requests -= 1;
    await salvaChaves(chaves);
    res.json({
      mensagem: 'Beleza, request foi!',
      prompt,
      requestsRestantes: chaveEncontrada.requests,
      resposta: `Resposta fake pro prompt: ${prompt}`
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Rota de exemplo pra download do Facebook 
app.get('/api/fbdownload', async (req, res) => {
  try {
    const { apikey, url } = req.query;
    if (!apikey || !url) {
      return res.status(400).json({ erro: 'Faltou chave ou URL, meu!' });
    }
    const chaves = await pegaChaves();
    const chaveEncontrada = chaves.find(c => c.chave === apikey);
    if (!chaveEncontrada) {
      return res.status(400).json({ erro: 'Chave inválida!' });
    }
    if (chaveEncontrada.requests <= 0) {
      return res.status(400).json({ erro: 'Sem requests sobrando!' });
    }
    chaveEncontrada.requests -= 1;
    await salvaChaves(chaves);
    res.json({
      mensagem: 'Download na faixa!',
      url,
      requestsRestantes: chaveEncontrada.requests,
      resposta: `Download fake pra URL: ${url}`
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
});

// Liga o servidor
app.listen(PORTA, () => {
  console.log(`Server tá de pé na porta ${PORTA}, bora!`);
});