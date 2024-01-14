## Gerar Nova Versão no Docker

1. Faça as alterações no código da aplicação.
2. Certifique-se de que o Dockerfile está configurado corretamente.
3. Abra o terminal no diretório do projeto.
4. Execute o comando para construir uma nova imagem com uma nova tag (versão):

   ```bash
   docker build -t mundiapp-api:1.0 .
   ```

Substitua 1.0 pela nova versão.

## Atualizar Versão em Execução

1. Remova o contêiner antigo:

    ```bash 
    docker rm -f mundiapp-api
    ```
2. Inicie o novo contêiner com a versão atualizada:

    ```bash 
    docker run --name mundiapp-api -d -p 80:3000 -e ACCESS_TOKEN_SECRET="fHeTcSZf6234jfvwm0k6391605eb4cfd" -e DB_HOST=mundiapp.ct3amoxtka8w.us-east-1.rds.amazonaws.com -e DB_USER=admin -e DB_PASSWORD='xobanIj6mLTH*n=#?!br' -e DB_DATABASE=mundidb -e DB_PORT=3306 mundiapp-api:1.0
    ```




















