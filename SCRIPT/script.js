(function () {
    // Seleções
    const horasEl = document.getElementById('horas');
    const minutosEl = document.getElementById('minutos');
    const segundosEl = document.getElementById('segundos');
    const diaSemanaEl = document.getElementById('diaSemana');
    const diaEl = document.getElementById('dia');
    const mesEl = document.getElementById('mes');
    const anoEl = document.getElementById('ano');
    const themeCheckbox = document.getElementById('foo');
    const saudacoesEl = document.getElementById('saudacoes');
    const periodoEl = document.getElementById('periodo');
    const climaImg = document.querySelector('.header-main img');
    // Performance/accessibility: solicita carregamento lazy para ícones grandes em dispositivos móveis
    if (climaImg && !climaImg.getAttribute('loading')) climaImg.setAttribute('loading', 'lazy');

    const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    function pad(n) { return n.toString().padStart(2, '0'); }

    function atualizarRelogio() {
        const agora = new Date();
        horasEl.textContent = pad(agora.getHours());
        minutosEl.textContent = pad(agora.getMinutes());
        segundosEl.textContent = pad(agora.getSeconds());

        diaSemanaEl.textContent = nomesDias[agora.getDay()];
        diaEl.textContent = pad(agora.getDate());
        mesEl.textContent = nomesMeses[agora.getMonth()];
        anoEl.textContent = agora.getFullYear();
        atualizarSaudacao(agora.getHours());
        atualizarClimaVisual(agora.getHours());
    }

    function atualizarSaudacao(hora) {
        if (!saudacoesEl) return;
        let texto = 'Olá';
        if (hora >= 5 && hora < 12) texto = 'Bom dia!';
        else if (hora >= 12 && hora < 18) texto = 'Boa tarde!';
        else texto = 'Boa noite!';
        saudacoesEl.textContent = texto;
    }

    // Atualiza temperatura (exemplo) e ícone do clima conforme período do dia
    function atualizarClimaVisual(hora) {
        if (!periodoEl && !climaImg) return;
        let temp = 25;
        let icon = 'ASSETS/IMG/dia-nublado.png';
        if (hora >= 5 && hora < 12) { // manhã
            temp = 22;
            // arquivo disponível: 'ensolarado.png' no diretório ASSETS/IMG
            icon = 'ASSETS/IMG/ensolarado.png';
        } else if (hora >= 12 && hora < 18) { // tarde
            temp = 28;
            icon = 'ASSETS/IMG/dia-nublado.png';
        } else { // noite
            temp = 19;
            icon = 'ASSETS/IMG/noite.png';
        }
        if (periodoEl) periodoEl.textContent = temp + 'º';
        if (climaImg) {
            climaImg.src = icon;
            climaImg.alt = 'Ícone do clima';
        }
    }

    // Tema
    // Aplica o tema sem animação (persistente)
    function applyTheme(isDark) {
        document.body.classList.toggle('dark', !!isDark);
        try { localStorage.setItem('prefers-dark', !!isDark); } catch (e) { }
        if (themeCheckbox) themeCheckbox.checked = !!isDark;
    }

    // Acessibilidade: garante que o controle de tema tenha label para leitores de tela
    if (themeCheckbox && !themeCheckbox.getAttribute('aria-label')) {
        themeCheckbox.setAttribute('aria-label', 'Alternar tema claro e escuro');
    }

    // Faz a transição de tema com slide (1s) usando overlays CSS. O overlay usa as variáveis
    // --header-slide e --footer-slide (definidas dinamicamente aqui).
    function animateThemeToggle(targetIsDark) {
        // cores/gradientes usados pelo CSS para cada tema (devem acompanhar :root e body.dark)
        const lightBg = 'linear-gradient(135deg, #e7e8bb 0%, #ffffff 100%)';
        const darkBg = 'linear-gradient(135deg, #0f172a 0%, #071026 100%)';

        const overlayBg = targetIsDark ? darkBg : lightBg;

        // atualiza o estado do checkbox imediatamente para feedback do controle
        if (themeCheckbox) themeCheckbox.checked = !!targetIsDark;

        // define a cor/gradiente do overlay full-screen
        document.documentElement.style.setProperty('--overlay-color', overlayBg);

        // inicia deslize (overlay vai de -100% para +100% em 1s)
        document.body.classList.add('theme-animate');

        // aplicamos o tema um pouco antes do ponto médio para sincronizar melhor
        setTimeout(function () {
            applyTheme(targetIsDark);
        }, 350);

        // ao final (1s) removemos a classe de animação e limpamos variável
        setTimeout(function () {
            document.body.classList.remove('theme-animate');
            // limpar overlay depois da animação
            document.documentElement.style.removeProperty('--overlay-color');
        }, 1000);
    }

    function initTheme() {
        let pref = null;
        try { pref = localStorage.getItem('prefers-dark'); } catch (e) { }
        if (pref !== null) {
            applyTheme(pref === 'true');
            return;
        }
        // Sem preferência: usar o matchMedia
        const darkMatch = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(darkMatch);
    }

    // listeners
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', function (e) {
            animateThemeToggle(!!e.target.checked);
        });
    }

    // Responsividade: caso o usuário troque a preferência do sistema enquanto a página está aberta,
    // sincronizamos o tema. Isso ajuda em dispositivos que mudam esquema ao entrar em modo noturno.
    if (window.matchMedia) {
        try {
            const m = window.matchMedia('(prefers-color-scheme: dark)');
            m.addEventListener && m.addEventListener('change', function (evt) {
                // só aplicar se não houver preferência explícita gravada
                let pref = null;
                try { pref = localStorage.getItem('prefers-dark'); } catch (e) { }
                if (pref === null) applyTheme(evt.matches);
            });
        } catch (err) { /* browsers antigos podem falhar ao registrar listener; silencioso */ }
    }

    // Inicializações
    initTheme();
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);

})();
