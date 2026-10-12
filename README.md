# Detetive QR — starter do aplicativo

## O que está incluído
- `index.html`: interface responsiva em português.
- `app.js`: protótipo local com cartas, distribuição, leitura de QR, pistas de demonstração, hipóteses e acusação.
- `manifest.json` e `sw.js`: base para instalação como PWA.
- `schema.sql`: esboço inicial do banco de dados para o futuro modo multiplayer.
- `../Detetive_QR_40_cartas_prototipo.pdf` e CSV: materiais físicos criados separadamente.

## Como testar
1. Extraia a pasta para o computador.
2. Para testar sem câmera, abra `index.html` e use o restante da interface. Alguns navegadores bloqueiam a câmera em arquivos locais.
3. Para leitura por câmera e instalação PWA, hospede os arquivos em HTTPS ou rode um servidor local. Exemplo com Python instalado:
   `python -m http.server 8000`
   depois abra `http://localhost:8000`.
4. A leitura de QR usa a biblioteca `html5-qrcode` carregada de CDN, então a primeira carga precisa de internet.

## Limitações importantes
Esta é uma prova de conceito local, NÃO o multiplayer completo. O estado da partida só existe no navegador que criou o jogo. Não sincroniza outros celulares, não oferece mãos privadas seguras e as pistas são textos demonstrativos que não garantem consistência lógica com a solução. Não use em partidas competitivas nem publique como versão final.

## Próxima fase: multiplayer real
1. Criar projeto Supabase e configurar URL/chave pública no cliente.
2. Criar funções server-side para criar sala, entrar, iniciar partida, distribuir cartas, pedir pista e fazer acusação.
3. Guardar a combinação secreta e mãos privadas exclusivamente no servidor.
4. Aplicar políticas RLS restritivas e validar todas as ações no servidor.
5. Adicionar sincronização em tempo real, autenticação por código de sala e testes de segurança.

Nunca coloque a chave `service_role` do Supabase no navegador. A chave pública `anon`/publishable não substitui políticas de segurança.
