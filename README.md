1. Para adicionar as dependências, use:
    ```bash
    npm config set strict-ssl false (se necessário)
    npm install
    ```

2. Execute o restore do Banco de dados:
    - Abra o arquivo `script.sql` no Workbench e execute.

3. Crie o arquivo `.env` com as seguintes chaves:
    ```plaintext
    DB_HOST        = ??????            
    DB_USER        = ??????            
    DB_PASSWORD    = ??????    
    DB_PASSWORDITB = ?????? 
    DB_NAME        = ??????          
    BD_PORTITB     = ??????     
    BD_PORT        = ??????    
    APP_PORT       = ??????
    EMAIL_USER     = ??????
    EMAIL_PASS     = ??????
    SECRET_KEY     = ??????
    URL_BASE       = ??????
    ```

4. Usuários cadastrados:

    **Administrador**
    - Nome: Helvética
    - Nome de usuário: helvinha
    - Email: helvinh@gmail.com
    - Senha: Teste@123

    **Comum**
    - Nome: Ana Julia
    - Nome de usuário: anajulia
    - Email: ana@julia.com
    - Senha: 12345Aa@

