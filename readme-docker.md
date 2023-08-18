## Gerar Nova Versão no Docker

1. Faça as alterações no código da aplicação.
2. Certifique-se de que o Dockerfile está configurado corretamente.
3. Abra o terminal no diretório do projeto.
4. Execute o comando para construir uma nova imagem com uma nova tag (versão):

   ```bash
   docker build -t mundiapp-api:2.1.1 .
   ```

Substitua 2.0 pela nova versão.

## Enviar Nova Versão para o Amazon ECR

1. Configure o AWS CLI e suas credenciais.
2. Faça login no Amazon ECR:

    ```bash 
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 130605633311.dkr.ecr.us-east-1.amazonaws.com/mundiapp
    ```
    
3. Marque a imagem com o nome do repositório ECR:

    ```bash 
    docker 130605633311.dkr.ecr.us-east-1.amazonaws.com/mundiapp/mundiapp-api:2.0
    ```

4. Faça push da imagem para o ECR:

    ```bash 
    docker push 130605633311.dkr.ecr.us-east-1.amazonaws.com/mundiapp/mundiapp-api:2.0
    ```

## Atualizar Versão em Execução

1. No servidor Linux, pare o contêiner atual:

    ```bash 
    docker stop mundiapp-api
    ```
2. Remova o contêiner antigo:

    ```bash 
    docker rm mundiapp-api
    ```
3. Inicie o novo contêiner com a versão atualizada:

    ```bash 
    docker run -d -p -e DB_PORT= 3000:3000 mundiapp-api:2.1.1
    ```




















